import { AppError } from "../errors/AppError.js";

/**
 * Middleware centralizado de manejo de errores.
 */
export function errorHandler(err, req, res, next) {
	if (err instanceof AppError) {
		return res.status(err.statusCode).json({
			error: err.name,
			message: err.message,
			details: err.details ?? null,
		});
	}

	return res.status(500).json({
		error: "InternalServerError",
		message: "Error interno del servidor",
	});
}
