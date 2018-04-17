/**
 * Schema definition for a notification for both teacher
 * @author gaurav sharma
 * @since 9the April 2108
 */
import { Schema } from 'mongoose';

const Notification = new Schema({
	ref: String, // id of user to show this notification
	bookingRef: String, // the booking reference number
	/**
	 * id of student user who raised this notification.
	 * Use population to fetch picture, name etc based on id
	 */
	originator: String,
	classId: String,
	slot: {},
	// for the class request. contains the timestamp of the requested time of class
	// this is populated for teacher notification and is empty for student notification
	// @see notifications user stories for more details
	time: Number,
	title: String,
	deleted: Boolean,
	timestamp: Number,
}, {
	toJSON: { virtuals: true },
	toObject: { virtuals: true },
});

Notification.virtual('student', {
	ref: 'Students',
	localField: 'originator',
	foreignField: '_id',
	justOne: true,
});
Notification.virtual('teacher', {
	ref: 'Teachers',
	localField: 'originator',
	foreignField: '_id',
	justOne: true,
});
Notification.virtual('classDetails', {
	ref: 'Classes',
	localField: 'classId',
	foreignField: '_id',
	justOne: true,
});
Notification.virtual('booking', {
	ref: 'Bookings',
	localField: 'bookingRef',
	foreignField: '_id',
	justOne: true,
});

export default Notification;
