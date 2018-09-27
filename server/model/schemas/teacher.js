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
	availability: {},
	isVerified: Boolean,
	degree: String,
	experience: Number,	// the number representing the experience count in years
	qualification: String,
	school: String,
	degreeAsset: String,
	degreeAssetVerified: { type: Boolean, default: false },	// added to verify the degree asset.
	deleted: Boolean,
	blocked: Boolean,
	firstLogin: Boolean,
	verificationToken: Number,
	verificationTokenTimestamp: Number,
	passChangeToken: Number,
	passChangeTimestamp: Number,
	deviceId: String,
	notifications: Number,
}, {
	toJSON: { virtuals: true },
	toObject: { virtuals: true },
});

Teacher.virtual('certs', {
	ref: 'certifications',
	localField: '_id',
	foreignField: 'ref',
	justOne: true,
});

export default Teacher;
