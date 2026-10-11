import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'
import dotenv from 'dotenv'
dotenv.config({
    path: './.env'
});

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    // cloudinary_url: process.env.CLOUDINARY_URL,
    
});

// pass the localpath and then if uploads then unlink the file
const uploadOnCloudinary=async (localFilePath)=>{
    try {
        if(!localFilePath) return null
        // upload the file on cloudinary
        const response=await cloudinary.uploader.upload(localFilePath,{
            resource_type:'auto'
        })

        // file has been uploaded succesfully
        // console.log('file is uploaded on cloudinary : ',response );
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        console.log("Error: ",error);
        
        //remove the locally saved temporary file as the upload operation got failed
        fs.unlinkSync(localFilePath)
        return null
    }
}

export {uploadOnCloudinary}