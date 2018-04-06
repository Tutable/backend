import { ClassSchema } from '../schemas';
import database from '../../db';
import { ResponseUtility } from '../../utility';
import { S3Services } from '../../services';
import { S3_TEACHER_CLASS } from '../../constants';

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
	picture,
	category,
	level,
	description,
	timeline,
	bio,
	rate,
}) => new Promise(async (resolve, reject) => {
	if (id && name && picture && category && level && description && rate && timeline) {
		// @todo upload payload to s3
		const Key = `class-${id}-${Date.now()}`;
		try {
			const Bucket = S3_TEACHER_CLASS;
			await S3Services.uploadToBucket({ Bucket, Key, data: picture });
		} catch (err) {
			return reject(ResponseUtility.ERROR({ message: 'Error uploading class image', error: err }));
		}
		const classObject = new ClassModel({
			ref: id,
			name,
			payload: Key,
			category,
			level,
			description,
			bio,
			rate,
			timeline,
			created: Date.now(),
			deleted: false,
			cancelled: false,
		});

		classObject.save().then(() => {
			resolve(ResponseUtility.SUCCESS);
		}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error creating new class', error: err })));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
