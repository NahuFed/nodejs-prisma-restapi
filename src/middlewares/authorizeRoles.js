import AppError from "../utils/AppError.js";

export default function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
        if (!req.role) {
            return next(new AppError("No autenticado", 401));
        }

        if (!allowedRoles.includes(req.role)) {
            return next(new AppError("No autorizado", 403));
        }

        next();
    };
}