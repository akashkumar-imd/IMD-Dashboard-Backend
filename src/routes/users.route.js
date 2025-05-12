import express from "express";
import {createUser,login,logOutUser}  from "../controllers/users.controller.js"; 
import {authenticateToken} from '../utils/common.js'

const userRouter = express.Router();

// Create User Route
userRouter.post("/signup", createUser);

// Login Route
userRouter.post("/login", login);

//Log-out user
userRouter.post('/log-out',authenticateToken,logOutUser)

export { userRouter};
