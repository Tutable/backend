/**
 * This service module deals with the sending of emails
 * @author gaurav sharma
 * @since 29th january 2018
 */
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
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
const sendMail = ({ to, subject = 'Mail from tutable app', html }) => new Promise((resolve, reject) => {

	// read html file here

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

/**
 * send this email template for now account registering
 * @param {String} to
 */
const NewAccountMail = ({ to, name, verificationCode }) => new Promise((resolve, reject) => {
	const html = fs.readFileSync(path.resolve(__dirname, 'template', 'new_account_template.html'), { encoding: 'utf-8' });
	const template = handlebars.compile(html);
	const props = { name, verification_code: verificationCode };
	const compiled = template(props);

	sendMail({ to, subject: 'New account created', html: compiled })
		.then(success => resolve(success))
		.catch(err => reject(err));
});

/**
 * send the class confirmation mail to the student
 * @param {} param0 
 */
const ClassConfirmedMail = ({ to, name, teacher, className, time, teacherImage = 'https://image.freepik.com/free-icon/male-user-shadow_318-34042.jpg' }) => new Promise((resolve, reject) => {
	if (to && name && teacher && className && time && teacherImage) {
		const html = fs.readFileSync(path.resolve(__dirname, 'template', 'class_confirmed.html'), { encoding: 'utf-8' });
		const template = handlebars.compile(html);
		const props = { name, teacher, class_name: className, time, teacher_image: teacherImage };
		const compiled = template(props);

		sendMail({ to, subject: 'Class confirmed!', html: compiled })
			.then(success => resolve(success))
			.catch(err => reject(err));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});

export default {
	NewAccountMail,
	ClassConfirmedMail,
};

