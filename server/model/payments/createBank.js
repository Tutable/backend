import { PaymentsSchema } from '../schemas';
import database from '../../db';
import { ResponseUtility } from '../../utility';
import { StripeServices } from '../../services';

const PaymentsModel = database.model('Payments', PaymentsSchema);

/**
 * create a new user with payment as the source account
 * this model function to be used by the teacher to register
 * the money incoming sourece.
 * @see https://stripe.com/docs/connect/identity-verification-api
 * @param {String} id of the teacher
 * @param {String} email of the teacher
 * @param {*} verificationDocumentData
 * @param {*} account
 * @param {*} personalDetails
 */
export default ({
	id,
	email,
	verificationDocumentData,	// required
	account: {
		country = 'AU',
		currency = 'AUD',
		accountHolder,
		bsb,
		accountNumber,
		accountHolderType = 'individual',
	},
	personalDetails: {
		address: {
			city,
			line1,
			postal,
			state,
		},
		dob: {
			day,
			month,
			year,
		},
		firstName,
		lastName,
		type,
		ip,
	},
}) => new Promise(async (resolve, reject) => {
	if ((id || email) && accountHolder && bsb && accountNumber && city && line1 && postal &&
		state && day && month && year && firstName && lastName && ip && type
		&& verificationDocumentData) {
		const payment = await PaymentsModel.findOne({ ref: id }, { __v: 0 });
		if (payment) {
			return resolve(ResponseUtility.SUCCESS_DATA(payment._doc));
		}
		StripeServices.stripe.tokens.create({
			bank_account: {
				country,
				currency,
				account_holder_name: accountHolder,
				account_holder_type: accountHolderType,
				routing_number: bsb,
				account_number: accountNumber,
			},
		}, async (err, token) => {
			if (err) {
				return reject(ResponseUtility.ERROR({ message: 'Error generating token', error: err }));
			}
			// handle creating the connect account
			try {
				const { altered, raw } = await StripeServices.CreateBankUser({
					email: email || id,
					token: token.id,
					personalDetails: {
						address: {
							city, line1, postal, state, country,
						},
						dob: { day, month, year },
						firstName,
						lastName,
						type,
						ip,
					},
					verificationDocumentData,
				});
				// process uploading verification document

				const paymentData = new PaymentsModel({
					ref: id,
					stripeId: altered.id,
					defaultSource: altered.default_source,
					deleted: false,
					stripeCustomer: raw,
				});
				paymentData.save()
					.then(customer => resolve(ResponseUtility.SUCCESS_DATA(customer)))
					.catch(err => reject(err));
			} catch (err) {
				return reject(err);
			}
		});
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
