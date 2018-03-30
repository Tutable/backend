import { describe, it } from 'mocha';
import { expect } from 'chai';
import { ClassServices } from '../../../server/model';
import { SUCCESS_CODE } from '../../../server/constants';

export default () => {
	describe('This tests for class details', () => {
		it('should fetch the details of class based upon id', (done) => {
			const id = '5abddf6b8f24d8b63a22c5ae';
			ClassServices.ClassDetailsService({ id })
				.then((responseClass) => {
					expect(responseClass.code).to.eq(SUCCESS_CODE);
					done();
				}).catch(err => done(err));
		});
	});
};
