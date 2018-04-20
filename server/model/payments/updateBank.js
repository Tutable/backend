import { Paymentschema } from '../schemas';
import database from '../../db';
import { ResponseUtility } from '../../utility';
import { StripeServices } from '../../services';

const PaymentModel = database.model('Payments', Paymentschema);
/**
 * function to remove the users linked banked account
 */
export default ({
	id,
	email,
	account: {
		country = 'AU',
		currency = 'AUD',
		accountHolder,
		bsb,
		accountNumber,
		accountHolderType = 'individual',
	},
}) => new Promise(async (resolve, reject) => {
	if (id && email && accountHolder && bsb
		&& accountNumber) {
		const payment = await PaymentModel.findOne({ ref: id });
		if (!payment) {
			return reject(ResponseUtility.ERROR({ message: 'No payment source found.' }));
		}
		const {
			_doc: {
				stripeId,
				defaultSource,
			},
		} = payment;

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
			// token is the bank account token
			if (err) {
				return reject(ResponseUtility.ERROR({ message: 'Error generating account token' }));
			}

			StripeServices.UpdateExternalAccount({
				accountId: stripeId,
				externalAccount: token.id,
			}).then(async (success) => {
				// console.log(success);
				const {
					external_accounts: {
						data,
					},
				} = success;
				const addedBankAccount = data[0].id;
				await PaymentModel.update({ ref: id }, { defaultSource: addedBankAccount, stripeCustomer: success });
				resolve(success);
			}).catch(_err => reject(_err));
		});
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
