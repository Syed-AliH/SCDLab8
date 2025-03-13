import express from "express"
import {
  createNewCategory,
  getCategories,
  updateCategoryById,
  deleteCategoryById,
} from "../controllers/categoryController.js"
import { authenticate } from "../middleware/auth.js"

const router = express.Router()
router.use(authenticate)

router.post("/", createNewCategory)
router.get("/", getCategories)
router.put("/:id", updateCategoryById)
router.delete("/:id", deleteCategoryById)

export default router

