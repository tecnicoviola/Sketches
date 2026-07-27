import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import express from "express";
import jwt from "jsonwebtoken";
import cors from "cors";
import bcrypt from "bcrypt";

import { JWT_SECRET } from "@repo/backend-common";
import { middleware } from "./middleware";
import {
  CreateUserSchema,
  SigninSchema,
  CreateRoomSchema,
} from "@repo/common/types";
import { prismaClient } from "@repo/db/src";

const app = express();
const prisma = prismaClient;
const PORT = process.env.PORT || 3004;

// Startup check for DATABASE_URL format
if (!process.env.DATABASE_URL || (!process.env.DATABASE_URL.startsWith("postgresql://") && !process.env.DATABASE_URL.startsWith("postgres://"))) {
  console.error("❌ CRITICAL DATABASE_URL ERROR: process.env.DATABASE_URL is missing or invalid. It must start with postgresql:// or postgres://");
}

//  Middleware FIRST before everything
app.use(express.json());
const frontendOrigin = process.env.FRONTEND_URL;
app.use(
  cors({
    origin: frontendOrigin ? (frontendOrigin.includes(",") ? frontendOrigin.split(",") : frontendOrigin) : "http://localhost:3001",
    credentials: true,
  })
);

//  SIGNUP
app.post("/signup", async (req, res) => {
  const body = {
    username: req.body.email,  // map email → username for schema
    password: req.body.password,
    name: req.body.name,
  };

  const parseData = CreateUserSchema.safeParse(body);
  if (!parseData.success) {
    res.status(400).json({
      message: "Incorrect inputs: " + parseData.error.issues[0]?.message,//get the first error 
    });
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(parseData.data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: parseData.data.username,
        password: hashedPassword,
        name: parseData.data.name,
      },
    });

    res.status(201).json({ userId: user.id });
  } catch (e: any) {
    if (e?.code === "P2002") {
      res.status(409).json({ message: "User already exists with this email." });
    } else if (e?.name === "PrismaClientInitializationError") {
      console.error("Signup DB Initialization Error:", e?.message);
      res.status(500).json({ message: "Database connection failed. Please verify DATABASE_URL on Render." });
    } else {
      console.error("Signup error:", e);
      res.status(500).json({ message: "Internal server error." });
    }
  }
});

//  SIGNIN
app.post("/signin", async (req, res) => {
  const body = {
    username: req.body.email,  // map email → username for schema
    password: req.body.password,
  };

  const parseData = SigninSchema.safeParse(body);
  if (!parseData.success) {
    res.status(400).json({
      message: "Incorrect inputs: " + parseData.error.issues[0]?.message,
    });
    return;
  }

  try {
    const user = await prismaClient.user.findFirst({
      where: {
        email: parseData.data.username,
      },
    });

    if (!user) {
      res.status(403).json({ message: "Invalid email or password." });
      return;
    }

    const passwordMatch = await bcrypt.compare(
      parseData.data.password,
      user.password
    );

    if (!passwordMatch) {
      res.status(403).json({ message: "Invalid email or password." });
      return;
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.json({ token, userId: user.id });
  } catch (e: any) {
    if (e?.name === "PrismaClientInitializationError") {
      console.error("Signin DB Initialization Error:", e?.message);
      res.status(500).json({ message: "Database connection failed. Please verify DATABASE_URL on Render." });
    } else {
      console.error("Signin error:", e);
      res.status(500).json({ message: "Internal server error." });
    }
  }
});

import { customAlphabet } from "nanoid";
const generateRoomCode = customAlphabet("23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ", 5);

// ROOMS LIST FOR USER
app.get("/rooms", middleware, async (req, res) => {
  //@ts-ignore
  const userId = req.userId;
  try {
    const rooms = await prismaClient.room.findMany({
      where: {
        adminId: userId,
      },
      orderBy: {
        createAt: "desc",
      },
    });
    res.json({ rooms });
  } catch (e) {
    res.status(500).json({ message: "Error fetching rooms" });
  }
});

// CREATE ROOM (NO NAME BODY REQUIRED, CAP = 3)
app.post("/room", middleware, async (req, res) => {
  //@ts-ignore
  const userId = req.userId;

  try {
    const existingCount = await prismaClient.room.count({
      where: { adminId: userId },
    });
    if (existingCount >= 3) {
      res.status(403).json({ message: "Room limit reached — delete a room to create a new one." });
      return;
    }
  } catch (e) {
    res.status(500).json({ message: "Failed to check room count." });
    return;
  }

  let room = null;
  let attempts = 0;
  while (attempts < 5) {
    attempts++;
    const code = generateRoomCode();
    try {
      room = await prismaClient.room.create({
        data: {
          slug: code,
          adminId: userId,
        },
      });
      break;
    } catch (e: any) {
      if (e?.code === "P2002" && attempts < 5) {
        continue;
      }
      res.status(500).json({ message: "Failed to create room." });
      return;
    }
  }

  if (!room) {
    res.status(500).json({ message: "Failed to create room." });
    return;
  }

  res.json({ roomId: room.id, code: room.slug });
});

// DELETE ROOM BY CODE
app.delete("/room/:code", middleware, async (req, res) => {
  const code = String(req.params.code || "").trim();
  //@ts-ignore
  const userId = req.userId;

  try {
    const room = await prismaClient.room.findFirst({
      where: { slug: { equals: code, mode: "insensitive" } },
    });
    if (!room) {
      res.status(404).json({ message: "Room not found." });
      return;
    }

    if (room.adminId !== userId) {
      res.status(403).json({ message: "Unauthorized to delete this room." });
      return;
    }

    await prismaClient.room.delete({
      where: { id: room.id },
    });

    res.json({ message: "Room deleted successfully." });
  } catch (e) {
    console.error("Delete room error:", e);
    res.status(500).json({ message: "Failed to delete room." });
  }
});

// CHATS
app.get("/chats/:roomId", async (req, res) => {
  try {
    const roomId = Number(req.params.roomId);
    const messages = await prismaClient.chat.findMany({
      where: { roomId },
      orderBy: { id: "desc" },
      take: 1000,
    });
    res.json({ messages });
  } catch (e) {
    res.json({ messages: [] });
  }
});

// ROOM BY SLUG / CODE
app.get("/room/:slug", async (req, res) => {
  const slug = String(req.params.slug || "").trim();
  const room = await prismaClient.room.findFirst({
    where: { slug: { equals: slug, mode: "insensitive" } },
  });
  res.json({ room });
});

//  listen at the end
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});