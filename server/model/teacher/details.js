import {
	TeacherSchema,
	PaymentsSchema,
	TeacherCertificationSchema,
} from '../schemas';
import database from '../../db';
import { ResponseUtility } from '../../utility';
import { S3_TEACHER_PROFILE } from '../../constants';

const TeacherModel = database.model('Teacher', TeacherSchema);
const PaymentsModel = database.model('Payments', PaymentsSchema);
const TeacherCertificationModel = database.model('Certifications', TeacherCertificationSchema);

/**
 * default register microservice for teacher
 * details
 * @author gaurav sharma
 * @since Tuesday, March 27, 2018 10:47 AM
 *
 * @param {String} id
 * @param {String} email
 * either id or email is required. If both provided,
 * id will be given preference over email
 */
export default ({ id, email }) => new Promise((resolve, reject) => {
	if (id || email) {
		const query = id ? { _id: id } : { email };
		TeacherModel.findOne(query)
			.then(async (teacher) => {
				const {
					_doc: {
						_id,
						name,
						email,
						firstLogin,
						deleted,
						blocked,
						isVerified,
						picture,
						degreeAsset,
						school,
						qualification,
						degree,
						bio,
						dob,
						address,
						gender,
						availability,
						deviceId,
						notifications,
					},
				} = teacher;


				const paymentSource = await PaymentsModel.findOne({ ref: _id });
				/**
				 * @todo add certification details
				 */
				const certs = await TeacherCertificationModel.findOne({ ref: `${_id}` });
				
				/**
				 * @todo add payment details
				 */
				const payment = await PaymentsModel.findOne({ ref: `${_id}` });

				resolve(ResponseUtility.SUCCESS_DATA({
					id: _id,
					name,
					email,
					firstLogin,
					deleted,
					blocked,
					isVerified,
					picture: picture ? picture.indexOf('http') !== -1 ? picture : `/teachers/assets/${S3_TEACHER_PROFILE}/${picture}` : undefined,
					degreeAsset: degreeAsset ? `/teachers/assets/${S3_TEACHER_PROFILE}/${degreeAsset}` : undefined,
					school,
					qualification,
					degree,
					bio,
					dob,
					address,
					gender,
					availability,
					deviceId,
					notifications,
					certs,
					// payment: paymentSource || undefined,
					card: payment ? {
						type: undefined,
						number: payment.stripeCustomer.external_accounts.data[0].last4,
						bank: payment.stripeCustomer.external_accounts.data[0].bank_name,
						holder: payment.stripeCustomer.external_accounts.data[0].account_holder_name,
						bsb: payment.stripeCustomer.external_accounts.data[0].routing_number,
					} : undefined,
				}));
			})
			.catch(err => reject(ResponseUtility.ERROR({ message: 'Error looking for user', error: err })));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
