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
const ClassConfirmedMail = ({
	to,
	name,
	teacher,
	className,
	time,
	date,
	teacherImage = 'https://image.freepik.com/free-icon/male-user-shadow_318-34042.jpg',
}) => new Promise((resolve, reject) => {
	if (to && name && teacher && className && time && teacherImage) {
		const html = fs.readFileSync(path.resolve(__dirname, 'template', 'class_confirmed.html'), { encoding: 'utf-8' });
		const template = handlebars.compile(html);
		const props = { name, teacher, class_name: className, time, teacher_image: teacherImage, date };
		const compiled = template(props);

		sendMail({ to, subject: 'Class confirmed!', html: compiled })
			.then(success => resolve(success))
			.catch(err => reject(err));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});

/**
 * email template for the declined request
 * @param {*} param0
 */
const ClassDeclinedMail = ({
	to,
	name,
	teacher,
	className,
}) => new Promise((resolve, reject) => {
	if (to && name && teacher && className) {
		const html = fs.readFileSync(path.resolve(__dirname, 'template', 'class_declined.html'), { encoding: 'utf-8' });
		const template = handlebars.compile(html);
		const props = { name, teacher, class_name: className };
		const compiled = template(props);

		sendMail({ to, subject: 'Class declined!', html: compiled })
			.then(success => resolve(success))
			.catch(err => reject(err));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});

/**
 * the send the hange password email.
 * @param {*} param0
 */
const ChangePasswordToken = ({ to, name, code }) => new Promise((resolve, reject) => {
	if (to && name && code) {
		const html = fs.readFileSync(path.resolve(__dirname, 'template', 'pass_change_template.html'), { encoding: 'utf-8' });
		const template = handlebars.compile(html);
		const props = { name, verification_code: code };
		const compiled = template(props);

		sendMail({ to, subject: 'Tutable Password Reset Request', html: compiled })
			.then(success => resolve(success))
			.catch(err => reject(err));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});

const VerificationToken = ({ to, name, code }) => new Promise((resolve, reject) => {
	if (to && name && code) {
		const html = fs.readFileSync(path.resolve(__dirname, 'template', 'verification_code_template.html'), { encoding: 'utf-8' });
		const template = handlebars.compile(html);
		const props = { name, verification_code: code };
		const compiled = template(props);

		sendMail({ to, subject: 'Verify your Email for Tutable Account', html: compiled })
			.then(success => resolve(success))
			.catch(err => reject(err));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});

/**
 * send the class request mail to teacher
 * @param {String} to, email of teacher
 * @param {String} name, name of teacher
 * @param {String} student, name of student
 * @param {String} className, name of class
 * @param {String} time, the time when the class is requested
 * @param {String} date, the date when the class is requested
*/
const ClassRequest = ({
	to,
	name,
	student,
	className,
	time,
	date,
}) => new Promise((resolve, reject) => {
	if (to && name && student && className && time && date) {
		const html = fs.readFileSync(path.resolve(__dirname, 'template', 'class_request.html'), { encoding: 'utf-8' });
		const template = handlebars.compile(html);
		const props = {
			name,
			student,
			class_name: className,
			time,
			date,
		};
		const compiled = template(props);

		sendMail({ to, subject: 'Request for new class', html: compiled })
			.then(success => resolve(success))
			.catch(err => reject(err));
	} else {
		// console.log('here')
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});

/**
 * Funtion to send the class cancellation email to respective users.
 * @param {String} to, the email recipient address
 * @param {String} recepientName, name of the recepient
 * @param {String} refText, reference text
 */
const ClassCancelEmail = ({
	to,
	name,
	className,
	salutation,
}) => new Promise((resolve, reject) => {
	if (to && name && salutation) {
		const html = fs.readFileSync(path.resolve(__dirname, 'template', 'class_cancelled.html'), { encoding: 'utf-8' });
		const template = handlebars.compile(html);
		const props = {
			name,
			class_name: className,
			salutation,
		};
		const compiled = template(props);
		sendMail({ to, subject: 'Class Cancelled', html: compiled })
			.then(success => resolve(success))
			.catch(err => reject(err));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});

/**
 * Send the confirmation email to the user who initiated the class cancel
 * request.
 * @param {*} param0 
 */
const ClassCancelInitiater = ({
	to,
	name,
	className,
	date,
	otherUser,
}) => new Promise((resolve, reject) => {
	if (to && name && className && date && otherUser) {
		const html = fs.readFileSync(path.resolve(__dirname, 'template', 'class_cancelled_by.html'), { encoding: 'utf-8' });
		const template = handlebars.compile(html);
		const props = {
			name,
			class_name: className,
			date,
			user: otherUser,
		};
		const compiled = template(props);
		sendMail({ to, subject: 'Class Cancelled', html: compiled })
			.then(success => resolve(success))
			.catch(err => reject(err));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});

/**
 * send the calass cancellation email notificaiton to other user
 * @param {String} to, email of the other uer
 * @param {String} name of the user to whom the email is sent
 * @param {String} className, name of the class that has been cancelled
 * @param {String} date, class date
 * @param {String} otherUser the name of other user.
 */
const ClassCancelNotify = ({
	to,
	name,
	className,
	date,
	otherUser,
}) => new Promise((resolve, reject) => {
	if (to && name && className && date && otherUser) {
		const html = fs.readFileSync(path.resolve(__dirname, 'template', 'class_cancelled_alertto.html'), { encoding: 'utf-8' });
		const template = handlebars.compile(html);
		const props = {
			name,
			class_name: className,
			date,
			user: otherUser,
		};
		const compiled = template(props);
		// console.log(compiled);
		sendMail({ to, subject: 'Class Cancelled', html: compiled })
			.then(success => resolve(success))
			.catch(err => reject(err));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});

export default {
	NewAccountMail,
	ClassConfirmedMail,
	ClassDeclinedMail,
	ChangePasswordToken,
	VerificationToken,
	ClassRequest,
	ClassCancelEmail,
	ClassCancelInitiater,
	ClassCancelNotify,
};
