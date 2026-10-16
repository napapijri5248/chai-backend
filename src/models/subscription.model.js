import mongoose from 'mongoose';

const SubscriptionSchema = new mongoose.Schema({
    subscriber:{
        type:mongoose.Schema.Types.ObjectId, // the one who is subscribing
        ref:"User"
    },
    channel:{
        type:mongoose.Schema.Types.ObjectId, // the to whom the subscriber is subscribing
        ref:"User"
    },
}, { timestamps: true })

const Subscription = mongoose.model("Subscription", SubscriptionSchema)

export { Subscription }