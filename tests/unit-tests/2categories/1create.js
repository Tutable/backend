import { describe, it } from 'mocha';
import { expect } from 'chai';
import { CategoriesServices } from '../../../server/model';
import { SUCCESS_CODE } from '../../../server/constants';

/**
 * Test case for creating new categories
 */
export default () => {
	describe('This should test the creation of new category', () => {
		it('Should create a new parent category', (done) => {
			const title = 'Test service';
			CategoriesServices.CategoriesCreateService({ title })
				.then((success) => {
					expect(success.code).to.eq(SUCCESS_CODE);
					done();
				}).catch(err => done(err));
		});
	});
};
