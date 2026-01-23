import bcrypt from "bcrypt"
import nodemailer from "nodemailer"
import dotenv from "dotenv"
import crypto from "crypto"
import jwt from "jsonwebtoken"
dotenv.config()

export const getUsers = (User) => async (req, res) => {
  try {
    const allUsers = await User.find()
    res.status(200).json(allUsers)
  } catch (error) {
    console.log("Error in controllers", error);
    res.status(500).json({ message: "Internal server error!" })

  }

}
export const signUp = (User) => async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "Fill in the required fields please!" })
    }
    let { name, password, email } = req.body
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const user = await User.findOne({ email })
    if (user) {
      return res.status(401).json({ message: "You already have an account.Please sign in" })
    }

    if (!name || !password || !email) {
      return res.status(400).json({ message: "Fill in all the required fields please !" })
    }
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" })
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" })
    }

    password = await bcrypt.hash(password, (10))
    const otp = crypto.randomInt(0, 1000000).toString().padStart(6, "0")
    const otpToken = crypto.createHash("sha256").update(otp).digest("hex")
    const expiresAt = new Date(Date.now() + 8 * 60 * 1000)
    const newUser = new User({ name, password, email, otpToken, expiresAt })
    await newUser.save()
    res.status(201).json({ message: "Account successfully created ! Welcome !" })
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.USER_NAME,
        pass: process.env.USER_PASS
      }

    })

    transporter.sendMail({
      from: "nezaniel@gmail.com",
      to: email,
      subject: "Email Confirmation",
      text: "Thank you for trying our system .Use the code provided below to secure and confirm your account",
      html: `<table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      role="presentation"
      style="background-color: #f4f6f8"
    >
      <tr>
        <td align="center" style="padding: 16px">
          <table
            cellpadding="0"
            cellspacing="0"
            role="presentation"
            style="
              background: #ffffff;
              margin: 0 auto;
              max-width: 700px;
              width: 100%;
            "
          >
            <tr>
              <td
                style="
                  background: linear-gradient(
                    135deg,
                    #5f3b26,
                    #f8c99d,
                    #5f3b26
                  );
                  padding: 22px;
                  text-align: center;
                  color: #1f2937;
                "
              >
                <h1
                  style="
                    margin: 0;
                    font-size: 20px;
                    font-weight: 600;
                    letter-spacing: 0.3px;
                  "
                >
                  Email Confirmation
                </h1>
              </td>
            </tr>

            <tr>
              <td style="padding: 28px 20px; text-align: center">
                <p
                  style="
                    font-size: 15px;
                    line-height: 1.6;
                    color: #374151;
                    margin-bottom: 24px;
                  "
                >
                  Thanks for joining <strong>Nexra</strong>. Use the
                  verification code below to confirm your email address.
                </p>

                <div
                  style="
                    display: inline-block;
                    padding: 18px 28px;
                    margin: 8px 0 22px;
                    background: linear-gradient(135deg, #fff7ed, #ffedd5);
                    border-radius: 10px;
                    border: 1px dashed #fdba74;
                  "
                >
                  <span
                    style="
                      font-size: 26px;
                      font-weight: 700;
                      letter-spacing: 5px;
                      color: #c2410c;
                    "
                  >
                    ${otp}
                  </span>
                </div>

                <p style="font-size: 13px; color: #6b7280; margin-top: 4px">
                  This code will expire in <strong>8 minutes</strong>.
                </p>
              </td>
            </tr>

            <tr>
              <td
                style="
                  background-color: #fff7ed;
                  padding: 18px;
                  text-align: center;
                  font-size: 12px;
                  color: #9a3412;
                "
              >
                <p style="margin: 0 0 6px">
                  If you didn’t create this account, you can safely ignore this
                  email.
                </p>
                <p style="margin: 0">© 2026 Nexra. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`


    }).then(() => {
      console.log("Email sent successfully ");
    }).catch((error) => {
      console.log("Error in controllers", error)
      res.status(500).json({ error: "Email could not be sent a problem on our part" })
    })


  } catch (error) {
    console.log("Email not sent", error);
    res.status(500).json({ message: "Internal server error" })

  }

}
export const confirm = (User) => async (req, res) => {

  if (!req.body) {
    return res.status(400).json({ message: "No code provided.Please send  the confirmartion code sent to you" })
  }
  let { name, email, otpToken } = req.body
  console.log(otpToken)
  try {
    let user = await User.findOneAndUpdate({ email }, { $unset: { expiresAt: "" } })

    if (!user) {
      return res.status(404).json({ message: "User not found. Try signing up" })
    }
    else {
      if (!otpToken) {
        return res.status(400).json({ error: "OTP required" })
      }
      const raw_otp = String(otpToken).trim().replace(/\s+/g, "")
      const hex_otp = crypto.createHash("sha256").update(raw_otp).digest("hex")
      if (hex_otp != user.otpToken) {
        return res.status(403).json({ message: "Invalid Token" })
      }
    }
    user.isVerified = true;
    const token = jwt.sign({ userId: user._id, tokenVersion: user.tokenVersion }, process.env.AUTH_SECRET, { expiresIn: "1h" })
    const refreshToken = jwt.sign({ userId: user._id }, process.env.REFRESH_SECRET, { expiresIn: "14d" })
    user.refreshToken = refreshToken
    user.isLoggedIn = true
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: false, maxAge: 14 * 24 * 60 * 60 * 1000 })
    await user.save()
    res.status(200).json({ message: "Email Confirmed.Continue to the app" }, { token })
  }
  catch (error) {
    console.error("Error in controllers", error)
    res.status(500).json({ message: "Internal server error" })

  }

}
export const login = (User) => async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ message: "Please enter your credentials" })
  }
  let { name, password, email, } = req.body
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return res.status(401).json({ error: "Invalid email format" })
  }
  const user = await User.findOneAndUpdate({ email }, { $unset: { otpToken: "", expiresAt: "" } }, { new: true })
  if (!user) {
    console.log("User not found")
    return res.status(403).send("User not found")
  }
  let password_test = await bcrypt.compare(password, user.password)
  if (password_test) {
    if (user.isVerified) {
      const token = jwt.sign({ userId: user._id, tokenVersion: user.tokenVersion }, process.env.AUTH_SECRET, { expiresIn: "1h" })
      const refreshToken = jwt.sign({ userId: user._id }, process.env.REFRESH_SECRET, { expiresIn: "14d" })
      user.refreshToken = refreshToken
      user.isLoggedIn = true
      await user.save()
      res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: false, maxAge: 14 * 24 * 60 * 60 * 1000 })
      res.status(200).json({ token })
    }
    else {
      res.status(400).json({ message: "Email not confirmed.View your email first" })
    }
  }
  else {
    res.status(401).json({ message: "Invalid password ! Check password and try again" })
  }

}
export const authMiddleware = (User) => async (req, res, next) => {
  if (!req.headers) {
    return res.status(400).json({ message: "Invalid request format" })
  }
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(400).json({ message: "No token provided" })
  }
  try {
    const token = authHeader.split(" ")[1]
    let decoded = jwt.verify(token, process.env.AUTH_SECRET)
    console.log(decoded);
    const user = await User.findById(decoded.userId)
    if (!user) {
      console.log("User not found")
      return res.status(401).json({ message: "User not found" })
    }
    if (decoded.tokenVersion === user.tokenVersion && user.isLoggedIn === true) {
      req.user = decoded
      next();
    }


    else if (user.isLoggedIn === false) {
      res.status(401).json({ message: "Please login first" })
    }
    else {
      res.status(401).json({ message: "Token expired ! Refresh !!" })
    }

  } catch (error) {
    console.error("Error in Authentication", error)
    res.status(403).json({ message: "Invalid token" })
  }


}
export const refreshToken = (User) => async (req, res) => {
  try {
    console.log(req.cookies)
    if (!req.cookies) {
      res.status(400).json({ message: "Please login first" })
    }
    const refreshToken = req.cookies.refreshToken
    if (!refreshToken) {
      return res.status(401).json({ message: "No token provided" })
    }
    const payload = jwt.verify(refreshToken, process.env.REFRESH_SECRET)
    const user = await User.findById(payload.userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    user.tokenVersion += 1
    const newAccessToken = jwt.sign({ userId: user._id, tokenVersion: user.tokenVersion }, process.env.AUTH_SECRET, { expiresIn: "1h" })
    await user.save()
    res.status(201).json({ newAccessToken })

  }
  catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Refresh Token expired" })
    }
    console.error("Error in refreshing", error)
    return res.status(403).json({ message: "Invalid Token" })


  }


}
export const logout = (User) => async (req, res) => {
  try {
    if (!req.cookies) {
      return res.status(401).json({ message: "Please login first" })
    }
    const refreshToken = req.cookies.refreshToken
    if (!refreshToken) {
      return res.status(400).json({ message: "No token provided" })
    }
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET)
    if (!decoded) {
      return res.status(403).json({ message: "Token not eligible" })
    }
    const user = await User.findById(decoded.userId)
    user.refreshToken = null
    user.isLoggedIn = false
    res.clearCookie("refreshToken")
    await user.save()
    res.status(200).json({ message: "User successfully logged out" })
  } catch (error) {
    console.log("Error logging out the user", error)
    res.status(500).json({ message: "Internal server error" })

  }



}
