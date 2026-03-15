import express from "express"
import { getTeams, addTeamMember, updateTeamMember, deleteTeamMember } from "../controllers/teamController.js"
import verifyAdmin from "../middleware/adminMiddleware.js"

const router = express.Router()

// get team members
router.get("/", getTeams)

// admin adds team member
router.post("/", verifyAdmin, addTeamMember)

// admin updates team member
router.put("/:id", verifyAdmin, updateTeamMember)

// admin deletes team member
router.delete("/:id", verifyAdmin, deleteTeamMember)

export default router;