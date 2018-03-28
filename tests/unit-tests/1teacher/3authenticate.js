import { describe, it } from 'mocha';
import { expect } from 'chai';
import { TeacherServices } from '../../../server/model';
import { SUCCESS_CODE } from '../../../server/constants';

export default () => {
	describe('This will authenticate the teacher details', () => {
		it('should authenticate the user', (done) => {
			const email = 'sharma02gaurav@gmail.com';
			const upassword = 'password';
			TeacherServices.TeacherAuthenticateService({ email, upassword })
				.then((success) => {
					expect(success.matched).to.eq(true);
					done();
				})
				.catch(err => done(err));
		});
	});
};
