import { StudentSchema } from '../schemas';
import database from '../../db';
import { S3Services } from '../../services';
import { ResponseUtility, SchemaMapperUtility } from '../../utility';
import { S3_STUDENT_PROFILE } from '../../constants';

const StudentModel = database.model('Student', StudentSchema);
/**
 * microservice function to update the student profile
 * @author gaurav sharma
 * @since 5th April 2018
 *
 * @param {String} id, injected via controller
 * @param {String} email
 * @param {String} picture
 * @param {String} name
 * @param {String} address
 */
export default ({
	id,
	email,
	picture,
	name,
	address,
	deviceId,
}) => new Promise(async (resolve, reject) => {
	if (id && (email || picture || name || address || deviceId)) {
		const query = { _id: id };
		const Key = `picture-${id}-${Date.now()}`;
		if (picture) {
			const Bucket = S3_STUDENT_PROFILE;
			try {
				// console.log(S3Service÷s);
				await S3Services.uploadToBucket({ Key, Bucket, data: picture });
				// delete the old picture
			} catch (err) {
				return reject(ResponseUtility.ERROR({ message: 'Error uploading image to s3', error: err }));
			}
		}
		let updateQuery;
		if (email) {
			// check if student already exusts with this new emil id
			const lookupQuery = { email };
			StudentModel.findOne(lookupQuery)
				.then(async (student) => {
					if (student) {
						if (picture) {
							// fetch the picture value and then delete it
						}
						// ignore email
						updateQuery = await SchemaMapperUtility({
							name,
							picture: picture ? Key : undefined,
							address: address ? {
								location: address,
							} : undefined,
							deviceId,
						});
					} else {
						updateQuery = await SchemaMapperUtility({
							name,
							email,
							picture: picture ? Key : undefined,
							address: address ? {
								location: address,
							} : undefined,
							deviceId,
						});
					}

					StudentModel.update({ _id: id }, updateQuery)
						.then((modified) => {
							const { nModified } = modified;
							if (nModified) {
								return resolve(ResponseUtility.SUCCESS);
							}
							resolve(ResponseUtility.ERROR({ message: 'Nothing modified' }));
						}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error updating student.', error: err })));
				}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error looking for student', error: err })));
		} else {
			updateQuery = await SchemaMapperUtility({
				picture: picture ? Key : undefined,
				name,
				address: address ? {
					location: address,
				} : undefined,
				deviceId,
			});
			StudentModel.update({ _id: id }, updateQuery)
				.then((modified) => {
					const { nModified } = modified;
					if (nModified) {
						return resolve(ResponseUtility.SUCCESS);
					}
					resolve(ResponseUtility.ERROR({ message: 'Nothing modified' }));
				}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error updating student.', error: err })));
		}
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
