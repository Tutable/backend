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
	deleted: Boolean,
	blocked: Boolean,
	passChangeToken: Number,
	passChangeTimestamp: Number,
	deviceId: String,
});

export default Teacher;
