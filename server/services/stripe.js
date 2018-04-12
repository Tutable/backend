/**
 * @desc The module containing the stripe related functionality
 * to handle the stripe payments
 * @author gaurav sharma
 * @since 11th April 2018
 */
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '../constants';

const stripe = new Stripe(STRIPE_SECRET_KEY);

export default {
	stripe,
};
