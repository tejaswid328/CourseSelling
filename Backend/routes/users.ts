import mongoose, { get } from 'mongoose';
import express from "express";
import {authJWT, secretKey} from "../middleware/auth";
import {User,Course} from "../db"
//Ths library is for backend validation
import {boolean, z} from "zod";

import jwt from "jsonwebtoken";

const router=express.Router();

const signedUserInput=z.object({
    username:z.string().min(2).max(15),
    password:z.string().min(6)
})

//SIGNUP Route
router.post('/signUp',async(req,res)=>{

    const extractInput= signedUserInput.safeParse(req.body);
    if(!extractInput.success)
    { 
            res.status(411).json({
                error:extractInput
            })
        return;
    }
    const username=extractInput.data.username;
    const password=extractInput.data.password;

    const user=await User.findOne({username})
    if(user)
    {
        res.status(409).json({Message: "Username " + username+ " already Exists"})
    }
    else
    {
        const newUser=new User({username,password});
        await newUser.save();
        const token=jwt.sign({ username }, secretKey, { expiresIn: '1h' })
        res.status(201).json({message: "Congratulations Account Created Successfully", token})
    }
})

//LOGIN route
router.post('/login', async (req,res)=>{
    const {username,password}=req.body;
    const user=await User.findOne({ username , password})
    if(user)
    {
        const token=jwt.sign({userName:user._id},secretKey,{expiresIn: '1h'});
        res.json({message: 'Logged in Successfully' ,username,token });
    }
    else
    {
        res.json({message:"Invalid Username or Password"});
    }
});

//View Course Route
router.get('/courses',authJWT,async (req,res)=>{
    const courses= await Course.find({})
    if(courses)
    {
        res.status(200).json({courses});
    }
})

//Purchase course Route
router.put('/course/:courseId',authJWT,async (req,res)=>{
    //
        const user=await User.findOne({username: req.body.username});
        if(user)
        {
            const isValidCourseId = mongoose.Types.ObjectId.isValid(req.params.courseId);

            if (!isValidCourseId) {
            res.status(404).json({message: 'Course Doesnot Exists'})
            return ;
            }
            const isCourseAlreadyPresent = user.courses.includes(req.params.courseId);
            if(!isCourseAlreadyPresent)
            {
                const courseToPurchase= await Course.findById(req.params.courseId);
                if(courseToPurchase)
                {
                    user.courses.push(courseToPurchase._id);
                    await user.save();
                    res.status(200).json({message: 'Course purchased successfully'})
                }
                else
                {
                    res.status(404).json({ message: 'Course not found' });
                }

            }
            else
            {
                res.status(409).json({Message: "Course Already Purchased"})
            }
    }
    else
    {
        res.status(403).json({message:'User not found' });
    }
})
//View Purchasd Course Route
router.get('/purchasedCourses',authJWT,async (req,res)=>{
    const user= await User.findOne({username: req.body.username}).populate('courses');
    if(user)
    {
        res.status(200).json({message: "Purchased Courses are",courses: user.courses})
    }
    else
    {
        res.status(403).json({ message: 'User not found' });
    }
})

export default router