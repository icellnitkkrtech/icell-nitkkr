import dotenv from "dotenv"
dotenv.config()

import express from "express"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"

import teamRoutes from "./routes/teamRoutes.js"
import blogRoutes from "./routes/blogRoutes.js"
import authRoutes from "./routes/authRoutes.js"


const app = express()

app.use(helmet())

const limiter = rateLimit({
 windowMs: 15 * 60 * 1000,
 max: 100
})

app.use(limiter)

app.use(cors({
 origin: process.env.FRONTEND_URL
}))

app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/blogs", blogRoutes)
app.use("/api/auth", authRoutes)
app.use("/teams", teamRoutes)

app.listen(process.env.PORT,()=>{
 console.log(`Server running on port ${process.env.PORT}`)
})