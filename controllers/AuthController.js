import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

import User from '../models/User.js'

const env = dotenv.config().parsed

const generateAccessToken = async (payload) => {
  return jwt.sign(
    payload,
    env.JWT_ACCESS_TOKEN_SECRET,
    { expiresIn: env.JWT_ACCESS_TOKEN_LIFE }
  )
}

const generateRefreshToken = async (payload) => {
  return jwt.sign(
    payload,
    env.JWT_REFRESH_TOKEN_SECRET,
    { expiresIn: env.JWT_REFRESH_TOKEN_LIFE }
  )
}

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body
      if(!email) { throw { code: 428, message: "Email harap di isi!", data: null, status: false } }
      if(!password) { throw { code: 428, message: "Password harap di isi!", data: null, status: false } }

      const user = await User.findOne({ email: email })
      if(!user) { throw { code: 403, message: "Pengguna tidak ditemukan", data: null, status: false } }
      
      const isMatch = bcrypt.compareSync(password, user.password)
      if(!isMatch) { throw { code: 403, message: "Password yang anda masukkan salah!", data: null, status: false } }

      if(user.status === 'inactive') { throw { code: 403, message: "Pengguna tidak aktif!", data: null, status: false } }

      const payload = { id: user.id, role: user.role }
      const accessToken = await generateAccessToken(payload)
      const refreshToken = await generateRefreshToken(payload)

      let data = { ...user._doc }
      delete data.password

      return res.status(200).json({
        status: true,
        message: "Berhasil Login",
        data: {
          user: data,
          accessToken,
          refreshToken,
        },
      })
    } catch(err) {
      if(!err.code) { err.code = 500 }
      return res.status(err.code).json({
        status: false,
        message: err.message,
        data: null
      })
    }
  }

  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body
      if(!refreshToken) { throw { code: 428, message: "Token diperlukan!", data: null, status: false } }

      const verify = jwt.verify(refreshToken, env.JWT_REFRESH_TOKEN_SECRET)
      const payload = { id: verify.id, role: verify.role }
      
      const accessToken = await generateAccessToken(payload)
      const _refreshToken = await generateRefreshToken(payload)
      
      const user = await User.findOne({ _id: verify.id })
      if(!user) { throw { code: 403, message: "Pengguna tidak ditemukan", data: null, status: false } }
      
      let data = { ...user._doc }
      delete data.password

      return res.status(200).json({
        status: true,
        message: "Berhasil menyegarkan token",
        data: {
          user: data,
          accessToken,
          refreshToken: _refreshToken,
        }
      })
    } catch (err) {
      if(!err.code) { err.code = 500 }
      
      if(err.message === "jwt expired") {
        err.message = "Token kadaluarsa"
      } else if(err.message === 'invalid signature' || err.message === 'invalid token') {
        err.message = "Token tidak valid"
      }

      return res.status(err.code).json({
        status: false,
        message: err.message,
        data: null
      })
    }
  }
}

export default new AuthController