/**
 * @desc The module containing the stripe related functionality
 * to handle the stripe payments
 * @author gaurav sharma
 * @since 11th April 2018
 */
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '../constants';
import { ResponseUtility } from '../utility';

const stripe = new Stripe(STRIPE_SECRET_KEY);

/**
 * create a unique stripe user. Will check from database
 * regarding the existance and will be called if key has not
 * been generated alreday for an existing user.
 * @param {String} email
 * @param {String} card
 */
const CreateUser = ({ email, card }) => new Promise((resolve, reject) => {
	if (email && card) {
		stripe.customers.create({
			email,
			description: `Stipe details for ${email} customer`,
			source: card,
		}).then((success) => {
			resolve(success);
		}).catch(err => reject(err));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});

/**
 * create a new payment for the provided source. Handle respective errror
 * @param {Number} amount
 * @param {String} currency
 * @param {String} source the id of the card
 * @param {String} description
 */
const CreatePayment = ({
	amount,
	currency = 'USD',
	source,
	customer,
	description,
}) => new Promise((resolve, reject) => {
	if (amount && currency && source) {
		stripe.charges.create({
			amount,
			currency,
			source,
			customer,
			description,
		})
			.then(success => resolve(success))
			.catch(err => reject(err));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});

export default {
	stripe,
	CreateUser,
	CreatePayment,
};
