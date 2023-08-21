import express from "express";
import mongoose,{ConnectOptions} from "mongoose";
import cors from "cors";

const app=express();
const port=3000;

import adminRouter from "./routes/admin"
import userRouter from "./routes/users"

app.use(cors());
app.use(express.json());
app.use("/admin",adminRouter);
app.use("/user",userRouter);
app.get("/", (req, res) => res.json({msg: "Testing WebPage"}));

//Connect to mongoose
mongoose.connect('mongodb+srv://LearningMongDB:2022!Heman@cluster0.uejt1q7.mongodb.net/',{ dbName : "LogonDatabase"});

app.listen(port,()=>{
    console.log('Server running on port 3000');
})