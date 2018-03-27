import { describe, it } from 'mocha';
import { expect } from 'chai';
import { CategoriesServices } from '../../../server/model';

export default () => {
	describe('Tests related to category details', () => {
		it('should fetch the category details', (done) => {
			const id = '5aba2bebca66351553e91280';
			CategoriesServices.CategoriesDetailsService({ id })
				.then((response) => {
					expect(response.data.categories.length).to.eq(2);
					done();
				}).catch(err => done(err));
		});
		it('should not contain any sub category', (done) => {
			const id = '5aba2fbd5b010116084bb921';
			CategoriesServices.CategoriesDetailsService({ id })
				.then((response) => {
					expect(response.data.categories.length).to.eq(0);
					done();
				}).catch(err => done(err));
		});
	});
};
