import { describe, it } from 'mocha';
import { expect } from 'chai';
import { ClassServices } from '../../../server/model';
import { SUCCESS_CODE, STUDENT_LEVEL } from '../../../server/constants';

export default () => {
	describe.skip('This will test the creation of new class', () => {
		it('should create a new class', (done) => {
			const request = {
				id: '5abcc2a593170a92e6f25223',
				name: 'Crafting',
				picture: 'payload',
				category: '5aba2bebca66351553e91280',
				level: STUDENT_LEVEL.BEGINNER,
				description: 'sample class',
				bio: 'I have been doing this for years',
				timeline: new Date('2018/04/01').getTime(),
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
