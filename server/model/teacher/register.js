import { TeacherSchema } from '../schemas';
import database from '../../db';
import { EmailServices } from '../../services';
import {
	ResponseUtility,
	HashUtility,
	RandomCodeUtility,
} from '../../utility';

const TeacherModel = database.model('Teacher', TeacherSchema);

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
	type,
}) => new Promise((resolve, reject) => {
	if (name && email && password) {
		TeacherModel.findOne({ email })
			.then((teacher) => {
				if (teacher) {
					return reject(ResponseUtility.ERROR({ message: 'User already exists' }));
				}

				HashUtility.generate(password).then((hash) => {
					const passChangeToken = RandomCodeUtility();
					const teacherModel = new TeacherModel({
						name,
						email,
						password: hash,
						passChangeToken,
						passChangeTimestamp: Date.now(),
						firstLogin: true,
						deleted: false,
						blocked: false,
						isVerified: false,
					});

					teacherModel.save().then(() => {
						EmailServices({
							to: email,
							text: `Your verification code is ${passChangeToken}`,
							subject: 'Tutable Verification Code',
						})
							.then(() => resolve(ResponseUtility.SUCCESS))
							.catch(err => reject(err));
					}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error saving', error: err })));
				}, err => reject(ResponseUtility.ERROR({ message: 'Error generating hash', error: err })));
			}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error looking for teacher', error: err })));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
