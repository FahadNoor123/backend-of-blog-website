import mongoose, { Schema } from "mongoose";


const contactSchema = new Schema(
  {
   
    
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
   message: {
      type: String,
      minlength: 10,
      required: [true, 'Message is required'],
    },
    name: {
        type: String,
        minlength: 2,
        required: [true, 'Name is required'],
      },
      status: {
        type: String,
        enum: ['pending', 'resolved', 'cancelled'],
        default: 'pending',
      }
      
    },
  {
    timestamps: true,
  }
);




export const Contact = mongoose.model("Contact", contactSchema);
