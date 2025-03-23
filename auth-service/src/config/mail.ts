import nodemailer from 'nodemailer';

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app-specific password
    },
});

// Function to send an email
export const sendEmail = async (to: string, subject: string, html: string) => {
    const mailOptions = {
        from: process.env.EMAIL_USER, // Sender address
        to, // Recipient address
        subject, // Subject line
        html, // HTML body
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error(`Error sending email to ${to}:`, error);
    }
};