import { describe, it } from 'mocha';
import { expect } from 'chai';
import { TeacherServices } from '../../../server/model';
import { SUCCESS_CODE } from '../../../server/constants';

export default () => {
	describe('This will test the Teacher details service', () => {
		it('should fetch user details', (done) => {
			const email = 'sharma02gaurav@gmail.com';
			TeacherServices.TeacherDetailsService({ email })
				.then((success) => {
					expect(success.code).to.eq(SUCCESS_CODE);
					expect(success.data.email).to.eq(email);
					done();
				})
				.catch(err => done(err));
		});
	});
};
