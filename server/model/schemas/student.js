import { Schema } from 'mongoose';

const Student = new Schema({
	name: String,
	email: String,
	picture: String,
	password: String,
	google: {
		id: String,
		accessToken: String,
		refreshToken: String,
		firstName: String,
		lastName: String,
		email: String,
	}, // if authenticated via google
	facebook: {
		id: String,
		accessToken: String,
		refreshToken: String,
		firstName: String,
		lastName: String,
		email: String,
	},	// if authenticated via facebook
	address: {
		location: String,
		type: { type: String },
		coordinates: [Number],
	},
	created: Number,
	isVerified: Boolean,
	profileCompleted: Boolean,
	deleted: Boolean,
	blocked: Boolean,
	verificationToken: Number,
	verificationTokenTimestamp: Number,
	passChangeToken: Number,
	passChangeTimestamp: Number,
	deviceId: String,
	noitifications: Number,	// maintain a count of unread notifications
});

export default Student;
