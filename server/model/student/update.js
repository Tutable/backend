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
	// email,
	picture,
	name,
	address,
	dob,
	deviceId,
	notifications,
}) => new Promise(async (resolve, reject) => {
	if (id && (picture || name || address || deviceId || notifications !== undefined || dob)) {
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
		const updateQuery = await SchemaMapperUtility({
			picture: picture ? Key : undefined,
			name,
			address: address ? {
				location: address,
			} : undefined,
			deviceId,
			dob,
			notifications,
		});
		StudentModel.update(query, updateQuery)
			.then((modified) => {
				const { nModified } = modified;
				if (nModified) {
					return resolve(ResponseUtility.SUCCESS);
				}
				resolve(ResponseUtility.ERROR({ message: 'Nothing modified' }));
			}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error updating student.', error: err })));
		// if (email) {
		// 	// check if student already exusts with this new emil id
		// 	const lookupQuery = { email };
		// 	StudentModel.findOne(lookupQuery)
		// 		.then(async (student) => {
		// 			if (student) {
		// 				if (picture) {
		// 					// fetch the picture value and then delete it
		// 				}
		// 				// ignore email
		// 				updateQuery = await SchemaMapperUtility({
		// 					name,
		// 					picture: picture ? Key : undefined,
		// 					address: address ? {
		// 						location: address,
		// 					} : undefined,
		// 					deviceId,
		// 					notifications,
		// 				});
		// 			} else {
		// 				updateQuery = await SchemaMapperUtility({
		// 					name,
		// 					email,
		// 					picture: picture ? Key : undefined,
		// 					address: address ? {
		// 						location: address,
		// 					} : undefined,
		// 					deviceId,
		// 					notifications,
		// 				});
		// 			}

		// 			StudentModel.update({ _id: id }, updateQuery)
		// 				.then((modified) => {
		// 					const { nModified } = modified;
		// 					if (nModified) {
		// 						return resolve(ResponseUtility.SUCCESS);
		// 					}
		// 					resolve(ResponseUtility.ERROR({ message: 'Nothing modified' }));
		// 				}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error updating student.', error: err })));
		// 		}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error looking for student', error: err })));
		// } else {
			
		// }
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
