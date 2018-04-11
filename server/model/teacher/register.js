import {
	TeacherSchema,
	StudentSchema,
} from '../schemas';
import database from '../../db';
import { TemplateMailServices } from '../../services';
import {
	ResponseUtility,
	HashUtility,
	RandomCodeUtility,
} from '../../utility';

const TeacherModel = database.model('Teacher', TeacherSchema);
const StudentModel = database.model('Student', StudentSchema);

/**
 * default register microservice for teacher
 * Minimal requirents for register process
 * @author gaurav sharma
 * @since Tuesday, March 27, 2018 10:47 AM
 *
 * @param {String} name
 * @param {String} email
 * @param {String} password
 * @param {Number} type of user registering @see contants.js for details
 */
export default ({
	name,
	email,
	password,
	google = undefined,
	facebook = undefined,
	address,
}) => new Promise((resolve, reject) => {
	if (name && ((name && email && password) || (google || facebook))) {
		TeacherModel.findOne({ email })
			.then((teacher) => {
				if (teacher) {
					return reject(ResponseUtility.ERROR({ message: 'User already exists' }));
				}

				const verificationTokenTimestamp = Date.now();
				HashUtility.generate(password).then((hash) => {
					const verificationToken = RandomCodeUtility();
					const teacherModel = new TeacherModel({
						name,
						email,
						password: hash,
						verificationToken,
						verificationTokenTimestamp,
						firstLogin: true,
						deleted: false,
						blocked: false,
						isVerified: false,
						google,
						facebook,
						notifications: 0,
						address: address ? {
							location: address,
							type: 'Point',
							coordinates: [],
						} : undefined,
					});

					const studentModel = new StudentModel({
						name,
						email,
						password: hash,
						address: address ? {
							location: address,
							type: 'Point',
							coordinates: [],
						} : undefined,
						verificationToken,
						verificationTokenTimestamp,
						firstLogin: true,
						deleted: false,
						blocked: false,
						isVerified: false,
						google,
						facebook,
						notifications: 0,
					});

					Promise.all([
						new Promise((_resolve, _reject) => {
							teacherModel.save()
								.then(() => _resolve())
								.catch(err => _reject(err));
						}),
						new Promise((_resolve, _reject) => {
							/**
							 * @todo check to see if user already exists
							 */
							studentModel.save()
								.then(() => _resolve())
								.catch(err => _reject(err));
						}),
					]).then((values) => {
						// send the mail here
						TemplateMailServices.NewAccountMail({
							to: email,
							verificationCode: verificationToken,
							name,
						})
							.then(() => resolve(ResponseUtility.SUCCESS))
							.catch(err => reject(err));
					}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error creating new user', error: err })));
					// teacherModel.save().then(() => {
					// 	TemplateMailServices.NewAccountMail({
					// 		to: email,
					// 		verificationCode: verificationToken,
					// 		name,
					// 	})
					// 		.then(() => resolve(ResponseUtility.SUCCESS))
					// 		.catch(err => reject(err));
					// }).catch(err => reject(ResponseUtility.ERROR({ message: 'Error saving', error: err })));
				}, err => reject(ResponseUtility.ERROR({ message: 'Error generating hash', error: err })));
			}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error looking for teacher', error: err })));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
