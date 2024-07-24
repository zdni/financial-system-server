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
              throw 'TOKEN_EXPIRED'
            } else {
              throw 'TOKEN_IS_NOT_VALID'
            }
          } else {
            req.jwt = data
            next()
          }
        })
      } else {
        throw 'TOKEN_REQUIRED'
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