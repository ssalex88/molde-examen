-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "usuario" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Videojuego" (
    "id" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "sinopsis" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "url_imagen" TEXT NOT NULL,

    CONSTRAINT "Videojuego_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_usuario_key" ON "Usuario"("usuario");
