import express from "express"
import { getUsers, signUp, login, confirm, refreshToken, logout, authMiddleware } from "../controllers/usersControllers.js"
import { changePassword, resetCodeVer, resetPassword } from "../controllers/changePassCont.js"
import { createUserModel } from "../models/User.js"
const createUserRoutes = (usersDB) => {
    const router = express.Router()
    const User = createUserModel(usersDB)
    router.get("/", getUsers(User))
    router.post("/register", signUp(User))
    router.post("/login", login(User))
    router.post("/confirm", confirm(User))
    router.post("/refresh", refreshToken(User))
    router.post("/pass", changePassword(User))
    router.post("/verify", authMiddleware(User), resetCodeVer(User))
    router.post("/reset", authMiddleware(User), resetPassword(User))
    router.post("/logout", authMiddleware(User), logout(User))
    return router

}
export default createUserRoutes
