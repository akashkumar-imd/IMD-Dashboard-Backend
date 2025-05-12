import express from "express";
import {authenticateToken } from '../utils/common.js'
import { checkProtectedToken,removeUserCredentials,generateAccessToken } from "../controllers/auth.controller.js";

const authRouter = express.Router();

// Generate refresh token on experied
authRouter.post("/generate-refresh-token", generateAccessToken);

// Check weather it is a valid token or not
authRouter.post("/check-protected-token",checkProtectedToken);

// Remove unused records on expired
authRouter.get("/remove-unused-credentials", removeUserCredentials);


export { authRouter};
