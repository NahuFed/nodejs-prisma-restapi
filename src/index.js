import express from "express";
import productRoutes from "./routes/products.routes.js";
import categoryRoutes from "./routes/categories.routes.js";
import userRoutes from "./routes/users.routes.js";
import authRoutes from "./routes/auth.routes.js";
import cors from "cors";
import { prisma } from "./db.js";
import morgan from "morgan";
import AppError from "./utils/AppError.js";

const app = express();
let server;

app.use(cors());
app.use(morgan("combined"));
// Middleware para parsear JSON en el body de las solicitudes
app.use(express.json());
app.use("/api", productRoutes);
app.use("/api", categoryRoutes);
app.use("/api", userRoutes);
app.use("/api", authRoutes);
// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error(err);
    //revisamos si el error es una instancia de AppError para enviar un mensaje amigable al cliente
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            error: err.message,
        });
    }

    // Nunca deberiamos exponer detalles internos de errores de infraestructura.
    res.status(500).json({
        error: "Error interno del servidor",
    });
});

async function shutdown(signal) {
    if (server) {
        await new Promise((resolve) => server.close(resolve));
    }

    await prisma.$disconnect();

    if (signal === "SIGUSR2") {
        process.kill(process.pid, signal);
        return;
    }

    process.exit(0);
}

process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));
process.once("SIGUSR2", () => void shutdown("SIGUSR2"));

async function start() {
    await prisma.$connect();

    server = app.listen(3000, () => {
        console.log("Servidor escuchando en http://localhost:3000");
    });
}

start().catch((error) => {
    console.error(error);
    process.exit(1);
});
