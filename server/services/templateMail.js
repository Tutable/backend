/**
 * This service module deals with the sending of emails
 * @author gaurav sharma
 * @since 29th january 2018
 */
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import { ResponseUtility } from '../utility';

const user = process.env.BUSINESS_EMAIL;
const password = process.env.BUSINESS_EMAIL_PASSWORD;

const transporter = nodemailer.createTransport({
	service: 'Gmail',
	auth: {
		user,
		pass: password,
	},
});

/**
 * function to send mail
 * @param {String} to		-> send email to
 * @param {String} text		-> email content
 * @param {String} subject	-> subject of email
 */
export default ({ to, text, subject = 'Mail from tutable app' }) => new Promise((resolve, reject) => {

	// read html file here
	const html = fs.readFileSync(path.resolve(__dirname, 'template', 'account_created.html'), { encoding: 'utf-8' });

	transporter.sendMail({
		from: user,
		to,
		html,
		subject,
	}, (err) => {
		if (err) {
			return reject(ResponseUtility.ERROR({ message: 'Error sending email.', error: err }));
		}
		return resolve(ResponseUtility.SUCCESS);
	});
});
