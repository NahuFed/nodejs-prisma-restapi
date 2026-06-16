import { prisma } from "../db.js";
import AppError from "../utils/AppError.js";
import { userNotFound, emailAlreadyExists } from "../utils/userErrors.js";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;
const ALLOWED_ROLES = ["USER", "ADMIN", "SUPERADMIN"];

export async function getUsers(req, res, next) {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
            },
        });
        res.json(users);
    } catch (error) {
        next(error);
    }
}

export async function getUserById(req, res, next) {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) },
            select: {
                id: true,
                email: true,
                role: true,
            },
        });
        if (!user) {
            return next(userNotFound(id));
        }
        res.json(user);
    } catch (error) {
        next(error);
    }
}

export async function createUser(req, res, next) {  
    try {
        const {email, password, role = "USER"} = req.body;
        if (!ALLOWED_ROLES.includes(role)) {
            return next(new AppError("Rol inválido", 400));
        }
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return next(emailAlreadyExists(email));
        }
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role,
            }
        });
        res.json({ id: newUser.id, email: newUser.email, role: newUser.role });
    } catch (error) {
        next(error);
    }   
}

export async function updateUser(req, res, next) {
    try {
        const { id } = req.params;
        const { email, password, role } = req.body;
        const data = {};
        if (email) data.email = email;
        if (password) data.password = await bcrypt.hash(password, SALT_ROUNDS);
        if (role) {
            if (!ALLOWED_ROLES.includes(role)) {
                return next(new AppError("Rol inválido", 400));
            }

            data.role = role;
        }
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data,
        });
        res.json({ id: updatedUser.id, email: updatedUser.email, role: updatedUser.role });
    } catch (error) {
        next(error);
    }
}

export async function deleteUser(req, res, next) {
    try {
        const { id } = req.params;
        const deletedUser = await prisma.user.delete({
            where: { id: parseInt(id) },
        });
        res.json({ id: deletedUser.id, email: deletedUser.email, role: deletedUser.role });
    } catch (error) {
        next(error);
    }
}

