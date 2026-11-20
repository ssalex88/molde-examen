// ✍️ EL BACKEND
// MOLDE DE CADA RUTA:  1 sacar datos → 2 validar (400) → 3 buscar en BD → 4 error (401/404/409) → 5 hacer y responder
//
// Para OTRO tema (ej. libros) cambia solo:
//   🟢 "/videojuegos"     → la ruta del fetch del front             🔗 frontend
//   🟢 prisma.videojuego  → tu model en minúscula                    🔗 schema.prisma
//   🟢 los campos         → los de tu schema                         🔗 schema.prisma + inputs del front
//   🟢 app.listen(8000)   → el puerto que espera el front            🔗 .env del frontend
//   🔴 lo demás

import "dotenv/config";
import express from "express";
import cors from "cors";
import { prisma } from "./prisma.js";

const app = express();
app.use(cors());          // 🔴 deja que el front (otro puerto) le hable al back
app.use(express.json());  // 🔴 abre el body del fetch → crea req.body

// De dónde salen los datos:
//   req.body   → body del fetch (POST/PUT)     ej. { usuario, password }
//   req.params → el :id de la ruta             ej. /videojuegos/3  → "3" (texto)
//   req.query  → lo que va después del ?       ej. ?categoria=RPG  → "RPG" (texto)


// ── LOGIN ───────────────────────────────────── POST /login → 400 · 401 · 200
app.post("/login", async (req, res) => {
  // 1. sacar datos
  const { usuario, password } = req.body;

  // 2. validar
  if (!usuario || !password) {
    return res.status(400).json({ message: "Faltan datos" });
  }

  // 3. buscar (usuario Y password)
  const user = await prisma.usuario.findFirst({ where: { usuario, password } });

  // 4. no existe → 401
  if (!user) {
    return res.status(401).json({ message: "Usuario o password incorrectos" });
  }

  // 5. ok → 200
  res.json({ message: "Login correcto" });
});


// ── LISTAR (con filtro opcional) ────────────── GET /videojuegos?categoria=... → 200
app.get("/videojuegos", async (req, res) => {
  // 1. sacar filtros (opcionales)
  const { categoria } = req.query;

  // 2. armar el where: vacío = todos; solo agrego lo que llegó
  const where = {};
  if (categoria) where.categoria = { equals: categoria, mode: "insensitive" };  // sin importar mayúsculas

  // 3. buscar y responder
  const lista = await prisma.videojuego.findMany({ where, orderBy: { id: "asc" } });
  res.json(lista);
});


// ── UNO POR ID ──────────────────────────────── GET /videojuegos/:id → 400 · 404 · 200
app.get("/videojuegos/:id", async (req, res) => {
  // 1. sacar el id (llega como texto → Number)
  const id = Number(req.params.id);

  // 2. validar
  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: "El id debe ser un número entero" });
  }

  // 3. buscar
  const videojuego = await prisma.videojuego.findUnique({ where: { id } });

  // 4. no existe → 404
  if (!videojuego) {
    return res.status(404).json({ message: "No existe ese videojuego" });
  }

  // 5. responder
  res.json(videojuego);
});


// ── CREAR ───────────────────────────────────── POST /videojuegos → 400 · 409 · 201
app.post("/videojuegos", async (req, res) => {
  // 1. sacar datos
  const { id, nombre, sinopsis, categoria, url_imagen } = req.body;

  // 2. validar
  if (!id || !nombre || !sinopsis || !categoria || !url_imagen) {
    return res.status(400).json({ message: "Todos los campos son obligatorios" });
  }

  // 3. buscar si ya existe
  const existe = await prisma.videojuego.findUnique({ where: { id: Number(id) } });

  // 4. ya existe → 409
  if (existe) {
    return res.status(409).json({ message: "Ese id ya existe" });
  }

  // 5. crear → 201
  const nuevo = await prisma.videojuego.create({
    data: { id: Number(id), nombre, sinopsis, categoria, url_imagen },
  });
  res.status(201).json(nuevo);
});


// ── EDITAR ──────────────────────────────────── PUT /videojuegos/:id → 400 · 404 · 200
// ⚠️ Si el enunciado dice "solo GET y POST": cambia app.put por app.post("/videojuegos/:id/editar")
//    y en el front: method 'POST' con esa misma URL.
app.put("/videojuegos/:id", async (req, res) => {
  // 1. sacar datos: CUÁL (url) y QUÉ (body)
  const id = Number(req.params.id);
  const { nombre, sinopsis, categoria, url_imagen } = req.body;

  // 2. validar
  if (!nombre || !sinopsis || !categoria || !url_imagen) {
    return res.status(400).json({ message: "Todos los campos son obligatorios" });
  }

  // 3. buscar
  const existe = await prisma.videojuego.findUnique({ where: { id } });

  // 4. no existe → 404
  if (!existe) {
    return res.status(404).json({ message: "No existe ese videojuego" });
  }

  // 5. editar → 200   (where = cuál · data = lo nuevo)
  const editado = await prisma.videojuego.update({
    where: { id },
    data: { nombre, sinopsis, categoria, url_imagen },
  });
  res.json(editado);
});


// 🔴 siempre al final · 🟢🔗 el puerto = VITE_API_URL del front
app.listen(8000, () => console.log("Backend en http://localhost:8000"));
