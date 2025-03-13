import {
    createCategory,
    findCategoryById,
    findCategoriesByUser,
    updateCategory,
    deleteCategory,
  } from "../data/store.js"
  
  export const createNewCategory = async (req, res, next) => {
    try {
      const { name, color } = req.body
  
      if (!name) {
        return res.status(400).json({ message: "Name is required" })
      }
  
      const category = createCategory({
        name,
        color: color || "#3498db",
        userId: req.user.id,
      })
  
      res.status(201).json(category)
    } catch (error) {
      next(error)
    }
  }
  
  export const getCategories = async (req, res, next) => {
    try {
      const categories = findCategoriesByUser(req.user.id)
      res.json(categories)
    } catch (error) {
      next(error)
    }
  }
  
  export const updateCategoryById = async (req, res, next) => {
    try {
      const { name, color } = req.body
  
      const category = findCategoryById(req.params.id)
  
      if (!category || category.userId !== req.user.id) {
        return res.status(404).json({ message: "Category not found" })
      }
  
      const updates = {}
      if (name) updates.name = name
      if (color) updates.color = color
  
      const updatedCategory = updateCategory(req.params.id, updates)
  
      res.json(updatedCategory)
    } catch (error) {
      next(error)
    }
  }
  
  export const deleteCategoryById = async (req, res, next) => {
    try {
      const category = findCategoryById(req.params.id)
  
      if (!category || category.userId !== req.user.id) {
        return res.status(404).json({ message: "Category not found" })
      }
  
      const result = deleteCategory(req.params.id)
  
      if (result.deleted) {
        res.json({ message: "Category deleted successfully" })
      } else {
        res.status(400).json({
          message: `Cannot delete category. It is used by ${result.eventsCount} events.`,
        })
      }
    } catch (error) {
      next(error)
    }
  }
  
  