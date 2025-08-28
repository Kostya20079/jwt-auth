import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import argon2 from "argon2";

export const auth = Router();
const prisma = new PrismaClient();
const JWT_SECRET = ""; // secret jwt code

auth.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await prisma.user.findUnique({
    where: {
      username: username,
    },
  });

  if (!user) {
    return res.status(400).json({ access: false, message: "User Not Found" });
  }

  try {
    if (await argon2.verify(user.password, password)) {
      const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET);
      return res.status(200).json({ access: true, accessToken: accessToken });
    } else {
      return res
        .status(400)
        .json({ access: false, message: "Invalid password provided" });
    }
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ access: false, message: "Internal Server Error" });
  }
});

auth.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ access: false, message: "Missing Fields" });
  }

  const result = await prisma.user.findFirst({
    where: {
      OR: [{ username: username }, { email: email }],
    },
  });

  if (result) {
    return res.status(400).json({ access: false, message: "User Exists" });
  }

  // hashing password with argon2
  const hashedPassword = await argon2.hash(password);

  try {
    // creating user
    const user = await prisma.user.create({
      data: {
        username: username,
        email: email,
        password: hashedPassword,
      },
    });

    // creating JWT token
    const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET);

    return res.status(200).json({ access: true, accessToken: accessToken });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ access: false, message: "Internal Server Error" });
  }
});
