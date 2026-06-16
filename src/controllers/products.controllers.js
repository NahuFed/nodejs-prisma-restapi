import { prisma } from "../db.js";
import {
	categoryNotFound,
	invalidPriceOrQuantity,
	productAlreadyExists,
} from "../utils/productErrors.js";

export async function getProducts(req, res, next) {
	try {
		const products = await prisma.product.findMany({
			include: {
				category: true,
			},
		});

		res.json(products);
	} catch (error) {
		next(error);
	}
}

export async function createProduct(req, res, next) {
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

		const product = await prisma.product.create({
			data: req.body,
		});

		res.json(product);
	} catch (error) {
		if (error && error.code === "P2002") {
			return next(productAlreadyExists(req.body?.name || ""));
		}

		next(error);
	}
}

export async function getProductById(req, res, next) {
	try {
		const product = await prisma.product.findUnique({
			where: {
				id: Number(req.params.id),
			},
			include: {
				category: true,
			},
		});

		res.json(product);
	} catch (error) {
		next(error);
	}
}

export async function deleteProduct(req, res, next) {
	try {
		const product = await prisma.product.delete({
			where: {
				id: Number(req.params.id),
			},
		});

		res.json(product.quantity);
	} catch (error) {
		next(error);
	}
}

export async function updateProduct(req, res, next) {
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

		const product = await prisma.product.update({
			where: {
				id: Number(req.params.id),
			},
			data: req.body,
			include: {
				category: true,
			},
		});

		res.json(product);
	} catch (error) {
		if (error && error.code === "P2002") {
			return next(productAlreadyExists(req.body?.name || ""));
		}

		next(error);
	}
}