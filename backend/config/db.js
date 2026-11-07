import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vastraa', {
      maxPoolSize: 100, // Optimized for high concurrent connections
      serverSelectionTimeoutMS: 5000,
    })
    console.log(`[MongoDB Connected] Host: ${conn.connection.host}`)
  } catch (error) {
    console.warn(`[MongoDB Warning] Could not connect to MongoDB at ${process.env.MONGODB_URI}: ${error.message}`)
    console.warn(`[MongoDB Fallback] Running with in-memory fallback admin authentication.`)
  }
}

export default connectDB
