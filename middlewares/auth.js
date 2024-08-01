import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

const env = dotenv.config().parsed

const auth = () => {
  return function(req, res, next) {
    try {
      if( req.headers.authorization ) { // Bearer token
        const token = req.headers.authorization.split(' ')[1]
        
        jwt.verify(token, env.JWT_ACCESS_TOKEN_SECRET, (err, data) => {
          if ( err ) {
            if( err.name == 'TokenExpiredError' ) {
              throw 'Token Kadaluarsa!'
            } else {
              throw 'Token tidak Valid!'
            }
          } else {
            req.jwt = data
            next()
          }
        })
      } else {
        throw 'Token dibutuhkan!'
      }
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error,
      })
    }
  }
}

export default auth