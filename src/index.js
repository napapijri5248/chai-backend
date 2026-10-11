import {app} from "./app.js";
import connectDB from "./db/index.js";
// require('dotenv').config({path:'./env'});
import dotenv from 'dotenv'
dotenv.config({
    path: './env'
});

const port = process.env.PORT || 8000;
connectDB()
    .then(() => {
        const server=app.listen(port, () => {
            console.log(`server is running at port : ${port}`);
            
        })
        server.on('error', (error) => {
            console.log('error : ', error);
            process.exit(1);
        })
    })
    .catch((err) => {
        console.log('MongoDB connection failed !!!', err);

    })


























/*
require('dotenv').config();
import express from 'express'
const app=express();
    ; (async () => {
        try {
            await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
            app.on('error',(error)=>{
                console.log("ERROR : ",error);
                throw error
            })

            app.listen(process.env.PORT,()=>{
                console.log(`app is listening on port ${process.env.PORT}`);
                
            })
        } catch (error) {
            console.log('ERROR : ', error);
            throw error;
        }
    })()
*/

