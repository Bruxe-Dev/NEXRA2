import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config()
let noteconn
let userconn
export const connectnotesDB = async () => {
    if (!noteconn) {
        noteconn = mongoose.createConnection(process.env.MONGO_URI);
        return new Promise((resolve, reject) => {
            noteconn.once('open', () => {
                console.log("Notes DB connected successfully !");
                resolve(noteconn);
            })
            noteconn.on('error', (error) => {
                console.log("Error while connecting to the Notes DB", error);
                reject(error);
            })
        })
    }
    return noteconn;
}
export const connectusersDB = async () => {
    if (!userconn) {
        userconn = mongoose.createConnection(process.env.MONGO_URL)
        return new Promise((resolve, reject) => {
            userconn.once('open', () => {
                console.log("Users DB connected successfully");
                resolve(userconn);
            })
            userconn.on('error', (error) => {
                console.log("Error while connecting to Users DB", error)
                reject(error)
            })
        })
    }
    return userconn
}
export const startCleanJob = (User) => async () => {
    setInterval(async () => {
        try {
            const result = await User.deleteMany({
                isVerified: false
            })
            if (result.deletedCount > 0) {
                console.log(`${result.deletedCount} Users deleted from the database . They never confirmed their emails`)
            }
        } catch (error) {
            console.error("Error in database Manipulation", error)

        }
    })

}