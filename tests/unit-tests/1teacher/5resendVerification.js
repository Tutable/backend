import { describe, it } from 'mocha';
import { TeacherServices } from '../../../server/model';

/**
 * test case to update the teacher
 */
export default () => {
	describe('This will test to resend the verification code to user', () => {
		it('should send the verification code', (done) => {
			const email = 'sharma02gaurav@gmail.com';
			TeacherServices.TeacherResendVerificationService({ email })
				.then(() => done()).catch(err => done(err));
		});
	});
};
