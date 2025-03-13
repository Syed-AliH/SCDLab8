import request from "supertest"
import app from "../app.js"
import { clearData } from "../data/store.js"

beforeAll(() => {
  process.env.JWT_SECRET = "test-secret-key"
})

afterEach(() => {
  clearData()
})

describe("Auth API", () => {
  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      const res = await request(app).post("/api/auth/register").send({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      })

      expect(res.statusCode).toEqual(201)
      expect(res.body).toHaveProperty("token")
      expect(res.body.username).toEqual("testuser")
      expect(res.body.email).toEqual("test@example.com")
    })

    it("should not register a user with existing email", async () => {
      await request(app).post("/api/auth/register").send({
        username: "existinguser",
        email: "existing@example.com",
        password: "password123",
      })

      const res = await request(app).post("/api/auth/register").send({
        username: "newuser",
        email: "existing@example.com",
        password: "password123",
      })

      expect(res.statusCode).toEqual(400)
      expect(res.body.message).toContain("User already exists")
    })
  })

  describe("POST /api/auth/login", () => {
    it("should login an existing user", async () => {
      await request(app).post("/api/auth/register").send({
        username: "loginuser",
        email: "login@example.com",
        password: "password123",
      })

      const res = await request(app).post("/api/auth/login").send({
        email: "login@example.com",
        password: "password123",
      })

      expect(res.statusCode).toEqual(200)
      expect(res.body).toHaveProperty("token")
      expect(res.body.username).toEqual("loginuser")
    })

    it("should not login with invalid credentials", async () => {
      await request(app).post("/api/auth/register").send({
        username: "invaliduser",
        email: "invalid@example.com",
        password: "password123",
      })

      const res = await request(app).post("/api/auth/login").send({
        email: "invalid@example.com",
        password: "wrongpassword",
      })

      expect(res.statusCode).toEqual(401)
      expect(res.body.message).toContain("Invalid credentials")
    })
  })

  describe("GET /api/auth/profile", () => {
    it("should get user profile with valid token", async () => {
      const registerRes = await request(app).post("/api/auth/register").send({
        username: "profileuser",
        email: "profile@example.com",
        password: "password123",
      })

      const token = registerRes.body.token

      const res = await request(app).get("/api/auth/profile").set("Authorization", `Bearer ${token}`)

      expect(res.statusCode).toEqual(200)
      expect(res.body.username).toEqual("profileuser")
      expect(res.body.email).toEqual("profile@example.com")
    })

    it("should not get profile without token", async () => {
      const res = await request(app).get("/api/auth/profile")

      expect(res.statusCode).toEqual(401)
    })
  })
})

