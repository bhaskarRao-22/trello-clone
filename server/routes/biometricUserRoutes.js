import express from "express";
import {
  getAllBiometricUsers,
  createBiometricUser,
} from "../controllers/biometricUserController.js";

const router = express.Router();

router.get("/", getAllBiometricUsers);
router.post("/", createBiometricUser);

export default router;
