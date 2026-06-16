import { Router } from "express";
import validateFields from "../middlewares/validateFields.js";
import {
	createProductValidators,
	updateProductValidators,
	validateProductId,
} from "../validators/product.validators.js";
import verifyToken from "../auth/verifyToken.js";
import authorizeRoles from "../middlewares/authorizeRoles.js";
import {
	createProduct,
	deleteProduct,
	getProductById,
	getProducts,
	updateProduct,
} from "../controllers/products.controllers.js";

const router = Router();

router.get("/products", verifyToken, getProducts);
router.post("/products", createProductValidators, validateFields, verifyToken, authorizeRoles("ADMIN", "SUPERADMIN"), createProduct);
router.get("/products/:id", validateProductId, validateFields, verifyToken, getProductById);
router.delete("/products/:id", validateProductId, validateFields, verifyToken, authorizeRoles("ADMIN", "SUPERADMIN"), deleteProduct);
router.patch("/products/:id", updateProductValidators, validateFields, verifyToken, authorizeRoles("ADMIN", "SUPERADMIN"), updateProduct);

export default router;
