/* eslint-disable prettier/prettier */
/* eslint-disable import/no-extraneous-dependencies */
const nodemailer = require("nodemailer");
const { convert } = require('html-to-text');
const pug = require('pug');

module.exports = class Email {
    constructor(user, url = null, booking = null) {
        console.log(user);

        this.to = user.email || user.guestEmail;
        this.firstName = user.name || user.user?.name || user.guestName;
        this.url = url;
        this.from = `Jino <${process.env.EMAIL_FROM}>`;
        this.booking = booking;
    }

    newTransport() {
        return nodemailer.createTransport({
            // host: process.env.EMAIL_HOST,
            // port: process.env.EMAIL_PORT,
            // auth: {
            //     user: process.env.EMAIL_USERNAME,
            //     pass: process.env.EMAIL_PASSWORD
            // }

            // mail services
            service: "gmail",
            auth: {
                user: process.env.S_EMAIL,
                pass: process.env.S_PASS
            }
        });
    }

    async sendEmail(subject, template) {
        const html = await pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject,
            booking: this.booking
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
        await this.sendEmail('Welcome to Travel website', 'welcome');
    }

    async sendResetPassword() {
        await this.sendEmail('Reset Password', 'passwordReset');
    }

    async sendBookingConfirmation() { // ✅ New method for booking confirmation
        if (!this.booking) throw new Error("Booking details are required to send a booking email.");
        await this.sendEmail(`Canceling Confirmation: ${this.booking.tour.name}`, 'booking');
    }

    async sendCancelingConfirmation() { // ✅ New method for booking confirmation
        if (!this.booking) throw new Error("Booking details are required to send a booking email.");
        await this.sendEmail(`Booking Confirmation: ${this.booking.tour.name}`, 'cancelBooking');
    }
};
