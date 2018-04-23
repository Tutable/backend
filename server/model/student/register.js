// import { token } from 'apn';
import {
	StudentSchema,
	TeacherSchema,
} from '../schemas';
import database from '../../db';
import {
	ResponseUtility,
	HashUtility,
	RandomCodeUtility,
} from '../../utility';
import {
	S3Services,
	TemplateMailServices,
} from '../../services';
import { S3_STUDENT_PROFILE } from '../../constants';

const StudentModel = database.model('Student', StudentSchema);
const TeacherModel = database.model('Teacher', TeacherSchema);
const keys = ['__v', 'password', 'verificationToken', 'verificationTokenTimestamp', 'passChangeToken', 'passChangeTimestamp'];
/**
 * microservice to register a new student into the system.
 * This will first check the students email existence
 * Create a new user and sends a verification token via email
 * @author gaurav sharma
 * @since 3rd Apr 2018
 *
 * @param {String} name
 * @param {String} email
 * @param {String} address
 * @param {*} picture
 *
 * @returns Promise
 */
export default ({
	name,
	email,
	password,
	address,
	picture,
	dob,
	google = undefined,
	facebook = undefined,
}) => new Promise((resolve, reject) => {
	if (name && ((email && password) || (google || facebook))) {
		// check if the user already exists
		// a common query to lookup for user email, facebook id or google id by a commong
		// query function
		let query;
		if (facebook) {
			query = { $and: [{ 'facebook.id': facebook.id }, { deleted: false }] };
		} else if (google) {
			query = { $and: [{ 'google.id': google.id }, { deleted: false }] };
		} else {
			query = { $and: [{ email }, { deleted: false }] };
		}
		StudentModel.findOne(query)
			.then(async (student) => {
				if (student) {
					// enhanced the response to support new feature of data
					// by handling the backward compatility of the response
					// the this function was previously sending.
					const refactoredObject = Object.assign({}, student._doc);
					keys.map(key => delete refactoredObject[key]);
					reject(ResponseUtility.ERROR_DATA({ data: refactoredObject, message: 'Account already exists under this email' }));
					// reject(ResponseUtility.ERROR({ message: 'User already exists' }));
				} else {
					/**
					 * check for image type,
					 * if buffer then push to s3 otherwise
					 * save the image url (in case of google and facebook),
					 * picture field will be provided in case of email/password registration
					 */

					// if picture does contains the binary data then map it's name to  S3 URL otherwise
					// it represents an image URL sent via google or facebook API.
					const Key = typeof picture === 'object' ? `picture-${email}-${Date.now()}` : picture;
					const Bucket = S3_STUDENT_PROFILE;
					// const TeacherBucket= S3_TEACHER_PROFILE;
					// if picture is object type then process uploading it otherwise
					// skip this step
					if (picture && typeof picture === 'object') {
						try {
							await S3Services.uploadToBucket({ Key, Bucket, data: picture });
							// await S3Services.uploadToBucket({ Key, Bucket: TeacherBucket, data: picture });
						} catch (err) {
							return reject(ResponseUtility.ERROR({ message: 'Error uploading profile picture', error: err }));
						}
					}

					let encryptedPassword;
					let verificationToken;
					if (password) {
						encryptedPassword = await HashUtility.generate(password);
						// also generate the verification code for email verification
						verificationToken = RandomCodeUtility();
					}

					const verificationTokenTimestamp = Date.now();
					// create a new student
					let parsedEmail = email ? email : google ? google.email : facebook ? facebook.email : undefined;
					const studentObject = new StudentModel({
						name,
						email: parsedEmail,
						password: encryptedPassword,
						address: address ? {
							location: address,
							type: 'Point',
							coordinates: [],
						} : undefined,
						picture: Key,
						google,
						facebook,
						dob,
						profileCompleted: address ? true : false,
						created: Date.now(),
						isVerified: false,
						deleted: false,
						verificationToken,
						verificationTokenTimestamp,
						notifications: 0,
					});

					const teacherObject = new TeacherModel({
						name,
						email: parsedEmail,
						password: encryptedPassword,
						verificationToken,
						google,
						dob,
						facebook,
						// picture: Key,	// upload a separate profile picture for teacher object
						verificationTokenTimestamp,
						firstLogin: true,
						deleted: false,
						blocked: false,
						isVerified: (google || facebook) ? true : false,
						notifications: 0,
						address: address ? {
							location: address,
							type: 'Point',
							coordinates: [],
						} : undefined,
					});

					let studentData;
					Promise.all([
						new Promise((_resolve, _reject) => {
							studentObject.save()
								.then((doc) => {
									const refactoredStudent = Object.assign({}, doc._doc);
									keys.map(key => delete refactoredStudent[key]);

									studentData = refactoredStudent;
									_resolve();
								})
								.catch(err => _reject(err));
						}),
						new Promise((_resolve, _reject) => {
							teacherObject.save()
								.then(() => _resolve())
								.catch(err => _reject(err));
						}),
					]).then(() => {
						if (email && password) {
							TemplateMailServices.NewAccountMail({ to: email, name, verificationCode: verificationToken })
								.then(() => resolve(ResponseUtility.SUCCESS_DATA(studentData)))
								.catch(err => reject(ResponseUtility.ERROR({ message: 'Error sending verification mail.', error: err })));
						} else {
							resolve(ResponseUtility.SUCCESS_DATA(studentData));
						}
					}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error creating user', error: err })));
				}
			}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error looking for student', error: err })));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
