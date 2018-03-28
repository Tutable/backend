import { ClassSchema } from '../schemas';
import database from '../../db';
import { ResponseUtility } from '../../utility';

const ClassModel = database.model('Class', ClassSchema);

/**
 * microservice to create a new class for the teacher
 * @author gaurav sharma
 * @since 27th March 2018
 *
 * @param {String} id
 * @param {String} name
 * @param {*} payload the class image
 * @param {String} category the category name
 * @param {Number} level the student level @see constants.js for valid types
 * @param {String} desription about the class
 * @param {String} bio about the teachers resemblence with the class
 * @param {Number} rate charged for this class.
 * @returns Promise
 */
export default ({
	id,
	name,
	payload,
	category,
	level,
	description,
	bio,
	rate,
}) => new Promise((resolve, reject) => {
	if (id && name && payload && category && level && description && rate && bio) {
		// @todo upload payload to s3
		const classObject = new ClassModel({
			ref: id,
			name,
			payload,
			category,
			level,
			description,
			bio,
			rate,
			created: Date.now(),
			deleted: false,
		});

		classObject.save().then(() => {
			resolve(ResponseUtility.SUCCESS);
		}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error creating new class', error: err })));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
