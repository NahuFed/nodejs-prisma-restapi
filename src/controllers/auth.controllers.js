import { prisma } from "../db.js";
import AppError from "../utils/AppError.js";
import signToken from "../auth/signToken.js";

export async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({
            where: { email },
        });
        if (!user || user.password !== password) {
            return next(new AppError("Credenciales inválidas", 401));
        }
        const token = await signToken(user);
        res.status(200).json({ message: "Login exitoso", user, token });
    } catch (error) {
        next(error);
    }   
}

export async function logout(req, res, next) {
    try {
        // En una implementación real, podrías manejar la invalidación del token aquí.
        res.status(200).json({ message: "Logout exitoso" });
    } catch (error) {
        next(error);
    }
}

export async function register(req, res, next) {
    try {
        const { email, password } = req.body;
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return next(new AppError("El correo electrónico ya está en uso", 400));
        }
        const newUser = await prisma.user.create({
            data: {
                email,
                password
            }
        });
        const token = await signToken(newUser);
        res.status(201).json({ message: "Registro exitoso", user: newUser, token });
    } catch (error) {
        next(error);
    }
}