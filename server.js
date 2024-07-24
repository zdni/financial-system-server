import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'

import connection from './connection.js'
import router from './routes/index.js'

const env = dotenv.config().parsed

const app = express()
app.use( express.json() )
app.use( express.urlencoded({ extended: true }) )
app.use( cors({ origin: env.CORS_URL }) )

// routes
app.use('/api/', router)
app.use((req, res, next) => res.status(404).json({ message: "404_NOT_FOUND" }))

app.use((req, res, next) => {
  if(env.NODE_ENV == 'production') {
    res.status(500).json({ message: 'REQUEST_FAILED' })
  } else {
    next()
  }
})

connection();

app.listen(env.APP_PORT, () => console.log(`Server is running on port ${env.APP_PORT}`));