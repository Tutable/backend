/**
* This is the server file for tutable-app
* @author gaurav sharma
* @since Tuesday, March 27, 2018 10:47 AM
*/
import express from 'express';
import busboyBodyParser from 'busboy-body-parser';
import bodyParser from 'body-parser';
import session from 'express-session';
import morgan from 'morgan';
import path from 'path';
import flash from 'connect-flash';
import passport from 'passport';
import cors from 'cors';
import { secretString } from './constants';
import ActivateRoutes from './routes';
import { LoggerServices } from './services';

const app = express();

// enable cors support
app.use(cors({
	origin: '*',
	methods: ['GET', 'POST'],
	allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-HTTP-Method-Override', 'Accept'],
	credentials: true,
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(busboyBodyParser());
app.use(LoggerServices.RequestInterceptor);
if (process.env.NODE_ENV !== 'production') {
	app.use(LoggerServices.ResponseInterceptor);
}
app.use(morgan('dev'));
app.use(express.static(path.resolve('dist')));
app.use(session({ secret: secretString, resave: true, saveUninitialized: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(flash());

// call this to activate routes or define inside the route directory
ActivateRoutes(app);

const env = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';
app.get('/', (req, res) => res.send(`<h1>Tutable app ${env} environment</h1>`));

const port = process.env.NODE_ENV === 'development' ? 3000 : 3001;

app.listen(port, () => console.log(`Backend is running on port ${port}`));
