/**
 * Service function to handle stripe payments
 */
import Stripe from 'stripe';
import { STRIPE_PUB_KEY, STRIPE_SECRET_KEY } from '../constants';

const stripe = new Stripe(STRIPE_SECRET_KEY);

const createCustomer = ({ email, token }) => new Promise((resolve, reject) => {
	stripe.customers.create({
		email,
		source: token,
	}).then((success) => {
		console.log(success);
		resolve(success);
	}).catch(err => reject(err));
});

export default {
	createCustomer,
};

