import { describe, it } from 'mocha';
import { expect } from 'chai';
import { StudentServices } from '../../../server/model';
import { SUCCESS_CODE } from '../../../server/constants';

export default () => {
	describe('This will test the student register service', () => {
		it('should register a student', (done) => {
			const user = {
				name: 'gaurav sharma',
				email: 'sharma02gaurav@gmail.com',
				password: 'password',
			};
			StudentServices.StudentsRegisterService(user)
				.then((success) => {
					done();
				}).catch(err => done(err));
			// done();
		});
	});
};
