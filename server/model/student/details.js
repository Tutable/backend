import {
	StudentSchema,
	PaymentsSchema,
} from '../schemas';
import database from '../../db';
import { ResponseUtility } from '../../utility';
import { S3_STUDENT_PROFILE } from '../../constants';

const StudentModel = database.model('Student', StudentSchema);
const PaymentModel = database.model('Payments', PaymentsSchema);
/**
 * microservice to fetch the student details based upon the user id
 * or email
 * @author gaurav sharma
 * @since 4th Apr 2018
 *
 * @param {String} id
 * @param {String} email
 *
 * @returns Promise
 */
export default ({ id, email }) => new Promise((resolve, reject) => {
	if (id || email) {
		// const query = id ? { _id: id } : { email };
		const query = id ?
			{ $and: [{ _id: id }, { deleted: false }] } :
			{ $and: [{ email }, { deleted: false }] };
		const projection = {
			password: 0,
			verificationToken: 0,
			verificationTokenTimestamp: 0,
			passChangeToken: 0,
			passChangeTimestamp: 0,
			__v: 0,
		};
		StudentModel.findOne(query, projection)
			.then(async (student) => {
				// console.log(student);
				if (student) {
					const {
						_doc: {
							_id,
							name,
							email,
							picture,
							profileCompleted,
							created,
							dob,
							isVerified,
							deleted,
							address,
							google,
							facebook,
							notifications,
						},
					} = student;

					const payment = await PaymentModel.findOne({ ref: _id });

					return resolve(ResponseUtility.SUCCESS_DATA({
						id: _id,
						name,
						email,
						dob,
						picture: picture ? picture.indexOf('http') !== -1 ?  picture :  `/student/asset/${S3_STUDENT_PROFILE}/${picture}` : undefined,
						profileCompleted,
						created,
						isVerified,
						deleted,
						google,
						facebook,
						address,
						notifications,
						card: payment ? {
							type: payment.stripeCustomer.sources.data[0].brand,
							number: payment.stripeCustomer.sources.data[0].last4,
						} : undefined,
					}));
				}
				reject(ResponseUtility.USER_NOT_FOUND);
			}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error looking for student', error: err })));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
