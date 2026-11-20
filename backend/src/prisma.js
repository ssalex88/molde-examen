// 📋 COPIAR TAL CUAL (🔴 no tocar nada)
// Crea "prisma", la conexión que usan index.js y seed.js.
// 🔗 model Videojuego (schema) → prisma.videojuego (en minúscula)
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
export const prisma = new PrismaClient({ adapter });
