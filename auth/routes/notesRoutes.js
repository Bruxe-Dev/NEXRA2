import express from "express"
import { createNote, deleteNote, getNote, updateNote } from "../controllers/notesControllers.js";
import { createNoteModel } from "../models/Note.js";
import { authMiddleware } from "../controllers/usersControllers.js";
import { connectusersDB } from "../config/db.js"
import { createUserModel } from "../models/User.js";
import swagger from "swagger-jsdoc"
export
    const usersDB = await connectusersDB()
const User = createUserModel(usersDB)
const createNoteRoutes = (notesDB) => {
    const router = express.Router();
    const Note = createNoteModel(notesDB)
    router.get("/", authMiddleware(User), getNote(Note))
    router.post("/", authMiddleware(User), createNote(Note))
    router.put("/:id", authMiddleware(User), updateNote(Note))
    router.delete("/:id", authMiddleware(User), deleteNote(Note))
    return router
}
export default createNoteRoutes
