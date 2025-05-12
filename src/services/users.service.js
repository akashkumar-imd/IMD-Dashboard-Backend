import { PrismaClient } from "@prisma/client";
import { messageLogs } from "../utils/message.js";

const prisma = new PrismaClient();

const checkUserExist = async (email, username) => {
  try {
    const user = await prisma.users.findMany({
      where: {
        OR: [{ email: email }, { username: username }],
      },
    });

    return user;
  } catch (error) {
    console.log(error);
    return {
      status: 500,
      data: { message: messageLogs.ERROR_MESSAGE, error: error },
    };
  } finally {
    await prisma.$disconnect();
  }
};

const userCreationInDB = async (
  email,
  hashedPassword,
  username,
  mobile,
  status,
  role
) => {
  try {
    
    const newUser = await prisma.users.create({
      data: {
        email: email,
        username: username,
        password: hashedPassword,
        mobile: mobile.toString(),
        status: status,
        role: role,
      },
    });
    
    return newUser;
  } catch (error) {
    console.log(error);
    return {
      status: 500,
      data: { message: messageLogs.ERROR_MESSAGE, error: error },
    };
  } finally {
    await prisma.$disconnect();
  }
};

const findUserByEmail = async (email) => {
  try {
    const user = await prisma.users.findUnique({
      where: { email: email },
    });

    return user;
  } catch (error) {
    console.log(error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
};

const updateUserStatus = async (status,userId) => {
  try {
    const data = await prisma.users.update({
      where: {userId:userId },
      data: {
        status: status,
      },
    });
    
    return data;
  } catch (error) {
    console.log(error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
};

//here if we have provide userId than it will fetch acc to userId's
const allUserById = async (userId) => {
  try {
    let data;
    if(userId){
      data = await prisma.users.findMany({where:{userId:userId}})
    }else{
      data = await prisma.users.findMany()
    }
    
    return data;
  } catch (error) {
    console.log(error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
};

export { 
  checkUserExist,
  userCreationInDB,
  findUserByEmail,
  updateUserStatus,
  allUserById 
}
