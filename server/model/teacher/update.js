import {
	TeacherSchema,
	StudentSchema,
} from '../schemas';
import database from '../../db';
import {
	ResponseUtility,
	SchemaMapperUtility,
} from '../../utility';
import { S3Services } from '../../services';
import { S3_TEACHER_PROFILE, S3_STUDENT_PROFILE } from '../../constants';

const TeacherModel = database.model('Teacher', TeacherSchema);
const StudentModel = database.model('Student', StudentSchema);

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
	// email,
	address,
	// boolean indicator representing whether the teacher has relevant degree..
	// remove the degree if already exists
	hasDegree = undefined,
	degree,
	qualification,
	school,
	degreeAsset,
	degreeAssetVerified,
	picture,
	deviceId,
	notifications,
	experience = undefined,
}) => new Promise(async (resolve, reject) => {
	if (id && (name || dob || gender || bio || availability ||
		address || hasDegree !== undefined || degree || qualification || school || degreeAsset || experience ||
		picture /*|| email*/ || deviceId || notifications !== undefined || degreeAssetVerified !== undefined)) {
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
						const studentBucket = S3_STUDENT_PROFILE;
						if (picture) {
							// console.log('uplaoding profile pic');
							try {
								/**
								 * @todo can handle a single path for profile picture.
								 */
								await S3Services.uploadToBucket({ Bucket, data: picture, Key: pictureKey });
								await S3Services.uploadToBucket({ Bucket: studentBucket, data: picture, Key: pictureKey });
								/**
								 * @todo delete the old picture from s3
								 */
							} catch (err) {
								reject(ResponseUtility.Error({ message: 'Error uploding profile picture', error: err }));
							}
						}
						if (degreeAsset) {
							try {
								// remove old one if exists
								// console.log(degreeAsset);
								// const { _doc: { degreeAsset } } = teacher;
								if (teacher._doc.degreeAsset) {
									await S3Services.removeFile({ Bucket: S3_TEACHER_PROFILE, Key: teacher._doc.degreeAsset });
								}
								await S3Services.uploadToBucket({ Bucket, data: degreeAsset, Key: degreeKey });
								/**
								 * @todo delete the old degree asset from s3 if exists
								 */
							} catch (err) {
								reject(ResponseUtility.Error({ message: 'Error uploding degree. Please try again.', error: err }));
							}
						}
					}

					// update
					const updateQuery = await SchemaMapperUtility({
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
						deviceId,
						notifications,
						experience,
						degreeAssetVerified,
					});
					Promise.all([
						new Promise((_resolve, _reject) => {
							TeacherModel.update(query, updateQuery)
								.then(({ nModified }) => {
									if (!nModified) {
										return _resolve(ResponseUtility.ERROR({ message: 'Nothing modified for teacher ' }));
									}
									_resolve();
								}).catch(err => _reject(err));
						}),
						new Promise((_resolve, _reject) => {
							if (picture) {
								StudentModel.update({ email: teacher.email }, { picture: pictureURL })
									.then(({ nModified }) => {
										if (!nModified) {
											return _resolve(ResponseUtility.ERROR({ message: 'Nothing modified for student' }));
										}
										_resolve();
									}).catch(err => _reject(err));
							} else {
								_resolve();
							}
						}),
						new Promise(async (_resolve, _reject) => {
							// handle the qualicfication related updates
							if (hasDegree !== undefined && !hasDegree) {
								const { _doc: { degreeAsset } } = teacher;
								// console.log(degreeAsset);
								const Bucket = S3_TEACHER_PROFILE;
								const Key = degreeAsset;
								// remove degree asset from s3
								if (degreeAsset) {
									const unsetQuery = { $unset: { qualification: 1, school: 1, degreeAsset: 1 } };
									await TeacherModel.update(query, unsetQuery);
									await S3Services.removeFile({ Bucket, Key });
								}
								// console.log(unsetQuery);
								return _resolve();
							}
							_resolve();
						}),
					]).then(() => {
						resolve(ResponseUtility.SUCCESS);
					}).catch(err => reject(err));
				} else {
					resolve(ResponseUtility.SUCCESS_MMESSAGE({ message: 'Nothing updated. User not found.' }));
				}
			}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error looking for teacher', error: err })));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
