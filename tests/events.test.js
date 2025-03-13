import request from "supertest"
import app from "../app.js"
import { clearData } from "../data/store.js"

let token
let userId
let categoryId

// Setup and teardown
beforeAll(async () => {
  process.env.JWT_SECRET = "test-secret-key"

  // Create a test user
  const registerRes = await request(app).post("/api/auth/register").send({
    username: "eventuser",
    email: "events@example.com",
    password: "password123",
  })

  token = registerRes.body.token
  userId = registerRes.body.id

  // Create a test category
  const categoryRes = await request(app).post("/api/categories").set("Authorization", `Bearer ${token}`).send({
    name: "Test Category",
    color: "#ff0000",
  })

  categoryId = categoryRes.body.id
})

afterEach(() => {
  // Clear events before each test
  clearData()

  // Recreate the test user and category
  return request(app)
    .post("/api/auth/register")
    .send({
      username: "eventuser",
      email: "events@example.com",
      password: "password123",
    })
    .then((res) => {
      token = res.body.token
      userId = res.body.id

      return request(app).post("/api/categories").set("Authorization", `Bearer ${token}`).send({
        name: "Test Category",
        color: "#ff0000",
      })
    })
    .then((res) => {
      categoryId = res.body.id
    })
})

describe("Events API", () => {
  describe("POST /api/events", () => {
    it("should create a new event", async () => {
      const res = await request(app)
        .post("/api/events")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Test Event",
          description: "Test Description",
          date: "2023-12-31T12:00:00.000Z",
          categoryId: categoryId,
          reminders: ["2023-12-31T11:00:00.000Z"],
        })

      expect(res.statusCode).toEqual(201)
      expect(res.body.name).toEqual("Test Event")
      expect(res.body.description).toEqual("Test Description")
      expect(new Date(res.body.date).toISOString()).toEqual("2023-12-31T12:00:00.000Z")
      expect(res.body.categoryId).toEqual(categoryId)
      expect(res.body.reminders).toHaveLength(1)
    })

    it("should not create event without authentication", async () => {
      const res = await request(app).post("/api/events").send({
        name: "Test Event",
        description: "Test Description",
        date: "2023-12-31T12:00:00.000Z",
      })

      expect(res.statusCode).toEqual(401)
    })
  })

  describe("GET /api/events", () => {
    beforeEach(async () => {
      // Create some test events
      await request(app).post("/api/events").set("Authorization", `Bearer ${token}`).send({
        name: "Event 1",
        description: "Description 1",
        date: "2023-12-01T12:00:00.000Z",
        categoryId: categoryId,
      })

      await request(app).post("/api/events").set("Authorization", `Bearer ${token}`).send({
        name: "Event 2",
        description: "Description 2",
        date: "2023-12-15T12:00:00.000Z",
        categoryId: categoryId,
      })

      await request(app).post("/api/events").set("Authorization", `Bearer ${token}`).send({
        name: "Event 3",
        description: "Description 3",
        date: "2023-12-31T12:00:00.000Z",
        categoryId: categoryId,
      })
    })

    it("should get all events for user", async () => {
      const res = await request(app).get("/api/events").set("Authorization", `Bearer ${token}`)

      expect(res.statusCode).toEqual(200)
      expect(res.body).toHaveLength(3)
    })

    it("should filter events by date range", async () => {
      const res = await request(app).get("/api/events").set("Authorization", `Bearer ${token}`).query({
        startDate: "2023-12-10T00:00:00.000Z",
        endDate: "2023-12-20T00:00:00.000Z",
      })

      expect(res.statusCode).toEqual(200)
      expect(res.body).toHaveLength(1)
      expect(res.body[0].name).toEqual("Event 2")
    })
  })

  describe("PUT /api/events/:id", () => {
    let eventId

    beforeEach(async () => {
      // Create a test event
      const eventRes = await request(app).post("/api/events").set("Authorization", `Bearer ${token}`).send({
        name: "Update Test Event",
        description: "Original Description",
        date: "2023-12-31T12:00:00.000Z",
        categoryId: categoryId,
      })

      eventId = eventRes.body.id
    })

    it("should update an event", async () => {
      const res = await request(app).put(`/api/events/${eventId}`).set("Authorization", `Bearer ${token}`).send({
        name: "Updated Event",
        description: "Updated Description",
      })

      expect(res.statusCode).toEqual(200)
      expect(res.body.name).toEqual("Updated Event")
      expect(res.body.description).toEqual("Updated Description")
    })
  })

  describe("DELETE /api/events/:id", () => {
    let eventId

    beforeEach(async () => {
      // Create a test event
      const eventRes = await request(app).post("/api/events").set("Authorization", `Bearer ${token}`).send({
        name: "Delete Test Event",
        description: "Description",
        date: "2023-12-31T12:00:00.000Z",
        categoryId: categoryId,
      })

      eventId = eventRes.body.id
    })

    it("should delete an event", async () => {
      const res = await request(app).delete(`/api/events/${eventId}`).set("Authorization", `Bearer ${token}`)

      expect(res.statusCode).toEqual(200)

      // Verify event is deleted
      const getRes = await request(app).get(`/api/events/${eventId}`).set("Authorization", `Bearer ${token}`)

      expect(getRes.statusCode).toEqual(404)
    })
  })
})

