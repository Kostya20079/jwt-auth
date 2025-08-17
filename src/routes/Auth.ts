import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

export const auth = Router();
const prisma = new PrismaClient();
const JWT_SECRET = "";

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
    if (password == user.password) {
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

  try {
    // creating user
    const user = await prisma.user.create({
      data: {
        username: username,
        email: email,
        password: password,
      },
    });

    // creating JWT token
    const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET);

    return res.status(200).json({ access: true, accessToken: accessToken });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ access: false, message: "Internal Server Error" });
  }
});
