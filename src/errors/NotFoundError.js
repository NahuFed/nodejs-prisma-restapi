import { AppError } from "./AppError.js";

/**
 * Error para recursos inexistentes.
 */
export class NotFoundError extends AppError {
	constructor(message = "Recurso no encontrado") {
		super(message, 404);
	}
}
