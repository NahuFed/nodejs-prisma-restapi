import jwt from "jsonwebtoken";
import { prisma } from "../db.js";

const validateToken = async (req, res, next) => {
    const authorizationHeader = req.header('authorization');
    const legacyToken = req.header('x-token');
    const token = authorizationHeader?.startsWith('Bearer ')
        ? authorizationHeader.slice(7).trim()
        : legacyToken;
    if (!token) {
        return res.status(401).json({ message: 'No hay token en la peticion' });

    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.id = payload.id;
        req.email = payload.email;
        req.role = payload.role;

        if (!req.role && req.id) {
            const user = await prisma.user.findUnique({
                where: { id: req.id },
                select: { role: true },
            });

            req.role = user?.role;
        }
        
    }
    catch (error) {
        return res.status(401).json({ message: 'Token no valido' });
    }
    next();
}

export default validateToken;
