import mongoose, { Schema,model } from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
const VideoSchema=new Schema({
    videoFile:{
        type:String ,//cloudinary url
        required:true,
    },
    thumbnail:{
        type:String ,//cloudinary url
        required:true,
    },
    title:{
        type:String ,
        required:true,
    },
    descrption:{
        type:String ,
        required:true,
    },
    duration:{
        type:Number ,//cloudinary url
        required:true,
    },
    views:{
        type:Number ,
        default:0,//cloudinary url
    },
    isPublished:{
        type:Boolean,
        default:true,
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true});

VideoSchema.plugin(mongooseAggregatePaginate)
const Video=mongoose.model("Video",VideoSchema);

export {Video}