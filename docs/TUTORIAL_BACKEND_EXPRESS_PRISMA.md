# Tutorial paso a paso: Backend simple con Node.js, Express y Prisma

Este tutorial explica, de forma educativa, como construir un backend simple como el de este proyecto.

Stack usado:
- Node.js
- Express
- Prisma ORM
- SQLite (en este proyecto), con opcion de usar MySQL

---

## 1) Crear proyecto e instalar dependencias

Si arrancas desde cero:

```bash
npm init -y
npm install express @prisma/client prisma morgan
npm install -D nodemon
```

En este proyecto ya existe una estructura similar en package.json, con script de desarrollo:

```json
"scripts": {
  "dev": "nodemon src/index.js"
}
```

---

## 2) Inicializar Prisma

Prisma necesita un schema para definir modelos y una conexion a base de datos.

Comando inicial:

```bash
npx prisma init
```

Esto crea:
- carpeta prisma/
- archivo prisma/schema.prisma
- archivo .env (con DATABASE_URL)

### 2.1) Migrar este proyecto a Prisma 7

En este proyecto hicimos una migracion puntual para usar Prisma 7 y la nueva Config API.

La idea clave es esta:
- `prisma.config.ts` carga `DATABASE_URL` para el CLI y las migraciones.
- `src/db.js` crea el cliente Prisma en runtime.
- Si usas el adapter de MariaDB/MySQL, el cliente puede leer `DATABASE_HOST`, `DATABASE_USER`, `DATABASE_PASSWORD` y `DATABASE_NAME` desde `.env`.

Pasos que aplicamos:

1. Actualizar las dependencias en `package.json`:

```json
"dependencies": {
  "@prisma/client": "^7.0.0",
  "prisma": "^7.0.0",
  "@prisma/adapter-mariadb": "^7.0.0",
  "dotenv": "^17.4.2"
}
```

2. Ejecutar la instalacion de dependencias:

```bash
npm install
```

3. Crear o actualizar `prisma.config.ts` en la raiz del proyecto:

```ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),v
  },
});
```

Este archivo hace dos cosas importantes:
- Permite que Prisma 7 lea la variable `DATABASE_URL` desde `.env`.
- Deja la configuracion del CLI separada del schema de Prisma.

4. Ajustar el archivo `.env` para Prisma 7 y MySQL:

```env
DATABASE_URL="mysql://root:root@localhost:3306/app_db"
DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=root
DATABASE_NAME=app_db
```

5. Agregar un script para generar el cliente en `package.json`:

```json
"scripts": {
  "dev": "nodemon src/index.js",
  "prisma:generate": "prisma generate"
}
```

6. Generar el cliente con el script:

```bash
npm run prisma:generate
```

7. Si cambias el schema, crear la migracion correspondiente:

```bash
npx prisma migrate dev --name init
```

Notas importantes:
- En Prisma 7, `prisma/config` reemplaza la configuracion antigua basada solo en `schema.prisma`.
- `env("DATABASE_URL")` carga la variable desde el entorno y evita usar `process.env` dentro del config.
- `prisma.config.ts` debe vivir en la raiz del proyecto para que el CLI lo detecte bien.
- Si usas adapter en runtime, las variables `DATABASE_HOST`, `DATABASE_USER`, `DATABASE_PASSWORD` y `DATABASE_NAME` se usan en `src/db.js`.

---

## 3) Definir modelos en schema.prisma

En este proyecto, el schema tiene dos modelos: Category y Product.
Con Prisma 7, el `schema.prisma` puede quedarse enfocado en modelos y provider; la URL de conexion la resuelve `prisma.config.ts`.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
}

model Product {
  id         Int      @id @default(autoincrement())
  name       String   @unique
  quantity   Int      @default(0)
  price      Int      @default(999)
  createdAt  DateTime @default(now())
  category   Category @relation(fields: [categoryId], references: [id])
  categoryId Int
}

model Category {
  id       Int       @id @default(autoincrement())
  name     String    @unique
  products Product[]
}
```

Idea clave:
- Product pertenece a una Category.
- Category tiene muchos Product.
- En el proyecto real, el provider usado es `mysql`.
- La URL de conexion ya no se declara en `schema.prisma`; Prisma 7 la toma desde `prisma.config.ts`.

---

## 4) Generar cliente Prisma y crear migraciones

Cuando cambias schema.prisma, haces una migracion para aplicar cambios en la DB.

Con Prisma 7, primero puedes regenerar el cliente con:

```bash
npm run prisma:generate
```

```bash
npx prisma migrate dev --name first
```

Luego, si agregas cambios (por ejemplo, el campo quantity), creas otra migracion:

```bash
npx prisma migrate dev --name second
```

### Que son las migraciones (resumen)

Una migracion es un historial de cambios de estructura de la base de datos:
- Crear tablas
- Agregar o modificar columnas
- Agregar indices o relaciones

Prisma guarda ese historial en prisma/migrations/.
Cada carpeta contiene SQL real que se ejecuta en la DB.

Ejemplo real de este proyecto:
- Una migracion crea tablas Product y Category.
- Otra migracion redefine Product para agregar quantity.

Ventaja: tu equipo y tus entornos (local, testing, produccion) pueden sincronizar el mismo estado de schema.

---

## 5) Importar y crear instancia de PrismaClient

En src/db.js:

```js
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5,
});

export const prisma = new PrismaClient({ adapter });
```

Este archivo centraliza la conexion y luego se reutiliza en las rutas.

Que hace tecnicamente PrismaClient:
- Expone metodos tipados por modelo (product, category, etc.).
- Traduce tus llamadas JS a SQL segun tu provider (SQLite/MySQL).
- Gestiona conexiones para evitar abrir/cerrar manualmente en cada endpoint.
- En Prisma 7, el adapter permite conectar el cliente al motor elegido en runtime.

---

## 6) Importar Express y configurar la app

En src/index.js:

```js
import express from "express";
import productRoutes from "./routes/products.routes.js";
import categoryRoutes from "./routes/categories.routes.js";

const app = express();

// Middleware global: parsea body JSON y lo deja en req.body.
app.use(express.json());

// Monta routers bajo prefijo /api. Ejemplo: /products -> /api/products
app.use("/api", productRoutes);
app.use("/api", categoryRoutes);

app.listen(3000);
console.log("Server on port", 3000);
```

Puntos importantes:
- express.json() permite recibir JSON en req.body.
- app.use("/api", ...) agrega prefijo comun a las rutas.
- listen(3000) levanta el servidor.

### Explicacion tecnica: que hace app.use

app.use registra middlewares en una cadena de ejecucion (pipeline) dentro de Express.

Conceptualmente, Express evalua cada request en orden:
1. Llega una request.
2. Express recorre middlewares registrados.
3. Cada middleware decide:
  - responder y cortar el flujo, o
  - llamar next() para continuar al siguiente middleware/route.

Cuando usas app.use("/api", productRoutes):
- Express hace un match por prefijo de URL (/api).
- Si coincide, delega al router.
- Dentro del router, las rutas se evalúan con el path restante.

Ejemplo mental:
- app.use("/api", router)
- router.get("/products", ...)
- Ruta final efectiva: GET /api/products

Si un middleware lanza error o llama next(error), Express salta a middlewares de error (los que tienen firma (err, req, res, next)).

---

## 7) Crear rutas con Express + Prisma

### 7.1 categories.routes.js

```js
import { Router } from "express";
import { prisma } from "../db.js";

const router = Router();

router.get("/categories", async (req, res, next) => {
  try {
    // include.products genera un JOIN logico para traer la relacion en una sola consulta.
    const categories = await prisma.category.findMany({
      include: {
        products: true,
      },
    });
    // Serializa a JSON y finaliza la respuesta HTTP.
    res.json(categories);
  } catch (error) {
    // Propaga error al manejador central de Express.
    next(error);
  }
});

export default router;
```

Aqui se usa include para traer productos relacionados de cada categoria.

### 7.2 products.routes.js

En este archivo hay ejemplos de CRUD:
- GET /products
- POST /products
- GET /products/:id
- DELETE /products/:id
- PATCH /products/:id

Operaciones Prisma usadas:
- findMany
- create
- findUnique
- delete
- update

Ejemplo corto:

```js
// Crea un registro Product usando los campos enviados en req.body.
// Prisma valida tipos segun schema y ejecuta INSERT en la DB.
const product = await prisma.product.create({
  data: req.body,
});
```

---

## 8) Prisma Studio (ver y editar datos visualmente)

Prisma Studio es una interfaz web local para inspeccionar y editar tablas sin escribir SQL.

Comando:

```bash
npx prisma studio
```

Que pasa al ejecutarlo:
- Prisma abre un servidor local de Studio.
- Lee tu schema.prisma para conocer modelos y relaciones.
- Conecta a DATABASE_URL actual.
- Permite crear/editar/borrar filas desde UI.

Uso recomendado en aprendizaje:
1. Ejecutas migraciones.
2. Levantas Studio.
3. Verificas si las tablas quedaron como esperabas.
4. Pruebas crear datos de prueba manualmente.
5. Luego llamas tus endpoints y comparas resultados.

Tip tecnico:
- Studio no reemplaza migraciones; solo opera sobre datos.
- Los cambios de estructura (columnas/tablas) siguen yendo por schema + migrate.

---

## 9) Ejecutar el backend

Con npm:

```bash
npm run dev
```

Con pnpm (porque el proyecto tiene pnpm-lock.yaml):

```bash
pnpm dev
```

Servidor levantado en:
- http://localhost:3000

Rutas base: