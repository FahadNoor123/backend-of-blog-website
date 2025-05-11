import nodemailer from 'nodemailer';
import { Contact } from "../models/contact.model.js"; // Import the Contact model

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can change this to another email service
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password or application-specific password
  },
});

// Controller to handle contact form submissions
 const handleContactForm = async (req, res) => {
  try {
    // Destructure the data from the request body
    const { name, email, message } = req.body;

    // Validate data
    if (!name || !email || !message) {
      return res.status(400).json({ message: "Please fill in all fields." });
    }

    // Create a new contact record
    const newContact = new Contact({
      name,
      email,
      message,
    });

    // Save the contact data to the database
    await newContact.save();

    // Email content
    const userMailOptions = {
      from: process.env.EMAIL_USER, // Sender address
      to: email, // Receiver address (the user who filled the form)
      subject: 'Thank you for contacting us!',
      text: `Hello ${name},\n\nThank you for reaching out! We have received your message and will get back to you soon.\n\nMessage: ${message}\n\nBest regards,\nSupportTeam from Interal News Blog website`,
    };

    const adminMailOptions = {
      from: process.env.EMAIL_USER, // Sender address
      to: process.env.ADMIN_EMAIL, // Admin's email address
      subject: 'New Contact Form Submission',
      text: `You have a new contact form submission:\n\nName: ${name}\nEmail: ${email}\nMessage: ${message}`,
    };

    // Send email to the user
    transporter.sendMail(userMailOptions, (error, info) => {
      if (error) {
        console.log('Error sending email to user:', error);
      } else {
        console.log('Email sent to user:', info.response);
      }
    });

    // Send email to the admin
    transporter.sendMail(adminMailOptions, (error, info) => {
      if (error) {
        console.log('Error sending email to admin:', error);
      } else {
        console.log('Email sent to admin:', info.response);
      }
    });

    // Send a success response
    res.status(201).json({ message: "Message sent successfully!" });
  } catch (error) {
    console.error("Error handling contact form:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};





 const getAllContactMessages = async (req, res) => {
    try {
      const messages = await Contact.find().sort({ createdAt: -1 }); // newest first
      res.status(200).json(messages);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  };





export {
    handleContactForm,
    getAllContactMessages
   
}