import express from "express"
import createNotesRoutes from "./routes/notesRoutes.js"
import createUserRoutes from "./routes/usersRoutes.js"
import { connectnotesDB, connectusersDB, startCleanJob } from "./config/db.js"
import { createUserModel } from "./models/User.js"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"
dotenv.config()
let notesDB
let usersDB
const startServer = async () => {
    try {
        notesDB = await connectnotesDB()
        usersDB = await connectusersDB()
        console.log("Databases connected")
        startCleanJob()
    } catch (error) {
        console.error("Error connecting to the databases !")
        process.exit(1);
    }
    const User = createUserModel(usersDB)
    const PORT = process.env.PORT || 5003
    const app = express();
    app.use(express.json())
    app.use(cookieParser())
    app.use("/api/notes", createNotesRoutes(notesDB))
    app.use("/api", createUserRoutes(usersDB))
    app.listen((PORT), () => {
        console.log("Server started on port:", PORT)
    })
}
startServer();

