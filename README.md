# 🧩 MOLDE DEL EXAMEN

Un proyecto completo y funcionando: **login + listar (con filtro) + ver uno + crear + editar**.
En el examen: **copia, cambia lo 🟢 y deja lo 🔴.**

> 🏗️ ¿No puedes copiar el molde? → **[DESDE-CERO.md](DESDE-CERO.md)**: qué verificar, todos los comandos de instalación y cada archivo escrito, en orden.
> 🪜 ¿En qué orden hago todo? → **[SECUENCIA.md](SECUENCIA.md)**: 22 pasos desde 0, cada uno con su comprobación.

> 📦 Los demás ejercicios resueltos (varios backend + frontend, teoría y quiz) → https://github.com/ssalex88/resueltos-examen

```powershell
git clone https://github.com/ssalex88/molde-examen MOLDE-EXAMEN
```

```
MOLDE-EXAMEN/
├── README.md                (esta guía)
├── DESDE-CERO.md            ← si no puedes copiar: verificar + instalar + escribir
├── SECUENCIA.md             ← el ORDEN paso a paso (docker → conectar → tablas → rutas → front)
├── backend/
│   ├── docker-compose.yml   📋 la BD
│   ├── .env / .env.example  📋 dirección de la BD
│   ├── prisma.config.js     📋 (no tocar)
│   ├── package.json         📋 "type": "module" + scripts
│   ├── prisma/
│   │   ├── schema.prisma    ✍️ las tablas
│   │   └── seed.js          ✍️ datos iniciales
│   └── src/
│       ├── prisma.js        📋 (no tocar)
│       └── index.js         ✍️ las rutas
└── frontend/
    ├── .env                 📋 dirección del backend (copia .env.example → .env)
    └── src/
        ├── constants.js     📋 (no tocar)
        └── pages/
            ├── LoginPage.jsx  ✍️ molde de POST (formulario)
            └── MainPage.jsx   ✍️ molde de GET (lista) + POST/PUT (guardar)
```
📋 = copiar · ✍️ = escribir/adaptar · 🟢 = cambiar · 🔴 = no tocar · 🔗 = tiene que coincidir

---

## 1. Prender el molde (para verlo funcionar)

Terminal 1, en `backend/` (primero copia `.env.example` → `.env`):
```powershell
npm install
docker compose up -d
npx prisma migrate dev --name init
npx prisma generate
npx prisma db seed
npm run dev
```
Terminal 2, en `frontend/` (primero copia `.env.example` → `.env`):
```powershell
npm install
npm run dev
```
Entra con **admin / 123**.

---

## 2. Usarlo en el examen (otro tema, ej. "libros")

1. **Mira el front que te dan** (no trae `fetch` ni `.env`) y anota: puerto (`localhost` en los `TODO`, si no 8000), rutas (cada `TODO`), campos (los `name=` del modal) y reglas (enunciado). Cómo → SECUENCIA, Paso 0.
2. **Backend nuevo**: `npm init -y`, instala con **`@7`**, copia el `package.json` (`type` + `scripts`).
   ```powershell
   npm install express cors dotenv pg @prisma/client@7 @prisma/adapter-pg@7
   npm install -D nodemon prisma@7
   ```
3. **Copia** los 📋: `docker-compose.yml`, `.env`, `prisma.config.js`, `src/prisma.js`, `.gitignore`.
4. **Cambia** lo 🟢 del compose y el `.env` (ver la cadena abajo).
5. **Escribe** `schema.prisma` con tus tablas, luego el `seed.js` y luego el `index.js` copiando las rutas.
6. **Front**: **crea** su `.env` con tu puerto + `src/constants.js` + reemplaza cada `TODO` por un `fetch` como en `LoginPage` / `MainPage`.
7. **Corre** los comandos del punto 1.

> ⚠️ Si este molde está prendido y el examen usa los mismos puertos: `docker compose down` aquí y cierra su `npm run dev`.

---

## 3. 🔗 La cadena (si algo falla, casi siempre es esto)

| Valor | Está en… | …igual en |
|---|---|---|
| puerto BD `5436` | compose → `ports` (izquierda) | `.env` → `DATABASE_URL` |
| nombre BD `videojuegos` | compose → `POSTGRES_DB` | `.env` → final de `DATABASE_URL` |
| puerto backend `8000` | `index.js` → `app.listen` | `frontend/.env` → `VITE_API_URL` |
| `model Videojuego` | `schema.prisma` | `prisma.videojuego` (minúscula) en seed e index |
| campos (`nombre`…) | `schema.prisma` | seed, `req.body`, inputs del front |
| ruta `/videojuegos` | `app.get("/videojuegos")` | `fetch(\`${API_URL}/videojuegos\`)` |
| método | `app.post` / `app.put` | `method: 'POST'` / `'PUT'` |

---

## 4. Moldes rápidos

**Ruta (backend), siempre 5 pasos:**
```
1 sacar datos (req.body / req.params / req.query)
2 si falta algo → 400
3 buscar en la BD
4 login malo → 401 · no existe → 404 · ya existe → 409
5 hacer (create/update) y responder (201 / 200)
```

**fetch (frontend):**
```jsx
const resp = await fetch(`${API_URL}/ruta`, {          // GET: solo fetch(url)
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(datos),
})
const data = await resp.json()
if (!resp.ok) return setError(data.message)
// ok → cargar() / navigate(...) / cerrarModal()
```

**Prisma:** `findMany` todos · `findUnique({where:{id}})` uno · `findFirst({where})` el primero que coincida ·
`create({data})` · `createMany({data:[]})` · `update({where, data})` · `count()`

**Códigos:** 200 ok · 201 creado · 400 faltan datos · 401 login malo · 404 no existe · 409 ya existe

---

## 5. 🧯 Errores

| Error | Solución |
|---|---|
| `Cannot use import statement` | `"type": "module"` |
| `does not provide an export named 'PrismaClient'` | `npx prisma generate` |
| `prisma generate is a Prisma 7 command` | `npm install -D prisma@7` |
| `port is already allocated` | cambia el puerto izquierdo del compose **y** el `.env` |
| `container name already in use` | cambia `container_name` (y `name:`) del compose |
| `Can't reach database server` | `docker compose up -d` · revisa el puerto del `.env` |
| `EADDRINUSE :8000` | ya hay un backend en ese puerto: ciérralo |
| siempre 400 "Faltan datos" | falta `express.json()` o el header `Content-Type` |
| error CORS | falta `app.use(cors())` |
| `Cannot PUT/POST /...` | método o ruta distintos entre front y back |
| la tabla no se actualiza | llama `cargar()` después de guardar |

---

¿Más casos (filtros con varios campos, 2 tablas relacionadas, promedios)? → repo **resueltos-examen**: https://github.com/ssalex88/resueltos-examen
