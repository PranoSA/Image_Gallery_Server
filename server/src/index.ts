import dotenv from 'dotenv';
//load .env file
dotenv.config();

//console.log(
console.log(process.env.KEYCLOAK_ISSUER);

import express, { NextFunction, RequestHandler } from 'express';
import path from 'path';
import multer from 'multer';
import cors from 'cors';

import {
  GetTrips,
  CreateTrip,
  deleteTrip,
  updateTrip,
  getTrip,
  addCategoryToTrip,
  removeCategoryFromTrip,
} from './routes/trips';

import { Request, Response } from 'express';

import { CreatePath, editPath, GetPaths } from './routes/paths';

import {
  CreateImage,
  DeleteImage,
  GetImages,
  GetImage,
  EditImage,
} from './routes/images';

import {
  getDaySummaries,
  createDaySummary,
  updateDaySummary,
  deleteDaySummary,
} from './routes/summaries';

import { verify } from './Auithorization';

const app = express();

//CORS Origins
const allowedOrigins = ['http://localhost:3000', 'http://localhost:5000'];

const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());

// Set up storage for images
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('file', file);
    cb(null, path.join(__dirname, './images/'));
  },
  filename: (req, file, cb) => {
    console.log('file ff', file);
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Set up storage for paths
const pathStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, './paths/'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const uploadImage = multer({
  storage: imageStorage,
  limits: {
    fileSize: 1024 * 1024 * 100,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('File Type Not Supported'));
    }
  },
});
const uploadPath = multer({ storage: pathStorage });

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World');
});

const auth_middleware: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const bearer_header = req.headers.authorization;
  const bearer = bearer_header?.split(' ');

  if (!bearer || bearer.length !== 2) {
    return res.status(401).send('invalid token...');
  }

  const token = bearer[1];

  try {
    const decoded = await verify(token); // Replace 'your-secret-key' with your actual secret key
    console.log('decoded', decoded);
    //set the user in the request context
    //not the body, but the request object
    res.locals.user = decoded.payload.sub;
    console.log('decoded', decoded);

    next();
  } catch (error) {
    console.log('Error verifying token 2', error);
    res.status(401).send('invalid token...');
  }
};

app.use('/whoami', auth_middleware, (req: Request, res: Response) => {
  //
  console.log('User:', res.locals.user);
  console.log('Request:', req.body);
  res.send({
    user: res.locals.user,
  });
});

// Static Paths For Files
app.use('/static/images/', express.static(path.join(__dirname, 'images')));

app.use('/static/paths', express.static(path.join(__dirname, 'paths')));

//Get Trips
app.get('/api/v1/trips', GetTrips);

app.get('/api/v1/trip/:id', getTrip);

//Create Trip
app.post('/api/v1/trips', CreateTrip);

//Delete Trip
app.delete('/api/v1/trips/:id', deleteTrip);

//Update Trip
app.put('/api/v1/trips/:id', updateTrip);

//paths

app.post(
  '/api/v1/trip/:tripid/paths',
  uploadPath.single('kml_file'),
  CreatePath
);

app.get('/api/v1/trip/:tripid/paths', GetPaths);

//update path
app.put('/api/v1/trip/:tripid/path/:id', editPath);

//Get The Images For A Trip
app.get('/api/v1/trip/:tripid/images', GetImages);

//Get A Specific Image For A Trip
app.get('/api/v1/trip/:tripId/images/:id', GetImage);

// update an image
app.put('/api/v1/trip/:tripid/images/:id', EditImage);

const testMiddleware = (req: Request, res: Response, next: any) => {
  console.log('Middleware');
  //res.end();
  //return;
  next();
};
//Create An Image For A Trip
app.post(
  '/api/v1/trip/:tripid/images',
  testMiddleware,
  //uploadImage.single('image'),
  uploadImage.array('image', 100),
  CreateImage
);

//Delete An Image For A Trip
app.delete('/api/v1/trip/:tripid/images/:id', DeleteImage);

//Edit An Image For A Trip
app.put('/api/v1/trip/:tripid/images/:id', EditImage);

//Create an Album/Trip

// Trip has multiple images

//Trip Has multiple Vector routes

//Add Routes to Trip

//Create Image For Trip

//Day Summaries
app.get('/api/v1/trip/:tripid/day_summaries/:date', getDaySummaries);

app.post('/api/v1/trip/:tripid/day_summaries/:date', createDaySummary);

app.put('/api/v1/trip/:tripid/day_summaries/:date', updateDaySummary);

app.delete('/api/v1/trip/:tripid/day_summaries/:date', deleteDaySummary);

// Now --- do the categories even though its not its own database table

app.post('/api/v1/trip/:tripid/categories', addCategoryToTrip);

app.delete('/api/v1/trip/:tripid/categories', removeCategoryFromTrip);

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
