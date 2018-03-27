import { Schema } from 'mongoose';

const Class = new Schema({
	ref: String,	// id of the creator
	name: String,
	payload: String,
	category: Number, // category id
	level: Number, // @see constants.js for valid values
	descripton: String,
	bio: String,
});

export default Class;
