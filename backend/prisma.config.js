// 📋 COPIAR TAL CUAL (🔴 no tocar nada)
// Lo usan los comandos "npx prisma ...": dónde está el schema, las migraciones, el seed y la BD.
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations", seed: "node prisma/seed.js" },
  datasource: { url: env("DATABASE_URL") },
});
