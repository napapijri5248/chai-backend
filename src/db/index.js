// require('dotenv').config({path:'./env'});
import mongoose from "mongoose";
import { DB_NAME } from '../constants.js'
import dotenv from 'dotenv'
dotenv.config('.../env');

const connectDB=async()=>{
    try {
        const connInstance=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\n MongoDB connected ...DB host : ${connInstance.connection.host}`);
        
    } catch (error) {
        console.log('ERROR connection error : ',error);
        process.exit(1);
    }
}

export default connectDB