import { describe, it } from 'mocha';
import { expect } from 'chai';
import { TeacherServices } from '../../../server/model';
import { SUCCESS_CODE } from '../../../server/constants';

export default () => {
	describe('This will test the Teacher register service', () => {
		it('should register a user', (done) => {
			const user = {
				name: 'gaurav sharma',
				email: 'sharma02gaurav@gmail.com',
				password: 'password',
			};
			TeacherServices.TeacherRegisterService(user)
				.then((success) => {
					expect(success.code).to.eq(SUCCESS_CODE);
					done();
				})
				.catch(err => done(err));
		});
	});
};
