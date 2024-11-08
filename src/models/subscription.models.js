import mongoose from "mongoose"
 

const subscriptionSchema =new Schema({
    subscriber:{
        type:Schema.Types.objectId, //one hwo is subscribing
        ref:"User"
    },
    channel :{
        type :Schema.Types.objectId,
        ref:"User"
    }


},{timestamps :true})

export const Subscription=mongoose.model("Subscription",subscriptionSchema)