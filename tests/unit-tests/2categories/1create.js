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
		it('should create a new category as child', (done) => {
			const title = 'Numeracy';
			const parent = '5aba2f8922aa9f15e24015e6';
			CategoriesServices.CategoriesCreateService({ title, parent })
				.then((success) => {
					expect(success.code).to.eq(SUCCESS_CODE);
					done();
				}).catch(err => done(err));
		});
	});
};
