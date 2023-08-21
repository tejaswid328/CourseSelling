import mongoose from 'mongoose';
import express from "express";
import {authJWT, secretKey} from "../middleware/auth";
import {Admin,Course,User} from "../db"
//Ths library is for backend validation
import {boolean, z} from "zod";

import jwt from "jsonwebtoken";

const router = express.Router();

//Input Defining for backend validation
const signedInput=z.object({
    userName: z.string().min(2).max(15),
    password:z.string().min(6)
});

//SIGNUP Route
router.post('/signUp',async(req,res)=>{

    const extractInput= signedInput.safeParse(req.body);

    if(!extractInput.success)
    { 
            res.status(411).json({
                error:extractInput
            })
        return;
    }
    const userName=extractInput.data.userName;
    const password=extractInput.data.password;

    const admin=await Admin.findOne({userName})
    if(admin)
    {
        res.status(409).json({Message: "Username " + userName+ " already Exists"})
    }
    else
    {
        const newAdmin=new Admin({userName,password});
        await newAdmin.save();
        const token=jwt.sign({ userName }, secretKey, { expiresIn: '1h' })
        res.status(201).json({message: "Congratulations Account Created Successfully", token})
    }
})

//LOGIN route
router.post('/login', async (req,res)=>{
    const {userName,password}=req.body;
    const admin=await Admin.findOne({ userName , password})
    if(admin)
    {
        const token=jwt.sign({userName:admin._id},secretKey,{expiresIn: '1h'});
        res.json({message: 'Logged in Successfully' ,userName,token });
    }
    else
    {
        res.json({message:"Invalid Username or Password"});
    }
});

//Add Course route
router.post('/courses',authJWT,async(req,res)=>{
    const course=new Course(req.body)
    if(course)
    {
        await course.save();
        res.status(200).json({message: 'Courses Added Successfully',courseId: course.id});
    }
    else
    {
        res.status(411).json({message: 'Courses Already Exists'});
    }
})
//Updating Course route
router.put('/courses/:courseId',authJWT,async (req,res)=>{
    try{
      const updatedCourse = await Course.findByIdAndUpdate(req.params.courseId, req.body, { new: true });

      if (!updatedCourse) {
        res.status(404).json({ message: 'Course not found' });
      }

      res.status(200).json({message:"Course Updated Successfully",course: updatedCourse});
    }
    catch(error) {
    res.status(500).json({ message: 'Error updating course', error: error.message }); // Send an error response
  };
})

//View Course
router.get('/courses',authJWT,async (req,res)=>{
    const courses= await Course.find({})
    if(courses)
    {
        res.status(200).json({courses});
    }
})

//Delete Course By Id
router.put('/DelCourses/:courseId',authJWT,async(req,res)=>{
     const courseIdToDelete = req.params.courseId;
    try{
        const CourseToDelete= await Course.findByIdAndDelete(courseIdToDelete);
        if(CourseToDelete)
        {
            res.status(200).json({message:"Course Deleted Successfully",course: CourseToDelete});
        }
        else{
            res.status(404).json({ message: 'Course not found',course: CourseToDelete });
        }

    }
    catch(error)
    {
       res.status(500).json({ message: 'Error updating course', error: error.message }); // Send an error response 
    }
})

//Remove User Route

router.put('/removeUser/:userId',authJWT,async (req,res)=>{
    const userId = req.params.userId;
    var userName=""
    if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid user ID format' });
  }
  try{
        const findNamebyId = await User.findById(userId);
        if(findNamebyId)
        {
            userName = findNamebyId.username;
        }
        const user=await User.findByIdAndDelete(userId);
        
        if(user)
        {
            res.status(200).json({message:'User Removed',userName});
        }
        else
        {
            res.status(404).json({message:'User Doesnot Exists'});
        }
    }
    catch(err){
        res.status(500).json({ message: 'Internal server error' });
    }
})
export default router