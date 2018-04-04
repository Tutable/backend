import { describe, it } from 'mocha';
import { expect } from 'chai';
import { StudentServices } from '../../../server/model';
import {
	SUCCESS_CODE,
	TOKEN_TYPE,
} from '../../../server/constants';

export default () => {
	describe.skip('This will resend the pass change token and verification token', () => {
		it('should send the pass change token', (done) => {
			const user = {
				email: 'sharma02gaurav@gmail.com',
				tokenType: TOKEN_TYPE.VERIFICATION,
			};
			StudentServices.StudentResendVerificationService(user)
				.then((success) => {
					expect(success.code).to.eq(SUCCESS_CODE);
					done('');
				}).catch(err => done(err));
		});
	});
};
