import crypto from "crypto"
import bcrypt from "bcrypt"
import dotenv from "dotenv"
import nodemailer from "nodemailer"
import jwt from "jsonwebtoken"
dotenv.config()
export const changePassword = (User) => {
  return async (req, res) => {
    try {
      if (!req.body) {
        return res.status.json({ error: "No email provided" })
      }
      const { email } = req.body
      if (!email) {
        return res.status(401).json({ message: "No email provided" })
      }
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        return res.status(401).json({ error: "Invalid email format" })
      }
      const user = await User.findOne({ email })
      if (!user) {
        return res.status(403).json({ message: "User not found" })
      }
      const otpPass = crypto.randomInt(0, 1000000).toString().padStart(6, "0")
      const otpTokenPass = crypto.createHash("sha256").update(otpPass).digest("hex")
      const passExp = new Date(Date.now() + 4 * 60 * 1000)
      if (!otpTokenPass) {
        return res.status(500).message("Internal server error")
      }
      const passJToken = jwt.sign({ userId: user._id, email: user.email, tokenVersion: user.tokenVersion }, process.env.AUTH_SECRET, { expiresIn: "8min" })
      console.log(passJToken)
      user.passToken = otpTokenPass
      user.passExp = passExp
      user.requestedPass = true
      await user.save()
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
        from: process.env.EMAIL,
        to: email,
        subject: "Email Confirmation",
        text: "Thank you for trying our system .Use the code provided below to be able to reset your password",
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
                  verification code below to reset your password.
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
                    ${otpPass}
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
                  If you didn’t request for this code, you can safely ignore this
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
        console.log("Email not sent", error)
        res.status(500).json({ error: "Internal server error" })
      })
      res.status(200).json({ message: "Verification code sent to your email", token: passJToken })

    }
    catch (error) {
      console.log("Error in controllers", error);
      res.status(500).json({ message: "Internal server error" })

    }
  }

}
export const resetCodeVer = (User) => async (req, res) => {
  try {
    const email = req.user.email;
    if (!email) {
      return res.status(500).json({ error: "Something wrong on our end" })
    }
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: "User not found" })
    }
    if (!user.requestedPass) {
      return res.status(401).json({ error: "You did not request to reset your password.Request first" })
    }
    const { passToken } = req.body
    const hashedPass = crypto.createHash("sha256").update(passToken).digest("hex")
    if (hashedPass !== user.passToken) {
      return res.status(403).json({ error: "Invalid verification code" })
    }
    user.passVerify = true
    await user.save()
    res.status(200).json({ message: "Code verified proceed to set your new password" })

  } catch (error) {

    console.error("Error in controller", error)
    res.status(500).json({ error: "Internal server error" })
  }
}


export const resetPassword = (User) => async (req, res) => {
  try {
    const email = req.user.email
    if (!email) {
      return res.status(500).json({ error: "Something wrong on our end" })
    }
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ error: "User not found" })
    }
    if (!user.passVerify) {
      return res.status(400).json({ error: "Please verify the code sent to you" })
    }
    const { pass, confirm } = req.body
    if (pass !== confirm) {
      return res.status(401).json({ error: "Passwords must be the same" })
    }
    if (pass.length < 8) {
      return res.status(401).json({ error: "Password length must be at least 8 characters" })
    }
    const hashedPass = await bcrypt.hash(pass, (10))
    user.password = hashedPass;
    user.passVerify = false;
    user.requestedPass = false;
    await user.save();
    res.status(200).json({ message: "Password reset executed successfully" })


  } catch (error) {
    console.error("Error in controllers", error)
    return res.status(500).json({ error: "Internal server error" })

  }



}
