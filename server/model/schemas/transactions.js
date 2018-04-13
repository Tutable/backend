/**
 * schema for transactions. They contains the money transfers listing
 * data
 * @author gaurav sharma
 * @since 12th April 2018
 */
import { Schema } from 'mongoose';

const Transaction = new Schema({
	bookingId: String,
	stripeChargeId: String,
	amount: Number,
	status: String,
	type: Number,
	stripeChargeResponse: {},
}, {
	toJSON: { virtuals: true },
	toObject: { virtuals: true },
});
Transaction.virtual('bookings', {
	ref: 'Bookings',
	localField: 'bookingId',
	foreignField: '_id',
	justOne: true,
});

export default Transaction;
