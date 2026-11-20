# 🏗️ DESDE CERO (si no puedes copiar el molde)

Todo lo que hay que **verificar**, **instalar** y **escribir**, en orden.
Los comandos son para **PowerShell**. Marca cada ✅ al avanzar.

---

## 0. Verificar ANTES de empezar (2 min)

| ✅ | Qué | Comando | Tiene que salir |
|---|---|---|---|
| ☐ | Node instalado | `node -v` | `v20.19` o más (tú tienes v24) |
| ☐ | npm instalado | `npm -v` | cualquier número |
| ☐ | Docker instalado | `docker -v` | `Docker version ...` |
| ☐ | **Docker Desktop PRENDIDO** | `docker ps` | una tabla (aunque vacía). Si da error → abre Docker Desktop y espera la ballena verde |
| ☐ | Puerto de la BD libre | `netstat -ano \| findstr :5436` | **nada** (si sale algo, usa otro: 5437, 5438…) |
| ☐ | Puerto del backend libre | `netstat -ano \| findstr :8000` | **nada** (si sale algo, ciérralo o usa otro) |
| ☐ | Espacio en disco | `"{0:N1} GB" -f ((Get-PSDrive C).Free/1GB)` | **más de 2 GB** |
| ☐ | Leí el front que me dan | — | anoté: **puerto** (`localhost` en los `TODO`, si no 8000), **rutas** (cada `TODO`), **campos** (los `name=` del modal), **reglas** (enunciado). Detalle → SECUENCIA, Paso 0 |

> Si el puerto de la BD está ocupado por otro proyecto tuyo: en esa carpeta `docker compose down`.

---

## 1. Crear el backend (carpeta + dependencias)

Párate **al lado** de la carpeta del frontend (no adentro):

```powershell
mkdir backend
```
```powershell
cd backend
```
```powershell
npm init -y
```
Pone `"type": "module"` y los scripts **sin abrir el archivo**:
```powershell
npm pkg set type=module "scripts.dev=nodemon src/index.js" "scripts.start=node src/index.js"
```
Dependencias (⚠️ **con `@7`** las de prisma, si no, no funciona):
```powershell
npm install express cors dotenv pg @prisma/client@7 @prisma/adapter-pg@7
```
```powershell
npm install -D nodemon prisma@7
```
Carpetas:
```powershell
mkdir src, prisma
```

**Verificar:** `cat package.json` → tiene `"type": "module"`, `"dev"`, y `prisma` / `@prisma/client` en versión `^7`.

| Paquete | Para qué |
|---|---|
| `express` | el servidor y las rutas |
| `cors` | que el front (otro puerto) pueda hablarle |
| `dotenv` | leer el `.env` |
| `pg` + `@prisma/adapter-pg` | conectarse a PostgreSQL |
| `@prisma/client` | `prisma.videojuego.findMany()` etc. |
| `prisma` (dev) | los comandos `npx prisma ...` |
| `nodemon` (dev) | reinicia solo al guardar |

---

## 2. Escribir los archivos (en este orden)

### `backend/.gitignore`
```
node_modules
.env
```

### `backend/docker-compose.yml`
```yaml
name: examen                      # 🟢
services:
  postgres:
    image: postgres:18
    container_name: examen-pg     # 🟢 único en tu PC
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: examen         # 🟢🔗 .env
    ports:
      - "5436:5432"               # 🟢🔗 solo el izquierdo → .env
    volumes:
      - pgdata:/var/lib/postgresql
volumes:
  pgdata:
```

### `backend/.env`
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5436/examen"
PORT=8000
```
🔗 `5436` = puerto izquierdo del compose · `examen` = `POSTGRES_DB`

### `backend/prisma.config.js` (🔴 tal cual)
```js
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations", seed: "node prisma/seed.js" },
  datasource: { url: env("DATABASE_URL") },
});
```

### `backend/src/prisma.js` (🔴 tal cual)
```js
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
export const prisma = new PrismaClient({ adapter });
```

### `backend/prisma/schema.prisma` (🟢 tus tablas)
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

model Usuario {
  id       Int    @id @default(autoincrement())
  usuario  String @unique
  password String
}

model Cosa {                         // 🟢 → prisma.cosa
  id     Int    @id @default(autoincrement())
  nombre String                      // 🟢 los campos de los inputs del front
}
```
Tipos: `String` · `Int` · `Boolean` · `Float` · `DateTime @default(now())` · opcional `String?` · no repetir `@unique`

### `backend/prisma/seed.js` (🟢 tus datos)
```js
import { prisma } from "../src/prisma.js";

if ((await prisma.usuario.count()) === 0) {
  await prisma.usuario.create({ data: { usuario: "admin", password: "123" } });
}
if ((await prisma.cosa.count()) === 0) {
  await prisma.cosa.createMany({ data: [{ nombre: "Uno" }, { nombre: "Dos" }] });
}

console.log("Seed terminado");
await prisma.$disconnect();
```

### `backend/src/index.js` (🟢 tus rutas)
```js
import "dotenv/config";
import express from "express";
import cors from "cors";
import { prisma } from "./prisma.js";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/login", async (req, res) => {
  const { usuario, password } = req.body;
  if (!usuario || !password) return res.status(400).json({ message: "Faltan datos" });
  const user = await prisma.usuario.findFirst({ where: { usuario, password } });
  if (!user) return res.status(401).json({ message: "Usuario o password incorrectos" });
  res.json({ message: "Login correcto" });
});

app.get("/cosas", async (req, res) => {
  res.json(await prisma.cosa.findMany({ orderBy: { id: "asc" } }));
});

// + las demás rutas: copia el molde de 5 pasos de README.md (sección 4)

app.listen(8000, () => console.log("Backend en http://localhost:8000"));
```

---

## 3. Levantar (en `backend/`, en este orden)

| # | Comando | Verificar que diga |
|---|---|---|
| 1 | `docker compose up -d` | `Started` |
| 2 | `npx prisma migrate dev --name init` | `in sync with your schema` |
| 3 | `npx prisma generate` | `Generated Prisma Client` |
| 4 | `npx prisma db seed` | `Seed terminado` |
| 5 | `npm run dev` | `Backend en http://localhost:8000` |

**Probar el backend solo** (otra terminal):
```powershell
Invoke-RestMethod http://localhost:8000/cosas
```
```powershell
Invoke-RestMethod http://localhost:8000/login -Method Post -ContentType "application/json" -Body '{"usuario":"admin","password":"123"}'
```
Ver la BD con ojos (opcional): `npx prisma studio`

> Si cambias el `schema.prisma` después: `npx prisma migrate dev --name cambio` y `npx prisma generate`, y reinicia `npm run dev`.

---

## 4. El frontend

### A) Te dan el front (lo normal)
En la carpeta del front:
```powershell
npm install
```
Revisa/crea su `.env` → `VITE_API_URL=http://localhost:8000` (🔗 = `app.listen`). Luego:
```powershell
npm run dev
```
Escribe los `fetch` como en `frontend/src/pages/` (y `src/constants.js` con `export const API_URL = import.meta.env.VITE_API_URL`).

### B) Tienes que crear el front tú (raro)
Al lado de `backend/`:
```powershell
npm create vite@latest frontend -- --template react
```
```powershell
cd frontend
```
```powershell
npm install
```
```powershell
npm install react-router-dom
```
```powershell
npm install -D tailwindcss @tailwindcss/vite
```
Luego:
- `vite.config.js` → `plugins: [react(), tailwindcss()]` (con `import tailwindcss from '@tailwindcss/vite'`)
- `src/index.css` → borrar todo y dejar solo `@import "tailwindcss";`
- `src/main.jsx` → envolver `<App />` en `<BrowserRouter>` (de `react-router-dom`)
- `src/App.jsx` → `<Routes><Route path="/" element={<LoginPage />} /><Route path="/main" element={<MainPage />} /></Routes>`
- `.env` y `src/constants.js` como en A)

---

## 5. ✅ Checklist final (antes de entregar)

- ☐ `docker ps` muestra mi contenedor
- ☐ El backend arranca sin error con `npm run dev`
- ☐ `Invoke-RestMethod` de cada ruta responde bien
- ☐ Login bueno entra · login malo muestra mensaje rojo
- ☐ La lista carga al abrir la página
- ☐ Crear / editar actualiza la tabla sin recargar
- ☐ Los errores (400/404/409) se ven en rojo
- ☐ `.env` NO se sube (está en `.gitignore`) · sí subo `.env.example`
- ☐ Si piden git: `git add .` → `git commit -m "examen"` → `git push`

Si algo falla → tabla de errores en **README.md, sección 5**.
