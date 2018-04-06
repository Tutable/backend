/**
* This is the tutable-app contant file
* @author gaurav sharma
* @since Tuesday, March 27, 2018 10:47 AM
*/

const host = process.env.MONGO_HOST || 'localhost';
const db = process.env.MONGO_DB || 'tutable-app';
const port = 27017;

export const mongoConnectionString = `mongodb://${host}:${port}/${db}`;
// this string is unique for each project construction
export const secretString = '1iXXiNc6D07eQ7ynoMqh66wbIbl4GlcT';

// global defines all of the other defined users.
export const APPLICATION_ROLES = ['admin', 'student', 'teacher', 'global'];

export const S3_ROUTES = ['teachers', 'certificates', 'class', 'student', 'categories'];
export const SUCCESS_CODE = 100;

export const {
	AWS_ACCESSID,
	AWS_SECRET,
	STANDARD_IMAGE_SIZE,
	S3_SERVER_URL,
	S3_BUCKET,
	P8_FILE,
	APPLE_BUNDLE,
	APPLE_KEY_ID,
	APPLE_TEAM_ID,
	BUSINESS_EMAIL,
	BUSINESS_EMAIL_PASSWORD,
} = process.env;

export const MB = 1024 * 1024;

/**
 * S3 utility URLs
 */
export const S3_TEACHER_CLASS = `${S3_BUCKET}/teacher/classes`;
export const S3_TEACHER_PROFILE = `${S3_BUCKET}/teacher/profile`;
export const S3_TEACHER_CERTS = `${S3_BUCKET}/teacher/certificates`;
export const S3_STUDENT_PROFILE = `${S3_BUCKET}/student/profile`;
export const S3_CATEGORY = 'app-categories';

export const TYPES = {
	TEACHER: 1,
	STUDENT: 2,
};

export const STUDENT_LEVEL = {
	BEGINNER: 1,
	INTERMEDIATE: 2,
	ADVANCED: 3,
};

export const TOKEN_TYPE = {
	VERIFICATION: 1,
	PASS_CHANGE: 2,
};
