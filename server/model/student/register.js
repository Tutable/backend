import { token } from 'apn';
import { StudentSchema } from '../schemas';
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
					reject(ResponseUtility.ERROR_DATA({ data: refactoredObject, message: 'User already exists' }));
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
					// if picture is object type then process uploading it otherwise
					// skip this step
					if (picture && typeof picture === 'object') {
						try {
							await S3Services.uploadToBucket({ Key, Bucket, data: picture });
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

					// create a new student
					const studentObject = new StudentModel({
						name,
						email,
						password: encryptedPassword,
						address: address ? {
							location: address,
						} : undefined,
						picture: Key,
						google,
						facebook,
						profileCompleted: address ? true : false,
						created: Date.now(),
						isVerified: false,
						deleted: false,
						verificationToken,
						verificationTokenTimestamp: Date.now(),
						notifications: 0,
					});

					studentObject.save().then(() => {
						// send verification email
						if (email && password) {
							// email /password register flow
							TemplateMailServices.NewAccountMail({ to: email, name, verificationCode: verificationToken })
								.then(() => resolve(ResponseUtility.SUCCESS))
								.catch(err => reject(ResponseUtility.ERROR({ message: 'Error sending verification mail.', error: err })));
						} else {
							const refactoredObject = Object.assign({}, studentObject._doc);
							keys.map(key => delete refactoredObject[key]);
							resolve(ResponseUtility.SUCCESS_DATA(refactoredObject));
						}
					});
				}
			}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error looking for student', error: err })));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
