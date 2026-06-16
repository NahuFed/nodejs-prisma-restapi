import { prisma } from "../db.js";

export async function getCategories(req, res, next) {
	try {
		const categories = await prisma.category.findMany({
			include: {
				products: true,
			},
		});

		res.json(categories);
	} catch (error) {
		next(error);
	}
}