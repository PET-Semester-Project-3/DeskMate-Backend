import { Request, Response } from "express"
import { prisma } from "../db/prisma"

// #region GetAll

/**
 * GET /api/controllers
 */
export const getAllControllers = async (req: Request, res: Response) => {
  try {
    const controllers = await prisma.controller.findMany({
      include: { desks: true },
    })
    res.json({ success: true, data: controllers })
  } catch (error) {
    console.error("Error fetching controllers:", error)
    res.status(500).json({ success: false, message: "Failed to fetch controllers" })
  }
}

// #endregion

// #region Get

/**
 * GET /api/controllers/:id
 */
export const getControllerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const controller = await prisma.controller.findUnique({
      where: { id },
      include: { desks: true },
    })
    if (!controller)
      return res.status(404).json({ success: false, message: "Controller not found" })
    res.json({ success: true, data: controller })
  } catch (error) {
    console.error("Error fetching controller:", error)
    res.status(500).json({ success: false, message: "Failed to fetch controller" })
  }
}

// #endregion

// #region Create

/**
 * POST /api/controllers
 * Body: { name: string }
 */
export const createController = async (req: Request, res: Response) => {
  try {
    const { name } = req.body
    if (!name) return res.status(400).json({ success: false, message: "name required" })

    const controller = await prisma.controller.create({
      data: { name },
    })

    res.status(201).json({ success: true, data: controller })
  } catch (error) {
    console.error("Error creating controller:", error)
    res.status(500).json({ success: false, message: "Failed to create controller" })
  }
}

// #endregion

// #region Update

/**
 * PUT /api/controllers/:id
 * Body: { name?: string }
 */
export const updateController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name } = req.body

    const existing = await prisma.controller.findUnique({ where: { id } })
    if (!existing)
      return res.status(404).json({ success: false, message: "Controller not found" })

    const updated = await prisma.controller.update({
      where: { id },
      data: { ...(name !== undefined ? { name } : {}) },
    })

    res.json({ success: true, data: updated })
  } catch (error) {
    console.error("Error updating controller:", error)
    res.status(500).json({ success: false, message: "Failed to update controller" })
  }
}

// #endregion

// #region Delete

/**
 * DELETE /api/controllers/:id
 */
export const deleteController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const existing = await prisma.controller.findUnique({ where: { id } })
    if (!existing)
      return res.status(404).json({ success: false, message: "Controller not found" })

    await prisma.controller.delete({ where: { id } })
    res.json({ success: true, message: "Controller deleted" })
  } catch (error) {
    console.error("Error deleting controller:", error)
    res.status(500).json({ success: false, message: "Failed to delete controller" })
  }
}

// #endregion

// #region Get Controller Desks

/**
 * GET /api/controllers/:id/desks
 */
export const getControllerDesks = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const desks = await prisma.desk.findMany({ where: { controller_id: id } })
    res.json({ success: true, data: desks })
  } catch (error) {
    console.error("Error fetching controller desks:", error)
    res.status(500).json({ success: false, message: "Failed to fetch desks" })
  }
}

// #endregion