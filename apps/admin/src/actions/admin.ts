import { createSafeAction } from "@/lib/safe-action";
import { z } from "zod";

const adminSchema = z.object({
  action: z.enum(["getStats", "getUsers", "getPosts"]),
});

export const adminAction = createSafeAction(adminSchema, async ({ action }) => {
  try {
    switch (action) {
      case "getStats":
        return {
          success: true,
          data: {
            totalUsers: 0,
            totalPosts: 0,
            activeSessions: 0,
            systemStatus: "healthy",
          },
        };
      case "getUsers":
        return {
          success: true,
          data: [],
        };
      case "getPosts":
        return {
          success: true,
          data: [],
        };
      default:
        return {
          success: false,
          error: "Invalid action",
        };
    }
  } catch (error) {
    return {
      success: false,
      error: "Something went wrong",
    };
  }
});
