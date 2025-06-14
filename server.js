// // "use server";

// import dotenv from "dotenv";
// import express from "express";
// import cors from "cors";
// import nodemailer from "nodemailer";

// dotenv.config(); // Load .env variables

// const app = express();
// app.use(express.json());
// app.use(cors());

// // Debugging output
// console.log("SMTP User:", process.env.EMAIL_USER || "Not set");
// console.log("SMTP Pass:", process.env.EMAIL_PASS ? "Exists" : "Not set");

// // Create reusable transporter using Gmail SMTP
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// // POST endpoint to handle email sending
// app.post("/send", async (req, res) => {
//   const { name, email, subject, message } = req.body;

//   if (!name || !email || !subject || !message) {
//     return res.status(400).json({ error: "All fields are required." });
//   }

//   try {
//     const info = await transporter.sendMail({
//       from: `"${name}" <${email}>`,
//       to: "niffzy@gmail.com", // Your receiving email
//       subject: subject,
//       text: message,
//     });

//     console.log("Email sent:", info.response);
//     res.status(200).json({ success: true, message: "Message sent successfully!" });
//   } catch (error) {
//     console.error("Error sending email:", error);
//     res.status(500).json({ success: false, message: "Failed to send email." });
//   }
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
// });


