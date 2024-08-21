import path from 'path';
import db from '../db/knex';
const { exiftool } = require('exiftool-vendored');
import fs from 'fs';

import { Request, Response } from 'express';

type Image = {
  id: string;
  trip_id: string;
  name: string;
  description: string;
  file_path: string;
  created_at: Date;
};

type ImageRequest = {
  name: string;
  description: string;
};

/**
POST /api/:tripId/image
Create a New Image For a Trip
THIS IS MULTIPART FORM DATA
The Other Fields INclude Name and Description





GET /api/:tripId/images
Get All Images For a Trip

Support Query Params
- start_time
- end_time


GET /api/:tripId/images/:id
Get a Specific Image For a Trip
This will download the image by default

PUT /api/:tripId/images/:id
This is for updating the image
This is also multipart form data
We can update the name and description of the image
As well as the image itself

*/

/**
 * 
 * @param req 
 * @param res 

The Files will be in req.files
The Other Fields will be in req.body
 */

type SubmitImageRequest = Request & {
  files: {
    [key: string]: any;
  };
  body: {
    [key: string]: any;
  };
};

const CreateImage = async (req: SubmitImageRequest, res: Response) => {
  try {
    const { tripId } = req.params;
    const { name, description } = req.body;

    //maybe ignore this and just allow a bunch of images to be uploaded
    // at once

    const req_image = req.files[0] as Express.Multer.File;

    const images = req.files as Express.Multer.File[];

    for (const image of images) {
      const file_path = image.destination + '/' + image.filename;

      // Use exiftool to get the metadata of the image
      const metadata = await exiftool.read(file_path);

      //Get the GPS Coordinates
      const gps = metadata.GPSPosition;
      const [latitude, longitude] = gps.split(' ');

      // Get the date the image was taken
      const date_taken = metadata.CreateDate;

      //insert into the database
      const image_db = await db('images')
        .insert({
          trip_id: tripId,
          name,
          description,
          file_path,
          latitude,
          longitude,
          date_taken,
        })
        .returning('*');

      //Not sure if this date is in UTC? or local time
      // If it is in local time, we need to convert it to UTC
      // We can use moment.js for this

      // I need to convert from local time to UTC
      //based on the geolocation of the image

      // We can use moment-timezone for this
      // We can use the moment-timezone plugin to get the timezone
      // of the location of the image
      // We can then convert the date to UTC
    }

    // Save the image to the images folder
    const file_path = req_image.destination + '/' + req_image.filename;

    const image = await db('images')
      .insert({ trip_id: tripId, name, description, file_path })
      .returning('*');
    res.json(image);
  } catch (error) {
    res.status(500).json({ error: 'Gateway' });
  }
};

/**
GET /api/:tripId/images

GET images for a trip
GET /api/:tripId/images?start_time=2021-01-01&end_time=2021-01-02


Times Will Be In UTC
*/

const GetImages = async (req: Request, res: Response) => {
  try {
    const { tripId } = req.params;
    const { start_time, end_time } = req.query;

    // if start_time and end_time are provided, filter images by created_at
    // else, get all images for the trip

    if (start_time && end_time) {
      const images = await db('images')
        .where({ trip_id: tripId })
        .whereBetween('created_at', [start_time, end_time])
        .select('*');

      res.json(images);
      return;
    }

    if (start_time && !end_time) {
      const images = await db('images')
        .where({ trip_id: tripId })
        .where('created_at', '>', start_time)
        .select('*');

      res.json(images);
      return;
    }

    if (!start_time && end_time) {
      const images = await db('images')
        .where({ trip_id: tripId })
        .where('created_at', '<', end_time)
        .select('*');

      res.json(images);
      return;
    }

    const images = await db('images').where({ trip_id: tripId }).select('*');

    res.json(images);
  } catch (error) {
    res.status(500).json({ error: 'Gatway' });
  }
};

// Get a specific image for a trip
const GetImage = async (req: Request, res: Response) => {
  try {
    const { tripId, imageId } = req.params;

    const image = await db('images')
      .where({ trip_id: tripId, id: imageId })
      .select('*');

    res.json(image);
  } catch (error) {
    res.status(500).json({ error: 'Gateway' });
  }
};

// Delete an image
const DeleteImage = async (req: Request, res: Response) => {
  try {
    const { tripId, imageId, file_path } = req.params;

    await db('images').where({ trip_id: tripId, id: imageId }).delete();

    //find image in the images folder and delete it
    fs.unlinkSync(path.join(__dirname, 'images', file_path));

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Gateway Error' });
  }
};

export { CreateImage, GetImages, GetImage, DeleteImage };
