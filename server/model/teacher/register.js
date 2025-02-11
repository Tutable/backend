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

const keys = ['__v', 'password', 'verificationToken', 'verificationTokenTimestamp', 'passChangeToken', 'passChangeTimestamp'];
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
	experience = 0,
	picture,
}) => new Promise((resolve, reject) => {
	if (name && ((name && email && password) || (google || facebook))) {
		let query;
		if (facebook) {
			query = { $or: [{ $and: [{ 'facebook.id': facebook.id }, { deleted: false }] }, { $and: [{ email }, { deleted: false }] }] };
		} else if (google) {
			query = { $or: [{ $and: [{ 'google.id': google.id }, { deleted: false }] }, { $and: [{ email }, { deleted: false }] }] };
		} else {
			query = { $and: [{ email }, { deleted: false }] };
		}
		TeacherModel.findOne(query)
			.then(async (teacher) => {
				if (teacher) {
					const refactoredObject = Object.assign({}, teacher._doc);
					keys.map(key => delete refactoredObject[key]);
					return resolve(ResponseUtility.SUCCESS_DATA(refactoredObject));
				}

				let encryptedPassword;
				let verificationToken;

				if (password) {
					encryptedPassword = await HashUtility.generate(password);
					verificationToken = RandomCodeUtility();
				}
				const verificationTokenTimestamp = Date.now();

				let parsedEmail = email ? email : google ? google.email : facebook ? facebook.email : undefined;
				const teacherModel = new TeacherModel({
					name,
					email: parsedEmail,
					picture,
					password: encryptedPassword,
					verificationToken,
					verificationTokenTimestamp,
					firstLogin: email ? true : false,	// in case of social login, no need to keep the flag
					deleted: false,
					blocked: false,
					isVerified: (google || facebook) ? true : false,
					google,
					facebook,
					notifications: 0,
					experience,
					address,
				});

				const studentModel = new StudentModel({
					name,
					email: parsedEmail,
					password: encryptedPassword,
					picture,
					address: address ? {
						location: address,
						type: 'Point',
						coordinates: [],
					} : undefined,
					verificationToken,
					verificationTokenTimestamp,
					firstLogin: email ? true : false, // in case of social login, no need to keep the flag
					deleted: false,
					blocked: false,
					isVerified: (google || facebook) ? true : false,
					google,
					facebook,
					notifications: 0,
				});

				let teacherData;
				Promise.all([
					new Promise((_resolve, _reject) => {
						teacherModel.save()
							.then((doc) => {
								const refactoredTeacher = Object.assign({}, doc._doc);
								keys.map(key => delete refactoredTeacher[key]);

								teacherData = refactoredTeacher;
								_resolve();
							})
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
				]).then(() => {
					// send the mail here
					if (email && password && !google && !facebook) {
						TemplateMailServices.NewAccountMail({
							to: email,
							verificationCode: verificationToken,
							name,
						})
							.then(() => resolve(ResponseUtility.SUCCESS_DATA(teacherData)))
							.catch(err => reject(err));
					} else {
						resolve(ResponseUtility.SUCCESS_DATA(teacherData));
					}
				}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error creating new user', error: err })));
			}).catch((err) => {
				console.log(err);
				reject(ResponseUtility.ERROR({ message: 'Error looking for teacher', error: err }))
			});
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
