import { prisma } from "../db.js";
import AppError from "../utils/AppError.js";
import { userNotFound, emailAlreadyExists } from "../utils/userErrors.js";

export async function getUsers(req, res, next) {
    try {
        const users = await prisma.user.findMany();
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
        const {email, password} = req.body;
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return next(emailAlreadyExists(email));
        }
        const newUser = await prisma.user.create({
            data: {
                email,
                password
            }
        });
        res.json(newUser);
    } catch (error) {
        next(error);
    }   
}

export async function updateUser(req, res, next) {
    try {
        const { id } = req.params;
        const { email, password } = req.body;
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { email, password },
        });
        res.json(updatedUser);
    } catch (error) {
        next(error);
    }
}

export async function deleteUser(req, res, next) {
    try {
        const { id } = req.params;
        await prisma.user.delete({
            where: { id: parseInt(id) },
        });
        if (!user) {
            return next(userNotFound(id));
        }
    } catch (error) {
        next(error);
    }
}

