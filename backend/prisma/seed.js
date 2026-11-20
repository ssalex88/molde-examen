// ✍️ DATOS INICIALES  ·  correr: npx prisma db seed
// MOLDE: un bloque por tabla → if (count() === 0) { create / createMany }   (así no duplica)
// 🟢 cambia: prisma.xxx (tu model en minúscula) y los datos   🔴 no toques: el import y el $disconnect

import { prisma } from "../src/prisma.js";

// Usuario para el login
if ((await prisma.usuario.count()) === 0) {
  await prisma.usuario.create({ data: { usuario: "admin", password: "123" } });
}

// Videojuegos
if ((await prisma.videojuego.count()) === 0) {
  await prisma.videojuego.createMany({
    data: [
      { id: 1, nombre: "Hollow Knight", sinopsis: "Un caballero explora un reino en ruinas.", categoria: "Metroidvania", url_imagen: "https://placehold.co/120x160?text=HK" },
      { id: 2, nombre: "Stardew Valley", sinopsis: "Heredas una granja en el campo.", categoria: "Simulación", url_imagen: "https://placehold.co/120x160?text=SV" },
      { id: 3, nombre: "Celeste", sinopsis: "Madeline escala la montaña Celeste.", categoria: "Plataformas", url_imagen: "https://placehold.co/120x160?text=CE" },
    ],
  });
}

console.log("Seed terminado");
await prisma.$disconnect();
