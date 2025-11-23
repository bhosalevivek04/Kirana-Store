const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    let transporter;

    // Check if SMTP credentials exist in .env
    if (process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD
            }
        });
    } else {
        // Use Ethereal Email (Fake SMTP) for testing
        console.log('⚠️ No SMTP credentials found. Using Ethereal Email for testing.');
        const testAccount = await nodemailer.createTestAccount();

        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });
    }

    // Define email options
    const mailOptions = {
        from: process.env.FROM_NAME ? `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>` : '"Kirana Store" <noreply@kiranastore.com>',
        to: options.email,
        subject: options.subject,
        text: options.message
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    // If using Ethereal, log the preview URL
    if (!process.env.SMTP_EMAIL) {
        console.log('📨 Email sent via Ethereal!');
        console.log('👀 Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
};

module.exports = sendEmail;
