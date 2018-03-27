
/**
 * this contains the database connection specification
 * @author gaurav sharma
 * @since Tuesday, March 27, 2018 10:47 AM
 */
import mongoose from 'mongoose';
import { Promise as es6Promise } from 'es6-promise';
import { mongoConnectionString } from '../constants';

const useMongoClient = true;

mongoose.Promise = es6Promise;
mongoose.connect(mongoConnectionString, { useMongoClient }, (err) => {
	if (err) {
		console.log('mongo connection err', err);
	} else {
		console.log('database connected');
	}
});

export default mongoose;