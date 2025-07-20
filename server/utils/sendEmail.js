import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    try {
        // Check if required environment variables are set
        if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
            throw new Error('SMTP_EMAIL and SMTP_PASSWORD environment variables are required');
        }

        // Create transporter
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        // Verify transporter configuration
        await transporter.verify();

        // Email options
        const message = {
            from: `${process.env.FROM_NAME || 'Online Judge'} <${process.env.FROM_EMAIL || process.env.SMTP_EMAIL}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
        };

        // Send email
        const info = await transporter.sendMail(message);

        console.log('Message sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Email sending failed:', error.message);
        throw new Error(`Failed to send email: ${error.message}`);
    }
};

export default sendEmail; 