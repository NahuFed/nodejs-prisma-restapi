import {Router} from "express";
import {getUsers, createUser,getUserById,deleteUser,updateUser} from "../controllers/users.controllers.js";
const router = Router();


router.route("/users")
    .get(getUsers)
    .post(createUser)
    .delete(deleteUser)
    .put(updateUser);

router.get("/users/:id", getUserById);

export default router;