/**
 * @desc the passport service module
 * @author gaurav sharma
 */
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { TeacherServices } from '../model';
import { generateToken, decodeToken, ERROR, MISSING_REQUIRED_PROPS } from '../utility/';

/**
 * serialize the generated access token
 */
passport.serializeUser((token, done) => done(undefined, token));
/**
 * deserialize the generated token
 */
passport.deserializeUser((token, done) => {
	const payload = decodeToken(token);
	done(undefined, payload);
});

passport.use('TeacherLogin', new LocalStrategy((username, password, done) => {
	if (username && password) {
		const query = { email: username, password };
		// DoctorServices.DoctorsAuthenticationService(query)
		// 	.then((success) => {
		// 		const { data } = success;
		// 		const doctorObject = Object.assign({}, data, { role: 'doctor' });
		// 		done(undefined, { code: 100, message: 'Authenticated', accessToken: generateToken(doctorObject) });
		// 	}).catch(err => done({ code: 102, message: 'Username/password is incorrect', error: err }));
	} else {
		done(null, false, { message: 'Missing required properties.' });
	}
}));

export const teacherLoginHandler = (req, res, next) => {
	passport.authenticate('DoctorLogin', (err, doctor, info) => {
		if (doctor) {
			res.status(200).send(doctor);
		} else {
			res.status(200).send(ERROR({ message: 'Authentication Failed.', error: err }));
		}
	})(req, res, next);
};


export default passport;