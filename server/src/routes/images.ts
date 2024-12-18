import path from 'path';
import db from '../db/knex';
const { exiftool } = require('exiftool-vendored');
import fs from 'fs';

import { Request, Response } from 'express';
import { ExifDateTime } from 'exiftool-vendored';

type ImageToInsert = {
  tripid: string;
  name: string;
  description: string;
  file_path: string;
  created_at: Date;
  time_zone: string;
  long: number;
  lat: number;
};

type Image = ImageToInsert & {
  id: string;
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

const CreateImage = async (req_prev: Request, res: Response) => {
  const req = req_prev as SubmitImageRequest;

  const images_for_return: Image[] = [];

  try {
    const { tripid } = req.params;
    const { name, description } = req.body;

    //maybe ignore this and just allow a bunch of images to be uploaded
    // at once

    //const req_image = req.files[0] as Express.Multer.File;

    const files = req.files as Express.Multer.File[];
    //const req_image = req.files['image'] as Express.Multer.File;

    //const images = req.files as Express.Multer.File[];

    /*if (!req.file) {
      res.status(400).json({ error: 'No Image Provided' });
      return;
    }*/

    const images = [req.file as Express.Multer.File];

    for (const image of files) {
      const file_path = image.destination + '/' + image.filename;

      // Use exiftool to get the metadata of the image
      const metadata = await exiftool.read(file_path);

      //Get the GPS Coordinates
      let latitude = 0;
      let longitude = 0;
      const gps = metadata.GPSPosition;
      if (gps) {
        [latitude, longitude] = gps.split(' ');
      } else {
        const latitude = 0;
        const longitude = 0;
      }

      // Get the date the image was taken

      const date_taken = metadata.CreateDate as ExifDateTime;
      let created_at = new Date();

      let time_zone = '00:00:00';
      //convert the date to a string
      if (date_taken) {
        time_zone = date_taken?.zone || date_taken?.zoneName || '+00:00';

        const hour = date_taken.hour;
        const minute = date_taken.minute;
        const second = date_taken.second;
        const year = date_taken.year;
        const month = date_taken.month;
        const day = date_taken.day;

        //create date from year, month, day, hour, minute, second
        created_at = new Date(year, month - 1, day, hour, minute, second);
        created_at.setMinutes(
          created_at.getMinutes() - created_at.getTimezoneOffset()
        );

        //add offset to the date
      }

      const relative_path = image.filename;

      const name = image.originalname;

      const new_image: ImageToInsert = {
        tripid,
        name,
        description,
        file_path: relative_path,
        created_at,
        time_zone,
        long: longitude,
        lat: latitude,
      };

      //insert into the database
      const image_db = await db('images').insert(new_image).returning('*');

      //Not sure if this date is in UTC? or local time
      // If it is in local time, we need to convert it to UTC
      // We can use moment.js for this

      // I need to convert from local time to UTC
      //based on the geolocation of the image

      // We can use moment-timezone for this
      // We can use the moment-timezone plugin to get the timezone
      // of the location of the image
      // We can then convert the date to UTC

      images_for_return.push(image_db[0]);
    }

    // Save the image to the images folder
    // const file_path = req_image.destination + '/' + req_image.filename;

    // const file_path = req.file.destination + '/' + req.file.filename;

    /*const image = await db('images')
      .insert({ tripId, name, description, file_path, created_at:  })
      .returning('*');*/

    res.json(images_for_return);

    //res.json
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
    const { tripid } = req.params;
    const { start_time, end_time } = req.query;

    // if start_time and end_time are provided, filter images by created_at
    // else, get all images for the trip

    if (start_time && end_time) {
      const images = await db('images')
        .where({ tripid })
        .whereBetween('created_at', [start_time, end_time])
        .select('*');

      res.json(images);
      return;
    }

    if (start_time && !end_time) {
      const images = await db('images')
        .where({ tripid })
        .where('created_at', '>', start_time)
        .select('*');

      res.json(images);
      return;
    }

    if (!start_time && end_time) {
      const images = await db('images')
        .where({ tripid })
        .where('created_at', '<', end_time)
        .select('*');

      res.json(images);
      return;
    }

    const images = await db('images').where({ tripid }).select('*');

    //transform created_at to a string

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
    const { tripid, id } = req.params;

    const image_in_existence = await db('images').where({ id }).select('*');

    const i = image_in_existence[0];

    if (image_in_existence.length === 0) {
      res.status(404).json({ error: 'Image Not Found' });
      return;
    }

    await db('images').where({ tripid, id }).delete();

    //find image in the images folder and delete it

    const file_path = image_in_existence[0].file_path;
    fs.unlinkSync(path.join(process.cwd(), 'src', 'images', file_path));

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Gateway Error' });
  }
};

const EditImage = async (req: Request, res: Response) => {
  try {
    const { tripid, id } = req.params;

    const { name, description, long, lat, created_at, category } = req.body;

    const image_in_existence = await db('images').where({ id }).select('*');

    if (image_in_existence.length === 0) {
      res.status(404).json({ error: 'Image Not Found' });
      return;
    }

    await db('images')
      .where({ tripid, id })
      .update({ name, description, long, lat, created_at, category });

    res.json({ message: 'Image Updated Successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Gateway Error' });
  }
};

export { CreateImage, GetImages, GetImage, DeleteImage, EditImage };
