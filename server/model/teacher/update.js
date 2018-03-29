import { TeacherSchema } from '../schemas';
import database from '../../db';
import {
	ResponseUtility,
	SchemaMapperUtility,
} from '../../utility';
import { S3Services } from '../../services';
import { S3_TEACHER_PROFILE } from '../../constants';

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
}) => new Promise(async (resolve, reject) => {
	if (id && (name || dob || gender || bio || availability ||
		address || degree || qualification || school || degreeAsset ||
		picture || email)) {
		// check if teacher exists
		const query = { _id: id };
		TeacherModel.findOne(query)
			.then(async (teacher) => {
				if (teacher) {
					// trigger uploading assets
					const degreeKey = `degree-${id}-${Date.now()}`;
					const pictureKey = `picture-${id}-${Date.now()}`;

					const degreeAssetURL = degreeAsset ? degreeKey : undefined;
					const pictureURL = picture ? pictureKey : undefined;

					if (picture || degreeAsset) {
						// upload picture to s3
						const Bucket = S3_TEACHER_PROFILE;
						if (picture) {
							console.log('uplaoding profile pic');
							try {
								await S3Services.uploadToBucket({ Bucket, data: picture, Key: pictureKey });
							} catch (err) {
								reject(ResponseUtility.Error({ message: 'Error uploding profile picture', error: err }));
							}
						}
						if (degreeAsset) {
							console.log('uplaoding user degree');
							try {
								await S3Services.uploadToBucket({ Bucket, data: degreeAsset, Key: degreeKey });
							} catch (err) {
								reject(ResponseUtility.Error({ message: 'Error uploding degree. Please try again.', error: err }));
							}
						}
					}

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
						degreeAsset: degreeAssetURL,
						picture: pictureURL,
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
											degreeAsset: degreeAssetURL,
											picture: pictureURL,
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
					resolve(ResponseUtility.SUCCESS_MMESSAGE({ message: 'Nothing updated. User not found.' }));
				}
			}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error looking for teacher', error: err })));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
