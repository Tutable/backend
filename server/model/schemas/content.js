import { Schema } from 'mongoose';

/**
 * schema to store web content like aboutus, help and terms
 * @author gaurav sharma
 * @since 21st April 2018
 */
const Content = new Schema({
	about: String,
	help: String,
	terms: String,
});

export default Content;
