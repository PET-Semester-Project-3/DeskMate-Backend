import { prisma } from "../db/prisma";
import * as simulatorService from "./simulatorService";

// Hardcoded user IDs from seed data
const ADMIN_USER_ID = "d93419b8-7f82-4a1f-943d-6ad9bde6d993";
const NORMAL_USER_ID = "d812baf1-1d50-4c83-ad2e-d65dd1d0dce2";

/**
 * Sync all desks from the simulator to the database.
 * Fetches desk IDs from simulator, then upserts each desk with its full data.
 * Also assigns all synced desks to the admin user and first desk to normal user.
 * @returns The number of desks synced
 */
export async function syncAllDesks(): Promise<number> {
  const deskIds = await simulatorService.getAllDeskIds();

  let syncedCount = 0;

  for (const deskId of deskIds) {
    try {
      const deskData = await simulatorService.getDeskData(deskId);

      // Build complete last_data with all simulator info (convert to plain JSON for Prisma)
      const lastData = JSON.parse(JSON.stringify({
        // Config
        manufacturer: deskData.config.manufacturer,
        // State
        position_mm: deskData.state.position_mm,
        height: Math.round(deskData.state.position_mm / 10), // Convert mm to cm
        speed_mms: deskData.state.speed_mms,
        status: deskData.state.status,
        isPositionLost: deskData.state.isPositionLost,
        isOverloadProtectionUp: deskData.state.isOverloadProtectionUp,
        isOverloadProtectionDown: deskData.state.isOverloadProtectionDown,
        isAntiCollision: deskData.state.isAntiCollision,
        // Usage
        activationsCounter: deskData.usage.activationsCounter,
        sitStandCounter: deskData.usage.sitStandCounter,
        // Errors
        lastErrors: deskData.lastErrors,
      }));

      await prisma.desk.upsert({
        where: { id: deskId },
        create: {
          id: deskId,
          name: deskData.config.name,
          is_online: true,
          last_data: lastData,
          last_data_at: new Date(),
        },
        update: {
          is_online: true,
          last_data: lastData,
          last_data_at: new Date(),
        },
      });

      // Assign desk to admin user
      const adminAssignment = await prisma.userDesk.findFirst({
        where: { user_id: ADMIN_USER_ID, desk_id: deskId },
      });
      if (!adminAssignment) {
        await prisma.userDesk.create({
          data: { user_id: ADMIN_USER_ID, desk_id: deskId },
        });
      }

      // Assign first desk to normal user
      if (syncedCount === 0) {
        const userAssignment = await prisma.userDesk.findFirst({
          where: { user_id: NORMAL_USER_ID, desk_id: deskId },
        });
        if (!userAssignment) {
          await prisma.userDesk.create({
            data: { user_id: NORMAL_USER_ID, desk_id: deskId },
          });
        }
      }

      syncedCount++;
    } catch (error) {
      console.error(`Failed to sync desk ${deskId}:`, error);
    }
  }

  return syncedCount;
}
