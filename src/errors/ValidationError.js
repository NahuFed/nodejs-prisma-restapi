import { AppError } from "./AppError.js";

/**
 * Error de validacion de datos de entrada.
 */
export class ValidationError extends AppError {
	constructor(message = "Datos invalidos", details = null) {
		super(message, 400, details);
	}
}
