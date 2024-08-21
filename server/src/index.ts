const express = require('express');
import path from 'path';
import multer from 'multer';

import { Request, Response } from 'express';

import { CreatePath, GetPaths } from './routes/paths';

import { CreateImage, DeleteImage, GetImages, GetImage } from './routes/images';

const app = express();

// Set up storage for images
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'images'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Set up storage for paths
const pathStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'paths'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const uploadImage = multer({ storage: imageStorage });
const uploadPath = multer({ storage: pathStorage });

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World');
});

// Static Paths For Files
app.use('/images', express.static('images'));

app.use('/paths', express.static('paths'));

//paths

app.post('/api/v1/paths', uploadPath.single('kml_file'), CreatePath);

app.get('/api/v1/:tripid/paths', GetPaths);

//Get The Images For A Trip
app.get('/api/v1/:tripid/images', GetImages);

//Get A Specific Image For A Trip
app.get('/api/v1/:tripId/images/:id', GetImage);

//Create An Image For A Trip
app.post('/api/v1/:tripid/images', uploadImage.single('image'), CreateImage);

//Delete An Image For A Trip
app.delete('/api/v1/:tripid/images/:id', DeleteImage);

//Create an Album/Trip

// Trip has multiple images

//Trip Has multiple Vector routes

//Add Routes to Trip

//Create Image For Trip

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
