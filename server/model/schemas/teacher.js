import { Schema } from 'mongoose';

const Teacher = new Schema({
	name: String,
	picture: String,
	dob: Number,
	password: String,
	gender: String,
	email: String,
	bio: String,
	address: {
		location: String,
		suburb: String,
		state: String,
		type: { type: String },
		coordinates: [Number],
	},
	availability: {},
	isVerified: Boolean,
	degree: String,
	qualification: String,
	school: String,
	degreePayload: String,
	deleted: Boolean,
	blocked: Boolean,
	firstLogin: Boolean,
	passChangeToken: Number,
	passChangeTimestamp: Number,
	deviceId: String,
});

export default Teacher;
