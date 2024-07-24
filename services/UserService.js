import bcrypt from 'bcrypt'

import checkValidationObjectId from '../libraries/checkValidationObjectId.js'
import emailExist from "../libraries/emailExist.js"

import User from '../models/User.js'

class UserService {
  async generateData(req) {
    try {
      const {
        name,
        email,
        role,
      } = req.body

      if(!name) { return { status: false, code: 428, message: "NAME_IS_REQUIRED" } }
      if(!email) { return { status: false, code: 428, message: "EMAIL_IS_REQUIRED" } }
      const password = email.substring(0, email.indexOf("@"));

      const isEmailExist = await emailExist(email)
      if(isEmailExist) { return { status: false, code: 409, message: "EMAIL_EXIST" } }

      let salt = await bcrypt.genSalt(10)
      let hash = await bcrypt.hash(password, salt)
      
      let data = {
        name,
        email,
        password: hash,
        status: 'active'
      }
      if(role) data['role'] = role

      return { status: true, data }
    } catch (err) {
      if(!err.status) err.status = false
      if(!err.code) err.code = 500
      if(!err.message) err.message = "FAILED_GENERATE_DATA"
      return err
    }
  }

  async generateQuerySearch(req) {
    try {
      let query = {}
      const { search, role, withAdmin } = req.query

      if(search) {
        query.$or = [
          { name: { $regex: search.toLowerCase(), $options: 'i' }},
          { idNumber: { $regex: search.toLowerCase(), $options: 'i' }}
        ]
      }
      if(role) query.role = role
      if(!withAdmin) query.role = { $nin: ['superadmin'] }

      return { status: true, query }
    } catch (err) {
      if(!err.status) err.status = false
      if(!err.code) err.code = 500
      return err
    }
  }

  async processChangePassword(req, password) {
    try {
      const {
        oldPassword,
        newPassword,
        confirmPassword
      } = req.body
      
      const isMatch = bcrypt.compareSync(oldPassword, password)
      if(!isMatch) { return { status: false, code: 401, message: "WRONG_OLD_PASSWORD" } }

      if(newPassword !== confirmPassword) { return { status: false, code: 403, message: "WRONG_CONFIRM_PASSWORD" } }

      let salt = await bcrypt.genSalt(10)
      let hash = await bcrypt.hash(newPassword, salt)

      return { status: true, password: hash }
    } catch (err) {
      if(!err.status) err.status = false
      if(!err.code) err.code = 500
      return err
    }
  }

  async processResetPassword(req) {
    try {
      const {id} = req.params

      if(!id) { return { status: false, code: 428, message: "ID_REQUIRED" } }
      const checkUserId = await checkValidationObjectId(id, User, "USER", true)
      if (!checkUserId.status) return checkUserId

      const user = checkUserId.data

      let salt = await bcrypt.genSalt(10)
      let hash = await bcrypt.hash(user.email, salt)

      return { status: true, password: hash }
    } catch (err) {
      if(!err.status) err.status = false
      if(!err.code) err.code = 500
      return err
    }
  }
}

export default new UserService