import { StudentSchema } from '../schemas';
import database from '../../db';
import {
	ResponseUtility,
	HashUtility,
	RandomCodeUtility,
} from '../../utility';
import { EmailServices, S3Services } from '../../services';
import { S3_STUDENT_PROFILE } from '../../constants';


const StudentModel = database.model('Student', StudentSchema);
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
		const query = { email };
		StudentModel.findOne(query)
			.then(async (student) => {
				if (student) {
					reject(ResponseUtility.ERROR({ message: 'User already exists' }));
				} else {
					/**
					 * check for image type,
					 * if buffer then push to s3 otherwise
					 * save the image url (in case of google and facebook),
					 * picture field will be provided in case of email/password registration
					 */
					// console.log(typeof picture);					
					const Key = `picture-${email}-${Date.now()}`;
					const Bucket = S3_STUDENT_PROFILE;
					if (picture) {
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
						address,
						picture: typeof picture === 'object' ? Key : picture,
						google,
						facebook,
						profileCompleted: address ? true : false,
						created: Date.now(),
						isVerified: false,
						deleted: false,
						verificationToken,
						verificationTokenTimestamp: Date.now(),
					});

					studentObject.save().then(() => {
						// send verification email
						if (email && password) {
							// email /password register flow
							const subject = `Welcome to tutable app ${name}!!`;
							const text = `Your student account has been created. Your verification token is ${verificationToken}.`;
							EmailServices({ to: email, text, subject })
								.then(() => resolve(ResponseUtility.SUCCESS))
								.catch(err => reject(ResponseUtility.ERROR({ message: 'Error sending verification mail.', error: err })));
						} else {
							resolve(ResponseUtility.SUCCESS_MESSAGE({ message: 'Created new user' }));
						}
						// resolve(ResponseUtility.SUCCESS);
					});
					// resolve();
				}
			}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error looking for student', error: err })));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
