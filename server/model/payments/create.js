import { ResponseUtility } from '../../utility';
import { StripeServices } from '../../services';
/**
 * create a new payment
 */
export default ({
	token,
	email,
}) => new Promise((resolve, reject) => {
	if (token && email) {
		StripeServices.createCustomer({ token, email })
			.then(success => resolve(success))
			.catch(err => reject(err));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
