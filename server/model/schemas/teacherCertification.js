import { Schema } from 'mongoose';

const TeacherCertification = new Schema({
	ref: String,
	policeCertificate: String,
	childrenCertificate: String,
});

export default TeacherCertification;
