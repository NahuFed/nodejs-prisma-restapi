/**
 * @fileoverview Rutas CRUD para la entidad Product.
 * Endpoints para obtener, crear, actualizar y eliminar productos.
 */

import { Router } from "express";
import { prisma } from "../db.js";
import validateFields from "../middlewares/validateFields.js";
import AppError from "../utils/AppError.js";
import {
	categoryNotFound,
	invalidPriceOrQuantity,
	productAlreadyExists,
} from "../utils/productErrors.js";
import {
	createProductValidators,
	updateProductValidators,
	validateProductId,
} from "../validators/product.validators.js";
import verifyToken from "../auth/verifyToken.js";

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
router.post("/products", createProductValidators, validateFields, verifyToken, async (req, res, next) => {
	try {
		const { name, price, quantity, categoryId } = req.body;

		if (price == null || Number(price) <= 0) {
			return next(invalidPriceOrQuantity("price debe ser mayor a 0"));
		}

		if (quantity == null || Number(quantity) < 0) {
			return next(invalidPriceOrQuantity("quantity no puede ser negativo"));
		}

		const category = await prisma.category.findUnique({
			where: { id: Number(categoryId) },
		});

		if (!category) {
			return next(categoryNotFound(categoryId));
		}

		const existingProduct = await prisma.product.findUnique({
			where: { name },
		});

		if (existingProduct) {
			return next(productAlreadyExists(name));
		}

		// Crea un nuevo registro Product con los datos del request body.
		const product = await prisma.product.create({
			data: req.body,
		});
		// Envia el producto creado como respuesta.
		res.json(product);
	} catch (error) {
		if (error && error.code === "P2002") {
			return next(productAlreadyExists(req.body?.name || ""));
		}

		// Para otros errores, propaga para que el middleware los maneje.
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
router.get("/products/:id", validateProductId, validateFields, async (req, res, next) => {
	try {
		// Busca un producto unico por ID, incluyendo su categoria.
		const product = await prisma.product.findUnique({
			where: {
				// Convierte el parametro :id a numero para comparar con el schema.
				id: Number(req.params.id),
			},
			include: {
				category: true,
			},
		});
		// Envia el producto encontrado como JSON.
		res.json(product);
	} catch (error) {
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
router.delete("/products/:id", validateProductId, validateFields, async (req, res, next) => {
	try {
		// Elimina el producto con el ID especificado.
		const product = await prisma.product.delete({
			where: {
				id: Number(req.params.id),
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
router.patch("/products/:id", updateProductValidators, validateFields, async (req, res, next) => {
	try {
		const { name, price, quantity, categoryId } = req.body;

		if (price != null && Number(price) <= 0) {
			return next(invalidPriceOrQuantity("price debe ser mayor a 0"));
		}

		if (quantity != null && Number(quantity) < 0) {
			return next(invalidPriceOrQuantity("quantity no puede ser negativo"));
		}

		if (categoryId != null) {
			const category = await prisma.category.findUnique({
				where: { id: Number(categoryId) },
			});

			if (!category) {
				return next(categoryNotFound(categoryId));
			}
		}

		if (name) {
			const existingProduct = await prisma.product.findUnique({
				where: { name },
			});

			if (existingProduct && existingProduct.id !== Number(req.params.id)) {
				return next(productAlreadyExists(name));
			}
		}

		// Actualiza el producto con los datos proporcionados en req.body.
		const product = await prisma.product.update({
			where: {
				id: Number(req.params.id),
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
		if (error && error.code === "P2002") {
			return next(productAlreadyExists(req.body?.name || ""));
		}

		// Propaga el error al middleware de manejo de errores.
		next(error);
	}
});

export default router;
