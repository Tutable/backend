import { ClassSchema } from '../schemas';
import database from '../../db';
import { ResponseUtility } from '../../utility';

const ClassModel = database.model('Class', ClassSchema);

export default ({
	id,
	name,
	payload,
	category,
	level,
	description,
	bio,
}) => new Promise((resolve, reject) => {
	if (id && name && payload && category && level && description) {
		// @todo upload payload to s3
		const classObject = new ClassModel({
			ref: id,
			name,
			payload,
			category,
			level,
			description,
			bio,
		});

		classObject.save().then(() => {
			resolve(ResponseUtility.SUCCESS);
		}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error creating new class', error: err })));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
