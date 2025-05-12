import express from "express";
import { checkDatabaseConnection } from "./src/config/prisma.js";
import dotenv from "dotenv";
import cors from 'cors'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(cors());

app.get("/serverHealthCheck", async (req, res) => {
  try {
    res.status(200).send("Server is working Properly");
  } catch (error) {
    res.status(500).json({ message: "Health Issue" });
  }
});

app.get("/databaseHealthCheck", async (req, res) => {
  const dbStatus = await checkDatabaseConnection();
  res.json({
    status: dbStatus.connected ? "healthy" : "unhealthy",
    database: dbStatus,
  });
});


//routes list



app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
