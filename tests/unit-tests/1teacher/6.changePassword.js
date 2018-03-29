import { describe, it } from 'mocha';
import { expect } from 'chai';
import { TeacherServices } from '../../../server/model';
import { SUCCESS_CODE } from '../../../server/constants';

/**
 * test case to update the teacher
 */
export default () => {
	describe.skip('This will test to change the password', () => {
		it('should change the password', (done) => {
			const email = 'sharma02gaurav@gmail.com';
			const token = 102216;
			const password = 'password';

			TeacherServices.TeacherChangePasswordService({ email, token, password })
				.then((success) => {
					expect(success.code).to.eq(SUCCESS_CODE);
					done();
				}).catch(err => done(err));
		});
	});
};
