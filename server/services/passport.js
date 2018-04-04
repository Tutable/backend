/**
 * @desc the passport service module
 * @author gaurav sharma
 */
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { TeacherServices, StudentServices } from '../model';
// import { generateToken, decodeToken, ERROR, MISSING_REQUIRED_PROPS } from '../utility/';
import { TokenUtility, ResponseUtility } from '../utility';

/**
 * serialize the generated access token
 */
passport.serializeUser((token, done) => done(undefined, token));
/**
 * deserialize the generated token
 */
passport.deserializeUser((token, done) => {
	const payload = TokenUtility.decodeToken(token);
	done(undefined, payload);
});

passport.use('TeacherLogin', new LocalStrategy((username, password, done) => {
	if (username && password) {
		const query = { email: username, upassword: password };
		TeacherServices.TeacherAuthenticateService(query)
			.then((success) => {
				const { user } = success;
				const teacher = Object.assign({}, user._doc, { role: 'teacher' });
				done(undefined, { code: 100, message: 'Authenticated', accessToken: TokenUtility.generateToken(teacher) });
			}).catch(err => done(err));
	} else {
		done(null, false, { message: 'Missing required properties.' });
	}
}));

export const teacherLoginHandler = (req, res, next) => {
	passport.authenticate('TeacherLogin', (err, teacher, info) => {
		if (teacher) {
			res.status(200).send(teacher);
		} else {
			res.status(200).send(ResponseUtility.ERROR({}));
		}
	})(req, res, next);
};

passport.use('StudentLogin', new LocalStrategy((username, password, done) => {
	if (username && password) {
		const query = { email: username, upassword: password };
		StudentServices.StudentsAuthenticateService(query)
			.then((success) => {
				const { user } = success;
				const student = Object.assign({}, user._doc, { role: 'student' });
				done(undefined, { code: 100, message: 'Authenticated', accessToken: TokenUtility.generateToken(student) });
			}).catch(err => done(err));
	} else {
		done(null, false, { message: 'Missing required properties.' });
	}
}));

export const studentLoginHandler = (req, res, next) => {
	passport.authenticate('StudentLogin', (err, student, info) => {
		if (student) {
			res.status(200).send(student);
		} else {
			res.status(200).send(ResponseUtility.ERROR(err || info));
		}
	})(req, res, next);
};

export default {
	passport,
	TeacherLoginHandler: teacherLoginHandler,
	StudentLoginHandler: studentLoginHandler,
};
