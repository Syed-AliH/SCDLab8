import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { createUser, findUserByEmail, findUserByUsername } from "../data/store.js"

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    console.warn("WARNING: JWT_SECRET environment variable is not set. Using a default secret for development.")
    process.env.JWT_SECRET = "dev_secret_not_secure_for_production"
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  })
}

export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please provide username, email and password" })
    }

    const emailExists = findUserByEmail(email)
    const usernameExists = findUserByUsername(username)

    if (emailExists || usernameExists) {
      return res.status(400).json({ message: "User already exists" })
    }
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const user = createUser({
      username,
      email,
      password: hashedPassword,
    })

    const token = generateToken(user.id)

    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      token,
    })
  } catch (error) {
    next(error)
  }
}

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" })
    }

    const user = findUserByEmail(email)
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Generate token
    const token = generateToken(user.id)

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      token,
    })
  } catch (error) {
    next(error)
  }
}

// Get user profile
export const getProfile = async (req, res) => {
  res.json({
    id: req.user.id,
    username: req.user.username,
    email: req.user.email,
  })
}

