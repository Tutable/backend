import { describe, it } from 'mocha';
// import { expect } from 'chai';
import { TeacherServices } from '../../../server/model';
// import { SUCCESS_CODE } from '../../../server/constants';

export default () => {
	describe.skip('This will authenticate the teacher details', () => {
		it('should fail beacuse user is not verified', (done) => {
			const email = 'sharma02gaurav@gmail.com';
			const upassword = 'password';
			TeacherServices.TeacherAuthenticateService({ email, upassword })
				.then(success => done(success))
				.catch(() => done());
		});
	});
};
