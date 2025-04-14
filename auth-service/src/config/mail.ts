import nodemailer from "nodemailer";

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app-specific password
    },
});

// Function to send a verification email
export const sendVerificationEmail = async (to: string) => {
    const mailOptions = {
        from: process.env.EMAIL_USER, // Sender address
        to, // Recipient address
        subject: "Verify Your Email",
        html: `
            <p>Click the button below to verify your email:</p>
            <form action="${process.env.FRONTEND_URL}/verify-email" method="POST">
                <input type="hidden" name="email" value="${to}" />
                <button type="submit" 
                        style="background-color: #4CAF50; color: white; padding: 10px 20px; border: none; cursor: pointer;">
                    Verify Email
                </button>
            </form>
            <p>If you did not request this, please ignore this email.</p>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${to}`);
    } catch (error) {
        console.error(`Error sending email to ${to}:`, error);
    }
};
