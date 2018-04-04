import { Schema } from 'mongoose';

const Bookings = new Schema({
	ref: String, // the class id to book for
	by: String, // the user booking the class,
	slots: {},
	timestamp: Number,
	deleted: Boolean,
	confirmed: Boolean,
}, {
	toJSON: { virtuals: true },
	toObject: { virtuals: true },
});

Bookings.virtual('class', {
	ref: 'classes',
	localField: 'ref',
	foreignField: '_id',
	justOne: true,
});
Bookings.virtual('student', {
	ref: 'students',
	localField: 'by',
	foreignField: '_id',
	justOne: true,
});

export default Bookings;
