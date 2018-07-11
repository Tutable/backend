import { Schema } from 'mongoose';

const TeacherCertification = new Schema({
	ref: String,
	policeCertificate: String,
	policeCertificateVerified: { type: Boolean, default: false },
	childrenCertificate: String,
	childrenCertificateVerified: { type: Boolean, default: false },
});

export default TeacherCertification;
