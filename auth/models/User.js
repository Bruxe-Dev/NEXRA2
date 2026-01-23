import mongoose from "mongoose"
export const createUserModel = (usersDB) => {
    if (usersDB.models.User) {
        return usersDB.models.User
    }
    const userSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true,
            minlength: 8
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        refreshToken: {
            type: String,
            default: null
        },
        tokenVersion: {
            type: Number,
            default: 1
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        isLoggedIn: {
            type: Boolean,
            default: false
        },
        otpToken: {
            type: String,
            default: null
        },
        expiresAt: {
            type: Date
        },
        passToken: {
            type: String,
            default: null
        },
        requestedPass: {
            type: Boolean,
            default: false
        },
        passExp: {
            type: Date,
            default: new Date()
        },
        passVerify: {
            type: Boolean,
            default: false
        }



    }, { timestamps: true })
    return usersDB.model("User", userSchema)
}
