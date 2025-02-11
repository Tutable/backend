import { Schema } from 'mongoose';

const Bookings = new Schema({
	ref: String, // the class id to book for
	teacher: String, // the id of the teacher for the class
	by: String, // the user booking the class,
	slot: {}, // timestamp
	timeline: Number,	// the timestamp representing the class time
	timestamp: Number,
	rate: Number,	// static rate for the class at the time of booking.
	deleted: Boolean,
	confirmed: Boolean,
	confirmationTimestamp: Number,
	cancelled: Boolean,
	cancellationTimestamp: Number,
	completed: Boolean,
}, {
	toJSON: { virtuals: true },
	toObject: { virtuals: true },
});

Bookings.virtual('classDetails', {
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
Bookings.virtual('teacherDetails', {
	ref: 'teachers',
	localField: 'teacher',
	foreignField: '_id',
	justOne: true,
});

export default Bookings;
