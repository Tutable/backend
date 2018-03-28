/**
 * @desc the passport service module
 * @author gaurav sharma
 */
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { TeacherServices } from '../model';
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
				const { data } = success;
				const teacher = Object.assign({}, data, { role: 'teacher' });
				done(undefined, { code: 100, message: 'Authenticated', accessToken: TokenUtility.generateToken(teacher) });
			}).catch(err => done({ code: 102, message: 'Username/password is incorrect', error: err }));
	} else {
		done(null, false, { message: 'Missing required properties.' });
	}
}));

export const teacherLoginHandler = (req, res, next) => {
	passport.authenticate('TeacherLogin', (err, teacher, info) => {
		if (teacher) {
			res.status(200).send(teacher);
		} else {
			res.status(200).send(ResponseUtility.ERROR({ message: 'Authentication Failed.', error: err }));
		}
	})(req, res, next);
};

export default {
	passport,
	TeacherLoginHandler: teacherLoginHandler,
};
