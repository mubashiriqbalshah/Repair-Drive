import mongoose from 'mongoose'
import { env } from './env'

export async function connectDb() {
  mongoose.set('strictQuery', true)
  await mongoose.connect(env.MONGODB_URI)
  console.log('[db] connected to mongodb')
}

mongoose.connection.on('error', (err) => {
  console.error('[db] connection error:', err)
})
