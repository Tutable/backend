/**
 * Schema definition for a review for a class
 * @author gaurav sharma
 * @since 31st March 2018
 */
import { Schema } from 'mongoose';

const Review = new Schema({
	ref: String, // id of class
	by: String,	// id of student
	bookingReference: String,	// the booking id in case of multiple class bookings
	stars: Number, // count of stars given
	review: String, // review given
	blocked: Boolean,
	deleted: Boolean,
	posted: Number,
});

export default Review;
