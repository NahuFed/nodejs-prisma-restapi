/**
 * @fileoverview Punto de entrada principal de la API REST.
 * Configura Express, middlewares, rutas y levanta el servidor en puerto 3000.
 */

import express from "express";
import productRoutes from "./routes/products.routes.js";
import categoryRoutes from "./routes/categories.routes.js";
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler.js";

/**
 * Instancia principal de la aplicacion Express.
 * @type {import('express').Application}
 */

const app = express();


app.use(cors()); // Habilita CORS para permitir solicitudes desde cualquier origen
/**
 * Middleware global que parsea el body de requests con Content-Type application/json.
 * Llena req.body con los datos parseados.
 */
app.use(express.json());

/**
 * Registra las rutas de productos bajo prefijo /api.
 * Rutas finales: /api/products, /api/products/:id
 */
app.use("/api", productRoutes);

/**
 * Registra las rutas de categorias bajo prefijo /api.
 * Rutas finales: /api/categories
 */
app.use("/api", categoryRoutes);

/**
 * Middleware centralizado de errores. Debe ir despues de las rutas.
 */
app.use(errorHandler);

/**
 * Inicia el servidor HTTP escuchando en puerto 3000.
 */
app.listen(3000);
console.log("Server on port", 3000);
