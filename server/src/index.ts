const express = require('express');
import path from 'path';
import multer from 'multer';
import cors from 'cors';

import {
  GetTrips,
  CreateTrip,
  deleteTrip,
  updateTrip,
  getTrip,
} from './routes/trips';

import { Request, Response } from 'express';

import { CreatePath, GetPaths } from './routes/paths';

import {
  CreateImage,
  DeleteImage,
  GetImages,
  GetImage,
  EditImage,
} from './routes/images';

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

//Get The Images For A Trip
app.get('/api/v1/trip/:tripid/images', GetImages);

//Get A Specific Image For A Trip
app.get('/api/v1/trip/:tripId/images/:id', GetImage);

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

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
