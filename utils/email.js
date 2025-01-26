/* eslint-disable prettier/prettier */
/* eslint-disable import/no-extraneous-dependencies */
const nodemailer = require("nodemailer");
const { convert } = require('html-to-text');
const pug = require('pug');

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name;
        this.url = url;
        this.from = `Jino <${process.env.EMAIL_FROM}>`;
    }

    newTransport() {
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    async sendEmail(subject, template) {
        const html = await pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject
        });

        const text = convert(html, {});

        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text
        }

        await this.newTransport().sendMail(mailOptions);

    }

    async sendWelcome() {
        await this.send('Welcome to Travel website', 'welcome');
    }

    async sendResetPassword() {
        await this.sendEmail('Reset Password', 'passwordReset');
    }
};