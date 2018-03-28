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
			const email = 'sharma02gaurav@gmail.com';
			TeacherServices.TeacherDetailsService({ email })
				.then((response) => {
					if (response) {
						const { data: { _id } } = response;
						const request = {
							id: _id,
							name: 'Gaurav Sharma',
						};
						TeacherServices.TeacherUpdateService(request)
							.then((success) => {
								expect(success.code).to.eq(SUCCESS_CODE);
								done();
							})
							.catch(err => done(err));
					} else {
						done(Error('User not found.'));
					}
				}).catch(err => done(err));
		});
	});
};
