import { Request, Response } from "express"
import { prisma } from "../db/prisma"

// #region PicoHearbeat

/**
 * POST /api/pico-heartbeat
 */
export const picoHearbeat = async (req: Request, res: Response) => {
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

// #region PicoOccupied

/**
 * POST /api/pico-occupied
 * Body: { id: string, occupied: boolean }
 */
export const picoOccupied = async (req: Request, res: Response) => {
  try {
    const { id, occupied } = req.body
    
    if (!id || typeof occupied !== 'boolean') 
      {
      return res.status(400).json({ 
        success: false, 
        message: "id and occupied (boolean) are required" 
      })
    }

    // Find the controller
    const controller = await prisma.controller.findUnique({
      where: { id },
      include: { desks: true },
    })

    if (!controller) 
    {
      return res.status(404).json({ 
        success: false, 
        message: "Controller not found" 
      })
    }

    await prisma.desk.updateMany({
      where: { controller_id: id },
      data: { is_locked: occupied }
    })

    res.json({ success: true })


  } catch (error) {
    console.error("Error updating controller occupied status: ", error)
    res.status(500).json({ success: false, message: "Failed to update controller" })
  }
}

/*
export const createDeskMate = async (req: Request, res: Response) => {
  try {
    const { userId, name } = req.body
    if (!userId || !name)
      return res
        .status(400)
        .json({ success: false, message: "userId and name required" })

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" })

    const exists = await prisma.deskMate.findFirst({
      where: { user_id: userId },
    })
    if (exists)
      return res.status(409).json({ success: false, message: "DeskMate already exists" })

    const deskmate = await prisma.deskMate.create({
      data: { user_id: userId, name: name },
      include: { user: true },
    })
    res.status(201).json({ success: true, data: deskmate })
  } catch (error) {
    console.error("Error creating deskmate:", error)
    res.status(500).json({ success: false, message: "Failed to create deskmate" })
  }
}
*/


// #endregion

// #region PicoConnect

/**
 * POST /api/pico-connect
 * Body: { last_id: string }
 */
export const picoConnect = async (req: Request, res: Response) => {
  try {
    const { last_id } = req.body
    if (!last_id) return res.status(400).json({ success: false, message: "last_id required" })


    res.status(201).json({ success: true, data: last_id })
  } catch (error) {
    console.error("Error creating controller:", error)
    res.status(500).json({ success: false, message: "Failed to create controller" })
  }
}

// #endregion

// #region Update

