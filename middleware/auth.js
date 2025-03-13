import jwt from "jsonwebtoken"
import { findUserById } from "../data/store.js"

export const authenticate = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({ message: "Authentication required" })
    }

    // Ensure JWT_SECRET is available
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "Server configuration error" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = findUserById(decoded.id)

    if (!user) {
      return res.status(401).json({ message: "User not found" })
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ message: "Invalid token" })
  }
}

