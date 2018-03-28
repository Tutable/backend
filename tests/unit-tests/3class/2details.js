import { describe, it } from 'mocha';
import { expect } from 'chai';
import { ClassServices } from '../../../server/model';
import { SUCCESS_CODE } from '../../../server/constants';

export default () => {
	describe('This tests for class details', () => {
		it('should fetch the details of class based upon id', (done) => {
			const id = '5abb3fd78f94603e46a6216b';
			ClassServices.ClassDetailsService({ id })
				.then((responseClass) => {
					expect(responseClass.code).to.eq(SUCCESS_CODE);
					done();
				}).catch(err => done(err));
		});
	});
};
