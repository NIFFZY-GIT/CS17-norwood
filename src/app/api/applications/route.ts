import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
// FIX: Removed 'Db' and 'ObjectId' as they are not used or can be inferred.
import nodemailer from 'nodemailer';
import { Application } from '@/lib/types';

// Helper function to create Nodemailer transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT || '465'),
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const vacancyId = formData.get('vacancyId') as string;
    const vacancyTitle = formData.get('vacancyTitle') as string;
    const cvFile = formData.get('cv') as File;

    if (!fullName || !email || !phone || !vacancyId || !cvFile) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }

    // Convert file to Base64
    const buffer = Buffer.from(await cvFile.arrayBuffer());
    const cvBase64 = buffer.toString('base64');

    const newApplication: Omit<Application, '_id' | 'createdAt'> = {
      fullName,
      email,
      phone,
      vacancyId,
      vacancyTitle,
      cvMimeType: cvFile.type,
      cvBase64,
      agreedToTerms: true, // Assuming checkbox validation is on the client
      agreedToPrivacy: true,
    };

    // Save to database
    const client = await clientPromise;
    // The type for 'db' is now inferred by TypeScript, so no need for explicit 'Db' type.
    const db = client.db(process.env.DB_NAME); 
    const result = await db.collection('applications').insertOne({
        ...newApplication,
        createdAt: new Date(),
    });

    // Send email notification
    try {
      const transporter = createTransporter();
      await transporter.sendMail({
        from: `"Your Company Name" <${process.env.EMAIL_SERVER_USER}>`,
        to: process.env.COMPANY_RECIPIENT_EMAIL,
        subject: `New Job Application for ${vacancyTitle}`,
        html: `
          <h1>New Application Received</h1>
          <p><strong>Position:</strong> ${vacancyTitle}</p>
          <p><strong>Applicant Name:</strong> ${fullName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p>The application details and CV can be viewed in the admin dashboard.</p>
        `,
      });
      console.log('Notification email sent successfully.');
    } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
    }

    return NextResponse.json({ message: 'Application submitted successfully!', applicationId: result.insertedId }, { status: 201 });

  } catch (error) {
    console.error('Application submission failed:', error);
    return NextResponse.json({ message: 'An error occurred during submission.' }, { status: 500 });
  }
}