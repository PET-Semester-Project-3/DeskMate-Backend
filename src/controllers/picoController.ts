import { Request, Response } from "express"
import { prisma } from "../db/prisma"

// #region PicoHearbeat

/**
 * POST /api/pico-heartbeat
 * Body: { id: string }
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
    const controller = await prisma.controller.findFirst({
      where: { name: id },
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

// #endregion

// #region PicoConnect

/**
 * POST /api/pico-connect
 * Body: { last_id: string }
 */
export const picoConnect = async (req: Request, res: Response) => {
  try {
    const { last_id } = req.body
    
    // If last_id is not "-1", check if controller exists
    if (last_id && last_id !== "-1") 
    {
      const existingController = await prisma.controller.findFirst({
        where: { name: last_id }
      })


      if (existingController) 
      {
        return res.status(200).json({ 
          success: true, 
          id: last_id 
        })
      }
    }


    const newController = await prisma.$transaction(async (tx) => {
    const controller = await tx.controller.create({
      data: {name:"-1"}
    })
    
    // Because I am not sure what name is apperently supposed to be
    return await tx.controller.update({
      where: { id: controller.id },
      data: { name: controller.id }
    })
  })


    res.status(200).json({ 
      success: true, 
      id: newController.id 
    })
    
  } catch (error) {
    console.error("Error in pico-connect:", error)
    res.status(500).json({ success: false, message: "Failed to process pico connection" })
  }
}

// #endregion

// #region Update

