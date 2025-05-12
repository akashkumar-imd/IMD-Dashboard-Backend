import jwt from "jsonwebtoken";
import {
  checkUserValidCred,
  deleteExpiredRecords,
  getUserCredByToken,
  updateAccessToken
} from "../services/auth.service.js";
import { allUserById, } from "../services/users.service.js";
import { messageLogs, userCredMessage } from "../utils/message.js";
import { Constants } from "../utils/constants.js";


const checkValidAccessToken=(token)=>{
  if (!token) return res.status(401).json({ message: messageLogs.NO_ACCESS });
  try {
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      return {
        statusCode:200,
        data:verified
      };
    } catch (error) {
      if (error.name === Constants.TOKEN_EXPIRE_ERROR) {
        return { 
          statusCode:401,
          error: messageLogs.SESSION_EXPIRED, 
          message: messageLogs.TOKEN_EXPIRES 
        }
      }
    }
}

// check weather token is valid or tempered
const checkProtectedToken = async (req, res) => {
  const { userId, accessToken, tokenVersion } = req.body;
  try {
    let userCredentials;
    if (userId) {
      userCredentials = await checkUserValidCred(userId);
    }
    
    if (!userCredentials){
      return res.status(401).json({
        statusCode: 401,
        message: userCredMessage.UNVALID_CRED,
      });
    }
    let userCredData;
    if (Array.isArray(userCredentials)) {
      userCredData = userCredentials?.find(
        (item) => {return item.tokenVersion == tokenVersion}
      );
    } else {
      userCredData = userCredentials;
    }

    const isValid =checkValidAccessToken(accessToken) 
    
    if (
      userCredData.accessToken == accessToken &&
      userCredData.accessTokenStatus == 1 &&
      isValid.statusCode==200
    ) {

      return res.status(200).json({
        statusCode: 200,
        message: userCredMessage.VALID_CRED,
      });
    }
    return res.status(401).json({
      statusCode: 401,
      message: userCredMessage.UNVALID_CRED,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: messageLogs.ERROR_MESSAGE, error: error });
  }
};

//remove credentials from user credentials table on time expired
const removeUserCredentials = async (req, res) => {
  try {
    const deletedRows = await deleteExpiredRecords();

    return res.status(200).json({
      statusCode: 200,
      message: messageLogs.CLR_UNUSED_CRED,
      result: deletedRows,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: messageLogs.ERROR_MESSAGE, error: error });
  }
};

//generate new access token form old access token
const generateAccessToken = async (req, res) => {
  console.log("generateAccessToken---------called");
  
  const { refreshToken } = req.body;
  try {
    if (refreshToken && refreshToken != "") {
      const userCredDetails = await getUserCredByToken(refreshToken);
      
      if (!userCredDetails) {
        return res.status(401).json({
          statusCode: 401,
          message: userCredMessage.UNVALID_CRED,
        });
      }
      const userId = userCredDetails.userId;
      
    
      const userDetails = await allUserById(userId);

      const newToken = jwt.sign(
        {
          email: userDetails[0].email,
        userId: userDetails[0].userId,
        username: userDetails[0].username,
        status: userDetails[0].status,
        role: userDetails[0].role,
        },
        process.env.JWT_SECRET,
        { expiresIn: Constants.TOKEN_VALID_LIMIT }
      );
      
      await updateAccessToken(refreshToken,newToken)
      

      return res.status(200).json({
        statusCode:200,
        message:userCredMessage.NEW_TOKEN,
        result:newToken
      })
    }


    return res.status(401).json({
      statusCode: 401,
      message: userCredMessage.UNVALID_CRED,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: messageLogs.ERROR_MESSAGE, error: error });
  }
};

export { checkProtectedToken, removeUserCredentials,generateAccessToken };
