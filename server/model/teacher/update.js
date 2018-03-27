import { TeacherSchema } from '../schemas';
import database from '../../db';
import {
	ResponseUtility,
	SchemaMapperUtility,
} from '../../utility';

const TeacherModel = database.model('Teacher', TeacherSchema);

/**
 * update teacher microservice
 * @author gaurav sharma
 * @since 27th March 2018
 */
export default ({
	id,
	name,
	dob,
	gender,
	bio,
	availability,
	email,
	address,
	degree,
	qualification,
	school,
	degreeAsset,
	picture,
}) => new Promise((resolve, reject) => {
	if (id && (name || dob || gender || bio || availability ||
		address || degree || qualification || school || degreeAsset ||
		picture || email)) {
		// check if teacher exists
		const query = { _id: id };
		TeacherModel.findOne(query)
			.then(async (teacher) => {
				if (teacher) {
					// update
					let updateQuery = await SchemaMapperUtility({
						name,
						dob,
						gender,
						bio,
						availability,
						email,
						address,
						degree,
						qualification,
						school,
						degreeAsset,
						picture,
					});
					if (email) {
						// check if email already assigned to someone else
						TeacherModel.findOne({ email })
							.then(async (teacherWithEmail) => {
								if (teacherWithEmail) {
									// do not include email
									try {
										updateQuery = await SchemaMapperUtility({
											name,
											dob,
											gender,
											bio,
											availability,
											address,
											degree,
											qualification,
											school,
											degreeAsset,
											picture,
										});
									} catch (err) {
										resolve(ResponseUtility.SUCCESS_MESSAGE({ message: 'Nothing updated' }));
									}
								}

								// update now
								TeacherModel.update(query, updateQuery, (err, modified) => {
									if (err) {
										return reject(ResponseUtility.ERROR({ message: 'Error updating teacher', error: err }));
									}
									const { nModified } = modified;
									if (nModified >= 1) {
										resolve(ResponseUtility.SUCCESS);
									} else {
										resolve(ResponseUtility.SUCCESS_MESSAGE({ message: 'Nothing modified' }));
									}
								});
							}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error looking for teacher', error: err })));
					} else {
						// update now
						TeacherModel.update(query, updateQuery, (err, modified) => {
							if (err) {
								return reject(ResponseUtility.ERROR({ message: 'Error updating teacher', error: err }));
							}
							const { nModified } = modified;
							if (nModified >= 1) {
								resolve(ResponseUtility.SUCCESS);
							} else {
								resolve(ResponseUtility.SUCCESS_MESSAGE({ message: 'Nothing modified' }));
							}
						});
					}
				} else {
					reject(ResponseUtility.USER_NOT_FOUND);
				}
			}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error looking for teacher', error: err })));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
