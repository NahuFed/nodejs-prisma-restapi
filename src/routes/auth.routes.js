import Router from "express";
import { login,register,me } from "../controllers/auth.controllers.js";
import verifyToken from "../auth/verifyToken.js";
const router = Router();

router.post("/auth/login",login );
router.post("/auth/register",register );
router.get("/auth/me",verifyToken,me );

export default router;