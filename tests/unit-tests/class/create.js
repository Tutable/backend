import { describe, it } from 'mocha';
import { expect } from 'chai';
import { ClassServices } from '../../../server/model';
import { SUCCESS_CODE, STUDENT_LEVEL } from '../../../server/constants';

export default () => {
	describe('This will test the creation of new class', () => {
		it('should create a new class', (done) => {
			const request = {
				id: '5aba07bebaca800baf42f772',
				name: 'Crafting',
				payload: 'payload',
				category: '5aba2c6a7e7ad71583952342',
				level: STUDENT_LEVEL.BEGINNER,
				description: 'sample class',
				bio: 'I have been doing this for years',
				rate: 54,
			};

			ClassServices.ClassCreateService(request)
				.then((success) => {
					// const { data } = success;
					expect(success.code).to.eq(SUCCESS_CODE);
					done();
				})
				.catch(err => done(err));
		});
	});
};
