import { Schema } from 'mongoose';

const Bookings = new Schema({
	ref: String, // the class id to book for
	teacher: String, // the id of the teacher for the class
	by: String, // the user booking the class,
	slot: Number,
	timestamp: Number,
	deleted: Boolean,
	confirmed: Boolean,
	cancelled: Boolean,
	completed: Boolean,
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
Bookings.virtual('teacherDetails', {
	ref: 'teachers',
	localField: 'teacher',
	foreignField: '_id',
	justOne: true,
});

export default Bookings;
