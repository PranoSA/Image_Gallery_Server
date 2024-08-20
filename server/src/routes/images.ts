import db from '../db/knex';
const { exiftool } = require('exiftool-vendored');

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
const CreateImage = async (req, res) => {
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
    res.status(500).json({ error: error.message });
  }
};

/**
GET /api/:tripId/images

GET images for a trip
GET /api/:tripId/images?start_time=2021-01-01&end_time=2021-01-02


Times Will Be In UTC
*/

const GetImages = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { start_time, end_time } = req.query;

    // if start_time and end_time are provided, filter images by created_at
    // else, get all images for the trip

    let images = db('images').where({ trip_id: tripId });

    if (start_time && end_time) {
      images = images.whereBetween('created_at', [start_time, end_time]);
    }

    images = await images.select('*');

    res.json(images);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
