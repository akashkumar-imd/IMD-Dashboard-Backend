import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const checkUserValidCred = async(userId)=>{
  try {
    const user= await prisma.users_credentials.findMany({
      where:{
        userId:Number(userId),
      }
    })
    
    return user;

  } catch (error) {
    console.log(error);
    return false;
  }finally {
    await prisma.$disconnect();
  }
}

const deleteExpiredRecords = async()=>{
  const currentDate = new Date();
  try {
    const user= await prisma.users_credentials.deleteMany({
      where:{
        gte: currentDate,
      },
    })

    return user;
  } catch (error) {
    console.log(error);
    return false;
  }finally {
    await prisma.$disconnect();
  }
}

//getting user creedential by using refresh token
const getUserCredByToken = async (token)=>{
  try {
    const userCred= await prisma.users_credentials.findMany({
      where:{
        refreshToken: token,
      },
    })

    return userCred[0];
  } catch (error) {
    console.log(error);
    return false;
  }finally {
    await prisma.$disconnect();
  }
}

const createUserCredentialsRecord = async (userId,refreshToken,accesstoken,tokenVersion,expiredAt)=>{
  try {
    const userCred= await prisma.users_credentials.create({
      data:{
        userId:Number(userId),
        refreshToken:refreshToken,
        accessToken:accesstoken,
        tokenVersion:Number(tokenVersion),
        accessTokenStatus:1,
        expiredAt:expiredAt
      },
    })

    return userCred;
  } catch (error) {
    console.log(error);
    return false;
  }finally {
    await prisma.$disconnect();
  }
}

const updateAccessTokenStatus = async (tokenVersion)=>{
  try {
    const userCred= await prisma.users_credentials.update({
      where:{
        tokenVersion: Number(tokenVersion)
      },
      data:{
        accessTokenStatus:0
      }
    })

    return userCred;
  } catch (error) {
    console.log(error);
    return false;
  }finally {
    await prisma.$disconnect();
  }
}

const updateAccessToken = async (refreshToken,accessToken)=>{
  try {
    const userCred= await prisma.users_credentials.update({
      where:{
        refreshToken: refreshToken
      },
      data:{
        accessToken:accessToken
      },
    })

    return userCred;
  } catch (error) {
    console.log(error);
    return false;
  }finally {
    await prisma.$disconnect();
  }
}

export { 
  checkUserValidCred,
  deleteExpiredRecords,
  getUserCredByToken,
  createUserCredentialsRecord,
  updateAccessTokenStatus,
  updateAccessToken
}
