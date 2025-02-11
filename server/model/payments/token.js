import { StripeServices } from '../../services';
import { ResponseUtility } from '../../utility';

/**
 * internal method for generating the token
 * for the bank account details. The user need to
 * provide the bank account details and API will
 * generate the token
 * @author gaurav sharma
 * @since 13th April 2018
 * @deprecated @since 14th April 2018
 */
export default ({
	country = 'AU',
	currency = 'aud',
	accountHolder,
	holderType = 'individual',
	bsb,
	accountNumber,
}) => new Promise((resolve, reject) => {
	if (accountHolder && holderType && bsb && accountNumber) {
		StripeServices.stripe.tokens.create({
			bank_account: {
				country,
				currency,
				account_holder_name: accountHolder,
				account_holder_type: holderType,
				routing_number: bsb,
				account_number: accountNumber,
			},
		}, (err, token) => {
			if (err) {
				return reject(ResponseUtility.ERROR({ message: 'Error generating token', error: err }));
			}
			resolve(ResponseUtility.SUCCESS_DATA(token));
		});
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
