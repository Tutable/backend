import { describe, it } from 'mocha';
import { expect } from 'chai';
import { ClassServices } from '../../../server/model';
import { SUCCESS_CODE } from '../../../server/constants';

export default () => {
	describe('This tests for class listing details', () => {
		it('should fetch the list of class based upon teacher id', (done) => {
			const teacherId = '5abcc2a593170a92e6f25223';
			ClassServices.ClassListService({ teacherId })
				.then((responseClass) => {
					expect(responseClass.code).to.eq(SUCCESS_CODE);
					done();
				}).catch(err => done(err));
		});
	});
};
