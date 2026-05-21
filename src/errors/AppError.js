/**
 * Error base de la aplicacion con codigo HTTP.
 */
export class AppError extends Error {
	constructor(message, statusCode, details = null) {
		super(message);
		this.name = this.constructor.name;
		this.statusCode = statusCode;
		this.details = details;
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, this.constructor);
		}
	}
}
