import { Schema } from 'mongoose';

const Category = new Schema({
	title: String,
	parent: String,	// reference to parent
	picture: String,
});

export default Category;
