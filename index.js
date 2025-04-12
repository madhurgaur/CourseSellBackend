import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./database/db.js";
import userRoute from "./routes/user.route.js";
import courseRoute from "./routes/course.route.js";
import mediaRoute from "./routes/media.route.js";
import purchaseRoute from "./routes/purchaseCourse.route.js";
import helmet from "helmet";
import courseProgressRoute from "./routes/courseProgress.route.js";

dotenv.config({});


// Call database connection
connectDB();
const app = express();


const PORT = process.env.PORT || 3000;

// Default middleware
app.use(express.json());
app.use(cookieParser());

const corsOptions = {
    origin: "https://course-sell-frontend-qiij.vercel.app/",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
  };
  
  app.use(cors(corsOptions));
  app.options("*", cors(corsOptions)); 
  

app.use(helmet());

// API routes
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

app.use("/api/v1/media", mediaRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/purchase", purchaseRoute);
app.use("/api/v1/progress", courseProgressRoute);

// Listen on the port
app.listen(PORT, () => {
    console.log(`Server listening at port ${PORT}`);
});
