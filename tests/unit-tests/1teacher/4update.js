import { describe, it } from 'mocha';
import { expect } from 'chai';
import { TeacherServices } from '../../../server/model';
import { SUCCESS_CODE } from '../../../server/constants';

/**
 * test case to update the teacher
 */
export default () => {
	describe('This will test the Teacher update', () => {
		it('should update user name', (done) => {
			const request = {
				id: '5aba07bebaca800baf42f772',
				email: 'sharma02gaurav@gmail.com',
			};
			TeacherServices.TeacherUpdateService(request)
				.then((success) => {
					expect(success.code).to.eq(SUCCESS_CODE);
					done();
				})
				.catch(err => done(err));
		});
	});
};
