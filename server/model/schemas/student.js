import { Schema } from 'mongoose';

const Student = new Schema({
	name: String,
	email: String,
	picture: String,
	password: String,
	google: {
		id: Number,
		accessToken: String,
		firstName: String,
		lastName: String,
		email: String,
	}, // if authenticated via google
	facebook: {
		id: Number,
		accessToken: String,
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
});

export default Student;
