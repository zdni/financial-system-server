import dotenv from "dotenv"
import mongoose from "mongoose"

const env = dotenv.config().parsed

const MONGODB_URL = (env.MONGODB_SERVER === 'local') ? env.MONGODB_LOCAL_URL : env.MONGODB_ATLAS_URL

const connection = () => {
  mongoose.set("strictQuery", false);
  mongoose.connect(`${MONGODB_URL}`, {
    dbName: `${env.MONGODB_DB_NAME}`,
    // directConnection: true
  })

  const connection = mongoose.connection
  connection.on('error', console.error.bind( console, 'connection error:' ))
  connection.once('open', () => {
    console.log('Connected to MongoDB')
  })
}

export default connection