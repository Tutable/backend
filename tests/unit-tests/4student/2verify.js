import { describe, it } from 'mocha';
import { expect } from 'chai';
import { StudentServices } from '../../../server/model';
import { SUCCESS_CODE } from '../../../server/constants';

export default () => {
	describe('This will test the student verification service', () => {
		it('should verify a student', (done) => {
			const user = {
				email: 'sharma02gaurav@gmail.com',
				token: 689285,
			};
			StudentServices.StudentVerifyService(user)
				.then((success) => {
					expect(success.code).to.eq(SUCCESS_CODE);
					done();
				}).catch(err => done(err));
			// done();
		});
	});
};
