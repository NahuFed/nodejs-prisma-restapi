import { Router } from "express";
import { getCategories } from "../controllers/categories.controllers.js";
import verifyToken from "../auth/verifyToken.js";

const router = Router();

router.get("/categories", verifyToken, getCategories);

export default router;
