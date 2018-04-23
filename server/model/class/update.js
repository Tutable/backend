import { ClassSchema } from '../schemas';
import database from '../../db';
import {
	ResponseUtility,
	SchemaMapperUtility,
} from '../../utility';
import { S3Services } from '../../services';
import { S3_TEACHER_CLASS } from '../../constants';

const ClassModel = database.model('Class', ClassSchema);

/**
 * update the class details
 */
export default ({
	id,
	classId,
	name,
	payload,
	level,
	bio,
	rate,
	whyQualified,
}) => new Promise((resolve, reject) => {
	if (id && classId && (name || payload || level || bio || rate)) {
		const lookupQuery = { $and: [{ _id: classId }, { ref: id }, { deleted: false }] };
		ClassModel.findOne(lookupQuery)
			.then(async (classDetails) => {
				const {
					_doc: {
						ref,
					},
				} = classDetails;
				if (ref !== id) {
					return reject(ResponseUtility.ERROR({ message: 'You are not authorized to perform this operation.' }));
				}
				if (!classDetails) {
					return reject(ResponseUtility.ERROR({ message: 'No class found' }));
				}
				const Key = payload ? typeof payload === 'object' ? `class-${classId}-${Date.now()}` : payload : undefined;
				if (typeof payload === 'object') {
					// process uploading image
					const Bucket = S3_TEACHER_CLASS;
					await S3Services.uploadToBucket({ Bucket, Key, data: payload });
				}

				const updateQuery = await SchemaMapperUtility({
					name,
					payload: Key,
					level,
					bio,
					rate,
					whyQualified,
				});

				ClassModel.update(lookupQuery, updateQuery)
					.then((modified) => {
						const { nModified } = modified;
						if (nModified) {
							return resolve(ResponseUtility.SUCCESS);
						}
						reject(ResponseUtility.ERROR({ message: 'Nothing modified' }));
					}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error updateing class', error: err })));
			}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error looking for classs details', error: err })));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
