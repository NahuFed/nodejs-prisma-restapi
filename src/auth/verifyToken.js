import jwt from "jsonwebtoken";

const validateToken = (req, res, next) => {

    const token = req.header('x-token');
    if (!token) {
        return res.status(401).json({ message: 'No hay token en la peticion' });

    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.id = payload.id;
        req.email = payload.email;
        
    }
    catch (error) {
        return res.status(401).json({ message: 'Token no valido' });
    }
    next();
}

export default validateToken;
