import { Schema } from 'mongoose';

const Class = new Schema({
	ref: String,	// id of the creator
	name: String,
	payload: String,
	category: String, // category id
	level: Number, // @see constants.js for valid values
	descripton: String,
	bio: String,
	created: Number,
	timeline: Number,
	deleted: Boolean,
}, {
	toJSON: { virtuals: true },
	toObject: { virtuals: true },
});

Class.virtual('categoryName', {
	ref: 'categories',
	localField: 'category',
	foreignField: '_id',
	justOne: true,
});

export default Class;
