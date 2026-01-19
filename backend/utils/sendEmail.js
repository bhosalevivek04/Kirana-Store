const { MailerSend, EmailParams, Sender, Recipient } = require("mailersend");

const sendEmail = async (options) => {
    const mailerSend = new MailerSend({
        apiKey: process.env.MAILERSEND_API_KEY,
    });

    // Sender must match the verified domain in MailerSend
    const sentFrom = new Sender("noreply@test-z0vklo6ze0el7qrx.mlsender.net", "Kirana Store");
    const recipients = [new Recipient(options.email)];

    const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setSubject(options.subject)
        .setText(options.message)
        .setHtml(options.message.replace(/\n/g, '<br>'));

    try {
        await mailerSend.email.send(emailParams);
        logger.info(`📧 MailerSend: Email sent to ${options.email}`);
    } catch (error) {
        logger.error("❌ MailerSend Error:", error);
        throw error;
    }
};

module.exports = sendEmail;
