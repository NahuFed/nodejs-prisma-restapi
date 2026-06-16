import { prisma } from "../db.js";
import AppError from "../utils/AppError.js";
import signToken from "../auth/signToken.js";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return next(new AppError("Credenciales inválidas", 401));
        const passwordMatches = await bcrypt.compare(password, user.password);
        if (!passwordMatches) return next(new AppError("Credenciales inválidas", 401));
        const token = await signToken(user);
        res.status(200).json({ message: "Login exitoso", user: { id: user.id, email: user.email, role: user.role }, token });
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
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: "USER",
            }
        });
        const token = await signToken(newUser);
        res.status(201).json({ message: "Registro exitoso", user: { id: newUser.id, email: newUser.email, role: newUser.role }, token });
    } catch (error) {
        next(error);
    }
}

export async function me(req, res, next) {
    try {
        const userId = req.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                role: true,
            },
        });
        if (!user) return next(new AppError("Usuario no encontrado", 404));
        res.status(200).json({ user });
    } catch (error) {
        next(error);
    }   
}