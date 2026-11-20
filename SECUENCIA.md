# 🪜 LA SECUENCIA (de 0 a entregado)

Los pasos **en el orden en que se hacen**, cada uno con su **✅ comprobación**.
Regla de oro: **no pases al siguiente paso si la comprobación falla.** Así, si algo se rompe, sabes que fue el último paso.

El texto de cada archivo está en **[DESDE-CERO.md](DESDE-CERO.md)**. Aquí está el **orden** y el **porqué**.

```
 FASE 1  BASE DE DATOS     docker ──► .env (la dirección)
            │
 FASE 2  PROYECTO NODE     npm init ──► npm install
            │
 FASE 3  CONECTAR PRISMA   prisma.config.js + src/prisma.js
            │
 FASE 4  TABLAS            schema ──► migrate ──► generate ──► seed
            │
 FASE 5  BACKEND           index.js base ──► una ruta ──► probar ──► otra ruta…
            │
 FASE 6  FRONTEND          .env ──► login ──► lista ──► guardar
            │
 FASE 7  ENTREGAR          checklist ──► git
```

---

## FASE 0 · Antes de escribir nada

**Paso 0. Leer el front y revisar las herramientas**
- Abre el front que te dan (⚠️ **no trae `fetch` ni `.env`**, solo comentarios `TODO`) y anota en un papel:
  - **puerto**: busca `localhost` en los comentarios `TODO`. Si no aparece, usa **8000**.
  - **rutas + método**: busca **`TODO`** (`Ctrl+Shift+F`). Cada TODO es una ruta:
    "obtener/listar" → **GET** · "enviar/crear/validar" → **POST** · "modificar" → **PUT** (o POST si dicen "solo GET y POST")
  - **campos**: busca **`name=`** → los inputs del modal (`XxxModal.jsx`). Confírmalos con las columnas de la tabla (`XxxTable.jsx`).
  - **tipos**: `type="number"` → `Int` · text/textarea/url → `String` · checkbox → `Boolean` · date → `DateTime` · sin `required` → `String?`
  - **¿id lo escribe el usuario?**: si hay un input `name="id"` → `@id` sin autoincrement.
  - **reglas**: del **enunciado** (¿solo GET y POST?, ¿qué no se repite → 409?, ¿qué es obligatorio → 400?)
- Revisa con la tabla de la sección 0 de DESDE-CERO: `node -v`, `docker ps`, puertos libres y espacio.

✅ Tienes el papel con puerto, rutas, campos y reglas, y `docker ps` muestra una tabla.

> 💡 **Por qué primero:** los campos del front deciden tu `schema`, y las rutas deciden tu `index.js`. Si no los anotas, escribes a ciegas.

---

## FASE 1 · La base de datos (Docker)

**Paso 1. Crear la carpeta**
```powershell
mkdir backend
```
```powershell
cd backend
```

**Paso 2. Escribir `docker-compose.yml`** y elegir 3 cosas: `container_name`, `POSTGRES_DB` y el puerto izquierdo.

**Paso 3. Prender la BD**
```powershell
docker compose up -d
```
✅ Dice `Started`. Con `docker ps` aparece tu contenedor con `0.0.0.0:5436->5432`.

**Paso 4. Escribir `.env`** con la dirección de esa BD:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5436/examen"
```
✅ Compara con el compose: `5436` = puerto izquierdo y `examen` = `POSTGRES_DB`. **Lee las dos líneas lado a lado.**

> 💡 **Por qué Docker primero:** es lo único que no depende de nada. Así los pasos siguientes (migrate) ya tienen a quién conectarse.

---

## FASE 2 · El proyecto Node

**Paso 5. Crear el `package.json`**
```powershell
npm init -y
```
```powershell
npm pkg set type=module "scripts.dev=nodemon src/index.js" "scripts.start=node src/index.js"
```

**Paso 6. Instalar dependencias** (⚠️ `@7`)
```powershell
npm install express cors dotenv pg @prisma/client@7 @prisma/adapter-pg@7
```
```powershell
npm install -D nodemon prisma@7
```

**Paso 7. Crear las carpetas y el `.gitignore`**
```powershell
mkdir src, prisma
```
Escribe `.gitignore` (`node_modules` y `.env`).

✅ `cat package.json` muestra `"type": "module"`, `"dev"` y `prisma` en `^7`. Existe la carpeta `node_modules`.

---

## FASE 3 · Conectar Prisma con la BD

**Paso 8. Escribir `prisma.config.js`** (🔴 tal cual). Le dice a `npx prisma` dónde están el schema, las migraciones, el seed y la BD (lee el `.env`).

**Paso 9. Escribir `src/prisma.js`** (🔴 tal cual). Es la conexión que usarán `index.js` y `seed.js`.

✅ Los dos archivos existen en su lugar: `prisma.config.js` en la raíz de `backend/` y `prisma.js` dentro de `src/`.

> 💡 Todavía no se puede probar la conexión: falta tener tablas. Eso se comprueba en el paso 11.

---

## FASE 4 · Las tablas

**Paso 10. Escribir `prisma/schema.prisma`** con los **campos que anotaste del front**:
- `model Usuario` si hay login
- un `model` por cada cosa que se lista o guarda

**Paso 11. Crear las tablas en la BD** (aquí se prueba **la conexión**)
```powershell
npx prisma migrate dev --name init
```
✅ Dice `Your database is now in sync with your schema`.
Si dice `Can't reach database server` → vuelve a la FASE 1 (¿Docker prendido? ¿puerto del `.env`?).

✅ Mira las tablas **dentro de Docker** (cambia `examen-pg` y `examen` por los tuyos):
```powershell
docker exec examen-pg psql -U postgres -d examen -c "\dt"
```
Tienen que aparecer tus tablas y `_prisma_migrations`.

**Paso 12. Generar el cliente** (crea `prisma.usuario`, `prisma.cosa`…)
```powershell
npx prisma generate
```
✅ Dice `Generated Prisma Client (v7...)`.

**Paso 13. Escribir `prisma/seed.js` y cargar los datos**
```powershell
npx prisma db seed
```
✅ Dice `Seed terminado`. Para verlos (con comillas dobles en el nombre de la tabla):
```powershell
docker exec examen-pg psql -U postgres -d examen -c 'SELECT * FROM "Usuario";'
```
O, con interfaz: `npx prisma studio`.

> 💡 **Orden fijo: migrate → generate → seed.** El seed usa el cliente (generate), y el cliente necesita las tablas (migrate).
> Si después cambias el schema, repite: `migrate dev --name cambio` → `generate` → reinicia el backend.

---

## FASE 5 · El backend (ruta por ruta)

**Paso 14. Escribir el `index.js` BASE**, sin rutas todavía: imports, `cors()`, `express.json()` y `app.listen(PUERTO)`.
```powershell
npm run dev
```
✅ Dice `Backend en http://localhost:8000` y no hay errores en rojo. **Deja esta terminal abierta** (nodemon reinicia solo al guardar).

**Paso 15. Agregar UNA ruta → probarla → la siguiente.** Orden recomendado:

| # | Ruta | Probar en otra terminal |
|---|---|---|
| 1 | `POST /login` | `Invoke-RestMethod http://localhost:8000/login -Method Post -ContentType "application/json" -Body '{"usuario":"admin","password":"123"}'` |
| 2 | `GET /cosas` (lista) | `Invoke-RestMethod http://localhost:8000/cosas` |
| 3 | `GET /cosas/:id` | `Invoke-RestMethod http://localhost:8000/cosas/1` |
| 4 | `POST /cosas` (crear) | `Invoke-RestMethod http://localhost:8000/cosas -Method Post -ContentType "application/json" -Body '{"nombre":"Tres"}'` |
| 5 | `PUT /cosas/:id` (editar) | `Invoke-RestMethod http://localhost:8000/cosas/1 -Method Put -ContentType "application/json" -Body '{"nombre":"Nuevo"}'` |

Cada ruta sigue el molde de 5 pasos (README, sección 4).
✅ Cada una responde bien. Prueba también **un caso malo** (body vacío → 400, id 99 → 404).

> 💡 **Por qué una por una:** si escribes las 5 y algo falla, no sabes cuál fue. Con una a la vez, el error siempre está en lo último que escribiste.
> (`Invoke-RestMethod` muestra los errores 4xx en rojo; eso es normal si probabas un caso malo.)

---

## FASE 6 · El frontend

**Paso 16. Prepararlo** (otra terminal, en la carpeta del front)
```powershell
npm install
```
- **Crea** `.env` en la raíz del front (no viene) → `VITE_API_URL=http://localhost:8000` (🔗 = `app.listen`)
- `src/constants.js` → `export const API_URL = import.meta.env.VITE_API_URL`
```powershell
npm run dev
```
✅ Abre `http://localhost:5173` y se ve el login.

**Paso 17. Login** (`handleSubmit` con `fetch POST`, como en `LoginPage.jsx`)
✅ admin/123 entra · una password mala muestra el mensaje rojo.

**Paso 18. Lista** (`cargar()` + `useEffect`, como en `MainPage.jsx`)
✅ Al entrar se ven los datos del seed.

**Paso 19. Guardar** (`fetch POST/PUT` → `cargar()` → cerrar)
✅ Crear y editar actualizan la tabla **sin recargar**, y un error (409/400) se ve en rojo.

> 💡 Si cambias el `.env` del front, **reinicia `npm run dev`**: Vite solo lo lee al arrancar.
> Si algo no anda: **F12 → pestaña Red (Network)**, y mira la URL, el método y la respuesta del fetch.

---

## FASE 7 · Entregar

**Paso 20.** Repasa el checklist final de DESDE-CERO (sección 5).

**Paso 21.** Crea `.env.example` (igual que `.env`) para que el profe sepa qué poner.

**Paso 22.** Si piden git:
```powershell
git add .
```
```powershell
git commit -m "examen"
```
```powershell
git push
```
✅ En GitHub **no** aparecen `node_modules` ni `.env`.

---

## 🧭 Si algo falla: ¿en qué fase estoy?

| Síntoma | Vuelve a |
|---|---|
| `Can't reach database server` | FASE 1 (Docker / puerto del `.env`) |
| `Cannot use import statement` / falta `@7` | FASE 2 |
| `does not provide an export named 'PrismaClient'` | Paso 12 (`generate`) |
| `prisma.cosa` es `undefined` | el nombre del `model` (en minúscula) y el Paso 12 |
| la ruta responde 404 `Cannot GET` | FASE 5: ruta o método mal escritos |
| el front no carga datos / error CORS | Paso 14 (`cors()`) y Paso 16 (`.env` del front) |

Tabla completa de errores → **README.md, sección 5**.
