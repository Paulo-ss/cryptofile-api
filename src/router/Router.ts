import express from "express";
import Users from "../controllers/Users";

const router = express.Router();

router.post("/users", Users.create);
router.post("/user-auth", Users.userAuth);

export default router;
