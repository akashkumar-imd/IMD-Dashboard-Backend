import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto"
import {
  checkUserExist,
  userCreationInDB,
  findUserByEmail
} from "../services/users.service.js";
import {
  checkSignUpValidation,
  checkLoginValidation,
} from "../utils/common.js";
import { messageLogs } from "../utils/message.js";
import { Constants } from "../utils/constants.js";
import { createUserCredentialsRecord, updateAccessTokenStatus } from "../services/auth.service.js";

// createUser Controller
const createUser = async (req, res) => {
  const { email, password, username, mobile, status, role } = req.body;

  try {
    const errorValidation = checkSignUpValidation(
      email,
      username,
      password,
      mobile
    );

    if (errorValidation) {
      return res
        .status(errorValidation.status)
        .json({
          statusCode: errorValidation.status,
          message: errorValidation.message,
        });
    }

    const user = await checkUserExist(email, username);

    if (user.length !== 0) {
      return res
        .status(400)
        .json({ statusCode: 400, message: messageLogs.USER_EXIST });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await userCreationInDB(
      email,
      hashedPassword,
      username,
      mobile,
      status,
      role
    );

    res.status(201).json({
      message: messageLogs.SIGNUP_SUCCESS,
      userId: newUser.userId ? newUser.userId : "",
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: messageLogs.ERROR_MESSAGE, error: err });
  }
};

// Login Controller
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const errorValidation = checkLoginValidation(email, password);

    if (errorValidation) {
      return res
        .status(errorValidation.status)
        .json({
          statusCode: errorValidation.status,
          message: errorValidation.message,
        });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return res
        .status(400)
        .json({ statusCode: 400, message: messageLogs.USER_NOT_FOUND });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ statusCode: 400, message: messageLogs.VALID_PASSWORD });
    }

    const token = jwt.sign(
      {
        email: email,
        userId: user.userId,
        username: user.username,
        status: user.status,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: Constants.TOKEN_VALID_LIMIT }
    );

    const refreshToken = crypto.randomBytes(40).toString('hex');
    const now = new Date();
    const refreshTokenExpTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); 
    const tokenVersion = Math.floor(10000 + Math.random() * 90000);

    const userCredDetails = await createUserCredentialsRecord(user.userId,refreshToken,token,tokenVersion,refreshTokenExpTime)

    return res
      .status(200)
      .json({ statusCode: 200, userToken: token, refreshToken :refreshToken ,userId: user.userId,tVer:userCredDetails.tokenVersion });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: messageLogs.ERROR_MESSAGE, error: err });
  }
};

// Log out User Controller
const logOutUser = async (req, res) => {
  const accessToken = req.header("Authorization");
  const {tokenVersion}=req.body;

  try {
    if(accessToken&& accessToken!=''){
      await updateAccessTokenStatus(tokenVersion)
    }
    res.status(200).json({
      message: messageLogs.LOGOUT_SUCCESS,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: messageLogs.ERROR_MESSAGE, error: err });
  }
};

export { createUser, login,logOutUser };
