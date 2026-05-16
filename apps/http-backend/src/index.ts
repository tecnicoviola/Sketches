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

//  Middleware FIRST before everything
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3001",
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
      message: "Incorrect inputs: " + parseData.error.issues[0]?.message,
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
});

// ROOM
app.post("/room", middleware, async (req, res) => {
  const parseData = CreateRoomSchema.safeParse(req.body);
  if (!parseData.success) {
    res.status(400).json({ message: "Incorrect inputs" });
    return;
  }

  //@ts-ignore
  const userId = req.userId;

  try {
    const room = await prismaClient.room.create({
      data: {
        slug: parseData.data.name,
        adminId: userId,
      },
    });
    res.json({ roomId: room.id });
  } catch (e) {
    res.status(409).json({ message: "Room already exists with this name." });
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

// ROOM BY SLUG
app.get("/room/:slug", async (req, res) => {
  const slug = req.params.slug;
  const room = await prismaClient.room.findFirst({ where: { slug } });
  res.json({ room });
});

//  listen at the end
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});