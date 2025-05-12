import { Constants } from "./constants.js";
import { messageLogs } from "./message.js";
import jwt from "jsonwebtoken";


const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization");

  //when the token get expires it will give 
  if (!token) return res.status(401).json({ message: messageLogs.NO_ACCESS });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.userDetails = verified;
    next();
  } catch (error) {
    if (error.name === Constants.TOKEN_EXPIRE_ERROR) {
      return res.status(401).json({ 
        error: messageLogs.SESSION_EXPIRED, 
        message: messageLogs.TOKEN_EXPIRES 
      });
    }
  }
};

const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
const validatePassword = (password) => password.length >= 6;
const validateName = (name) => name.trim().length > 0;
const validateMobile = (mobile) => /^\d{10}$/.test(mobile);

const checkSignUpValidation = (email='', username='', password='', mobile='') => { 
  if (!validateEmail(email)) {
    return { status: 400,  message: messageLogs.EMAIL_REQUIRED };
  }

  if (!validateMobile(mobile)) {
    return { status: 400,  message: messageLogs.VALID_MOBILE };
  }

  if (!validateName(username)) {
    return { status: 400,  message: messageLogs.VALID_NAME };
  }

  if (!validatePassword(password)) {
    return { status: 400,  message: messageLogs.VALID_PASSWORD };
  }
  return false
};

const checkLoginValidation = (email='', password='') => {
  if (!validateEmail(email)) {
    return { status: 400,  message: messageLogs.EMAIL_REQUIRED };
  }

  if (!validatePassword(password)) {
    return { status: 400,  message: messageLogs.VALID_PASSWORD };
  }
  return false
};


export { 
  authenticateToken,
  checkSignUpValidation,
  checkLoginValidation
};
