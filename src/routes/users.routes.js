import {Router} from "express";
import {getUsers, createUser,getUserById,deleteUser,updateUser} from "../controllers/users.controllers.js";
import verifyToken from "../auth/verifyToken.js";
import authorizeRoles from "../middlewares/authorizeRoles.js";
const router = Router();


router.route("/users")
    .get(verifyToken, authorizeRoles("SUPERADMIN"), getUsers)
    .post(verifyToken, authorizeRoles("SUPERADMIN"), createUser);

router.route("/users/:id")
    .get(verifyToken, authorizeRoles("SUPERADMIN"), getUserById)
    .put(verifyToken, authorizeRoles("SUPERADMIN"), updateUser)
    .delete(verifyToken, authorizeRoles("SUPERADMIN"), deleteUser);

export default router;