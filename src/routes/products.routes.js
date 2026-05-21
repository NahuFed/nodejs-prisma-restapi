/**
 * @fileoverview Rutas CRUD para la entidad Product.
 * Endpoints para obtener, crear, actualizar y eliminar productos.
 */

import { Router } from "express";
import { prisma } from "../db.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { ValidationError } from "../errors/ValidationError.js";

/**
 * Router de Express para rutas de productos.
 * @type {import('express').Router}
 */
const router = Router();

/**
 * GET /products
 * Obtiene todos los productos con sus categorias asociadas.
 *
 * @async
 * @param {import('express').Request} req - Objeto de request de Express.
 * @param {import('express').Response} res - Objeto de response de Express.
 * @param {import('express').NextFunction} next - Funcion para pasar al siguiente middleware.
 *
 * @returns {Promise<void>} Responde con array JSON de productos.
 *
 * @example
 * GET /api/products
 * Response: [{ id: 1, name: "Laptop", quantity: 5, price: 999, categoryId: 1, category: {...} }]
 */
router.get("/products", async (req, res, next) => {
	try {
		// Consulta todos los productos e incluye la categoria relacionada.
		const products = await prisma.product.findMany({
			include: {
				category: true,
			},
		});
		// Envia productos como JSON.
		res.json(products);
	} catch (error) {
		// Propaga el error al middleware de manejo de errores.
		next(error);
	}
});

/**
 * POST /products
 * Crea un nuevo producto.
 *
 * @async
 * @param {import('express').Request} req - Body esperado: { name, quantity, price, categoryId }
 * @param {import('express').Response} res - Objeto de response de Express.
 * @param {import('express').NextFunction} next - Funcion para pasar al siguiente middleware.
 *
 * @returns {Promise<void>} Responde con el producto creado en JSON.
 *
 * @example
 * POST /api/products
 * Body: { name: "Mouse", quantity: 10, price: 25, categoryId: 1 }
 * Response: { id: 2, name: "Mouse", quantity: 10, price: 25, categoryId: 1, createdAt: "2023-05-14T00:30:28.000Z" }
 */
router.post("/products", async (req, res, next) => {
	try {
		// Crea un nuevo registro Product con los datos del request body.
		const product = await prisma.product.create({
			data: req.body,
		});
		// Envia el producto creado como respuesta.
		res.json(product);
	} catch (error) {
		// Propaga el error al middleware de manejo de errores.
		next(error);
	}
});

/**
 * GET /products/:id
 * Obtiene un producto especifico por su ID.
 *
 * @async
 * @param {import('express').Request} req - Parametro: id (identificador del producto).
 * @param {import('express').Response} res - Objeto de response de Express.
 * @param {import('express').NextFunction} next - Funcion para pasar al siguiente middleware.
 *
 * @returns {Promise<void>} Responde con el producto especifico en JSON.
 *
 * @example
 * GET /api/products/1
 * Response: { id: 1, name: "Laptop", quantity: 5, price: 999, categoryId: 1, category: {...} }
 */
router.get("/products/:id", async (req, res, next) => {
	try {
		const id = Number(req.params.id);
		if (Number.isNaN(id)) {
			return next(new ValidationError("Id invalido"));
		}

		// Busca un producto unico por ID, incluyendo su categoria.
		const product = await prisma.product.findUnique({
			where: {
				// Convierte el parametro :id a numero para comparar con el schema.
				id,
			},
			include: {
				category: true,
			},
		});
		if (!product) {
			return next(new NotFoundError("Producto no encontrado"));
		}
		// Envia el producto encontrado como JSON.
		res.json(product);
	} catch (error) {
		// Propaga el error al middleware de manejo de errores.
		next(error);
	}
});

/**
 * DELETE /products/:id
 * Elimina un producto por su ID.
 *
 * @async
 * @param {import('express').Request} req - Parametro: id (identificador del producto a eliminar).
 * @param {import('express').Response} res - Objeto de response de Express.
 * @param {import('express').NextFunction} next - Funcion para pasar al siguiente middleware.
 *
 * @returns {Promise<void>} Responde con la cantidad del producto eliminado.
 *
 * @example
 * DELETE /api/products/1
 * Response: 5 (la cantidad del producto eliminado)
 */
router.delete("/products/:id", async (req, res, next) => {
	try {
		const id = Number(req.params.id);
		if (Number.isNaN(id)) {
			return next(new ValidationError("Id invalido"));
		}

		const existingProduct = await prisma.product.findUnique({
			where: {
				id,
			},
		});
		if (!existingProduct) {
			return next(new NotFoundError("Producto no encontrado"));
		}

		// Elimina el producto con el ID especificado.
		const product = await prisma.product.delete({
			where: {
				id,
			},
		});
		// Envia la cantidad del producto eliminado como respuesta.
		res.json(product.quantity);
	} catch (error) {
		// Propaga el error al middleware de manejo de errores.
		next(error);
	}
});

/**
 * PATCH /products/:id
 * Actualiza parcialmente un producto existente.
 *
 * @async
 * @param {import('express').Request} req - Parametro: id | Body: campos a actualizar (name, quantity, price, categoryId)
 * @param {import('express').Response} res - Objeto de response de Express.
 * @param {import('express').NextFunction} next - Funcion para pasar al siguiente middleware.
 *
 * @returns {Promise<void>} Responde con el producto actualizado en JSON.
 *
 * @example
 * PATCH /api/products/1
 * Body: { quantity: 8, price: 899 }
 * Response: { id: 1, name: "Laptop", quantity: 8, price: 899, categoryId: 1, category: {...} }
 */
router.patch("/products/:id", async (req, res, next) => {
	try {
		const id = Number(req.params.id);
		if (Number.isNaN(id)) {
			return next(new ValidationError("Id invalido"));
		}

		const existingProduct = await prisma.product.findUnique({
			where: {
				id,
			},
		});
		if (!existingProduct) {
			return next(new NotFoundError("Producto no encontrado"));
		}

		// Actualiza el producto con los datos proporcionados en req.body.
		const product = await prisma.product.update({
			where: {
				id,
			},
			// data contiene solo los campos a actualizar (parcial, no reemplaza todo).
			data: req.body,
			include: {
				category: true,
			},
		});
		// Envia el producto actualizado como respuesta.
		res.json(product);
	} catch (error) {
		// Propaga el error al middleware de manejo de errores.
		next(error);
	}
});

export default router;
