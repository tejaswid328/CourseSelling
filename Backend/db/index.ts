import mongoose from "mongoose";

//Defining user Mongoose Schema

const userSchema=new mongoose.Schema({
    username : String,
    password : String,
    courses: [{type: mongoose.Schema.Types.ObjectId,ref: 'Course', // Referencing the 'Course' model
  }]

});

//Defining Admin Schema
const adminSchema = new mongoose.Schema({
    userName: String,
    password: String
});

//Defining Course Schema
const courseSchema = new mongoose.Schema({
    title: String,
    description:String,
    imageLink: String,
    price:Number,
    Published: String
})

export const User=mongoose.model('User',userSchema);
export const Admin=mongoose.model('Admin',adminSchema);
export const Course=mongoose.model('Course',courseSchema);