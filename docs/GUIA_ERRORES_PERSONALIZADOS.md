# Guia Errores personalizados - HU6 

## Objetivo
Implementar errores personalizados basados en clases que extienden Error, junto con un manejo centralizado de errores, para responder con formato consistente y codigos HTTP correctos.

## Antes de empezar - Conceptos basicos

### Para que sirve throw
`throw` se usa para interrumpir la ejecucion normal cuando ocurre un problema. Al lanzar un error, el flujo se detiene y se salta al primer `catch` disponible o al middleware de errores en Express.

Ejemplo simple:

```js
function dividir(a, b) {
	if (b === 0) {
		throw new Error("No se puede dividir por cero");
	}
	return a / b;
}
```

### Como funciona try/catch
`try` envuelve el codigo que podria fallar. Si hay un error lanzado dentro del bloque, se ejecuta el `catch`, que permite manejarlo sin que la aplicacion se caiga.

```js
try {
	const resultado = dividir(10, 0);
	console.log(resultado);
} catch (error) {
	console.log("Ocurrio un error:", error.message);
}
```

### Por que se extiende desde la clase Error
La clase `Error` ya incluye propiedades utiles como `message`, `name` y `stack`. Al extenderla se conserva esa informacion y se agregan datos propios del sistema, como el `statusCode`.

### Por que no se lanza un string
Se podria hacer `throw "error"`, pero es mala practica porque se pierde:
- `stack` (la traza del error)
- `name` (tipo del error)
- compatibilidad con herramientas y middleware que esperan instancias de `Error`

Por eso se lanza un objeto que extiende `Error`.

### Finalidad de usar custom errors
Los errores personalizados permiten:
- Responder con codigos HTTP correctos segun el tipo de fallo.
- Reutilizar tipos de error en diferentes rutas.
- Mantener un formato de respuesta consistente.

### Premisa de por que se necesitan
Si usamos `throw new Error` para todo, no distinguimos entre:
- error de validacion (400)
- recurso inexistente (404)
- error interno (500)

Con custom errors podemos decidir el codigo de respuesta correcto y dar mensajes claros al frontend.

## Antes de empezar - Como se veria todo en un solo archivo
Esta seria una version didactica donde todo esta junto (errores, middleware y rutas en el mismo archivo). Funciona, pero es dificil de mantener.

```js
import express from "express";
import { prisma } from "./db.js";

const app = express();
app.use(express.json());

class AppError extends Error {
	constructor(message, statusCode, details = null) {
		super(message);
		this.name = this.constructor.name;
		this.statusCode = statusCode;
		this.details = details;
	}
}

class ValidationError extends AppError {
	constructor(message = "Datos invalidos", details = null) {
		super(message, 400, details);
	}
}

class NotFoundError extends AppError {
	constructor(message = "Recurso no encontrado") {
		super(message, 404);
	}
}

app.get("/api/products/:id", async (req, res, next) => {
	try {
		const id = Number(req.params.id);
		if (Number.isNaN(id)) {
			return next(new ValidationError("Id invalido"));
		}

		const product = await prisma.product.findUnique({
			where: { id },
			include: { category: true },
		});
		if (!product) {
			return next(new NotFoundError("Producto no encontrado"));
		}

		res.json(product);
	} catch (error) {
		next(error);
	}
});

app.use((err, req, res, next) => {
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
});

app.listen(3000);
```

### Por que decidimos separar responsabilidades
- El archivo principal queda mas corto y legible.
- Los errores se reutilizan en distintas rutas sin duplicar codigo.
- El middleware de errores queda centralizado y consistente.
- Es mas facil enseñar y mantener cada parte por separado.

### Paso a paso de la separacion
1. Crear una carpeta `errors` para guardar clases de error.
2. Crear `AppError` como base y luego errores especificos como `ValidationError` y `NotFoundError`.
3. Crear una carpeta `middlewares` y mover el manejo de errores a `errorHandler`.
4. Importar `errorHandler` en el archivo principal y registrarlo al final.
5. Importar los errores en las rutas y reemplazar los `throw` genericos.

## Paso 1 - Crear clase base AppError
Crear una clase base que extienda Error y agregue statusCode y details.

Archivo: src/errors/AppError.js

```js
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
```

## Paso 2 - Crear errores especificos
Extender AppError para errores concretos como validacion y recurso no encontrado.

Archivo: src/errors/ValidationError.js

```js
import { AppError } from "./AppError.js";

/**
 * Error de validacion de datos de entrada.
 */
export class ValidationError extends AppError {
	constructor(message = "Datos invalidos", details = null) {
		super(message, 400, details);
	}
}
```

Archivo: src/errors/NotFoundError.js

```js
import { AppError } from "./AppError.js";

/**
 * Error para recursos inexistentes.
 */
export class NotFoundError extends AppError {
	constructor(message = "Recurso no encontrado") {
		super(message, 404);
	}
}
```

## Paso 3 - Middleware centralizado de errores
Crear un middleware unico que traduzca errores a respuestas JSON consistentes.

Archivo: src/middlewares/errorHandler.js

```js
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
```

## Paso 4 - Registrar el middleware en la app
Se debe registrar despues de las rutas para capturar errores propagados por next.

Archivo: src/index.js

```js
import { errorHandler } from "./middlewares/errorHandler.js";

// ... rutas montadas arriba
app.use("/api", productRoutes);
app.use("/api", categoryRoutes);

/**
 * Middleware centralizado de errores. Debe ir despues de las rutas.
 */
app.use(errorHandler);
```

## Paso 5 - Usar errores en las rutas
Reemplazar throw new Error por errores personalizados y validar IDs.

Archivo: src/routes/products.routes.js

```js
import { NotFoundError } from "../errors/NotFoundError.js";
import { ValidationError } from "../errors/ValidationError.js";

router.get("/products/:id", async (req, res, next) => {
	try {
		const id = Number(req.params.id);
		if (Number.isNaN(id)) {
			return next(new ValidationError("Id invalido"));
		}

		const product = await prisma.product.findUnique({
			where: { id },
			include: { category: true },
		});
		if (!product) {
			return next(new NotFoundError("Producto no encontrado"));
		}

		res.json(product);
	} catch (error) {
		next(error);
	}
});
```

## Paso 6 - Verificar comportamiento
Probar respuestas con:
- ID invalido (ej: /api/products/abc) -> 400 ValidationError
- ID inexistente (ej: /api/products/9999) -> 404 NotFoundError
- Error inesperado -> 500 InternalServerError
