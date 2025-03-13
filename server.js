import app from "./app.js"
import dotenv from "dotenv"

dotenv.config()

const PORT = process.env.PORT || 5000

if (!process.env.JWT_SECRET) {
  console.warn("WARNING: JWT_SECRET environment variable is not set. Using a default secret for development.")
  process.env.JWT_SECRET = "dev_secret_not_secure_for_production"
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

