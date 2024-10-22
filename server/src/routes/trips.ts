import { Request, Response } from 'express';
import archiver from 'archiver';
import { exec } from 'child_process';
import util from 'util';
const execAsync = util.promisify(exec);
/**

POST /api/trips
Create a New Trip 

GET /api/trips
Get All [Your] Trips 

GET /api/trips/:id
Get a Specific Trip

PUT /api/trips/:id
Update a Specific Trip


*/

import db from '../db/knex';
import path from 'path';
import fs from 'fs/promises';
import { createWriteStream } from 'fs';

type Category = {
  category: string;
  start_date: string;
  end_date: string;
  child_categories: Category[];
};

type Trip = {
  id: string;
  name: string;
  description: string;
  start_date: Date;
  end_date: Date;
  categories: Category[];
};

type TripToInsert = {
  name: string;
  description: string;
  start_date: Date;
  end_date: Date;
  categories: string; // Category[];
  untimed_trips: boolean;
};

type ImageToInsert = {
  tripid: string;
  name: string;
  description: string;
  file_path: string;
  created_at: Date;
  time_zone: string;
  long: number;
  lat: number;
  category: string;
};

type Image = ImageToInsert & {
  id: string;
};

const GetTrips = async (req: Request, res: Response) => {
  //get trip id from req.params

  //const { id } = req.params;
  try {
    //retrieve all trips with matching permissions (user_id)

    const permissions = await db('permissions').select('*').where({
      user_id: res.locals.user,
    });

    if (permissions.length === 0) {
      res.json([]);
      return;
    }

    //get all tripids -> get unique tripids
    const tripids = permissions
      .map((permission) => permission.tripid)
      .filter((value, index, self) => self.indexOf(value) === index);

    //get all trips with matching tripids
    const trips = await db('trips').select('*').whereIn('id', tripids);

    //const trips = await db('trips').select('*'); //.where({ id });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

const CreateTrip = async (req: Request, res: Response) => {
  const { name, description, start_date, end_date, categories, untimed_trips } =
    req.body;

  if (!name || !description || (!untimed_trips && (!start_date || !end_date))) {
    res
      .status(400)
      .json({ error: 'name, description, start_date, end_date are required' });
    return;
  }

  const untimed = untimed_trips || false;

  if (!categories) {
    res.status(400).json({ error: 'categories is required' });
  }

  //get sub from res.locals
  const user_id = res.locals.user;

  if (!user_id) {
    res.status(401).json({ error: 'Unauthorized Access' });
    return;
  }

  //check categories is type of array
  if (categories && !Array.isArray(categories)) {
    res.status(400).json({ error: 'categories must be an array' });
    return;
  }

  try {
    const trip_to_insert: TripToInsert = {
      name,
      description,
      start_date,
      end_date,
      untimed_trips: untimed,
      categories: JSON.stringify(categories),
    };

    if (untimed) {
      trip_to_insert.start_date = new Date('1970-01-01');
      trip_to_insert.end_date = new Date('1970-01-01');
    }

    const trip = await db('trips').insert(trip_to_insert).returning('*');

    //create permissions admin for the user
    await db('permissions').insert({
      tripid: trip[0].id,
      permission: 'admin',
      user_id,
    });

    res.json(trip);
  } catch (error) {
    console.log('Error Deleting Trip', error);
    res.status(500).json({ error: 'Error Creating Trip' });
  }
};

const deleteTrip = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // ensure admin permissions
    const user_id = res.locals.user;

    const permissions = await db('permissions')
      .select('*')
      .where({ tripid: id, user_id });

    if (permissions.length === 0 || permissions[0].permission !== 'admin') {
      res.status(401).json({ error: 'Unauthorized Access To Folder' });
      return;
    }

    const trip = await db('trips').delete('*').where({ id });

    //delete all permissions
    await db('permissions').delete().where({ tripid: id });

    res.json(trip);
  } catch (error) {
    console.log('Error Deleting Trip', error);
    res.status(500).json({ error: error });
  }
};

//type trip, but category is a string instead of an array
type TripInsert = {
  id: string;
  name: string;
  description: string;
  start_date: Date;
  end_date: Date;
  categories: string; // Category[];
  untimed_trips: boolean;
};

const updateTrip = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    name,
    description,
    start_date,
    end_date,
    categories,
    untimed_trips: untimed,
  } = req.body;

  //make sure all these properties are provided
  if (!name || !description || !start_date || !end_date) {
    res
      .status(400)
      .json({ error: 'name, description, start_date, end_date are required' });
    return;
  }

  //check categories is type of array
  if (categories && !Array.isArray(categories)) {
    res.status(400).json({ error: 'categories must be an array' });
    return;
  }

  const category_json = JSON.stringify(categories);

  try {
    const trip_to_update: TripInsert = {
      id,
      name,
      description,
      start_date,
      end_date,
      categories: JSON.stringify(categories),
      untimed_trips: untimed || false,
    };

    const trip = await db('trips')
      .update(trip_to_update)
      .where({ id })
      .returning('*');

    //set categories to empty array if not provided
    if (!trip[0].categories) {
      trip[0].categories = [];
    }

    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: 'Bad Backend' });
  }
};

const getTrip = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    //ensure any level of permissions exists
    const user_id = res.locals.user;

    const permissions = await db('permissions')
      .select('*')
      .where({ tripid: id, user_id });

    if (permissions.length === 0) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const trip = await db('trips').select('*').where({ id });

    //set categories to empty array if not provided
    /*if (!trip[0].categories) {
      trip[0].categories = [];
    }*/

    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

type CategoryBody = {
  category: string;
  start_date: string;
  end_date: string;
};

const addCategoryToTrip = async (req: Request, res: Response) => {
  //get trip id from req.params
  const { id } = req.params;

  try {
    //ensure read-write or admin permissions
    const user_id = res.locals.user;

    const permissions = await db('permissions')
      .select('*')
      .where({ tripid: id, user_id });

    if (
      permissions.length === 0 ||
      (permissions[0].permission !== 'read-write' &&
        permissions[0].permission !== 'admin')
    ) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    //read existing categories
    const trip = await db('trips').select('*').where({ id });

    const categories_json = trip[0].categories;

    //this is a JSON string

    let categories: CategoryBody[] = [];

    try {
      categories = JSON.parse(categories_json);
    } catch (error) {
      categories = [];
    }
    //add category to categories

    const new_category: CategoryBody = req.body;

    // set to 1970-01-01 if untimed trip
    if (trip[0].untimed_trips) {
      new_category.start_date = '1970-01-01';
      new_category.end_date = '1970-01-01';
    }

    if (new_category.start_date || '' === '') {
      //return bad request
      res.status(400).json({ error: 'start_date is required' });
      return;
    }

    if (new_category.end_date || '' === '') {
      //return bad request
      res.status(400).json({ error: 'end_date is required' });
      return;
    }

    if (new_category.category || '' === '') {
      //return bad request
      res.status(400).json({ error: 'category is required' });
      return;
    }

    categories.push(req.body);

    //re-serialize
    const new_categories = JSON.stringify(categories);

    //update the trip
    await db('trips').update({ categories: new_categories }).where({ id });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

const removeCategoryFromTrip = async (req: Request, res: Response) => {
  //get trip id from req.params
  const { id } = req.params;

  try {
    //read existing categories
    const trip = await db('trips').select('*').where({ id });

    const categories_json = trip[0].categories;

    //this is a JSON string
    const categories = JSON.parse(categories_json);

    //remove category from categories
    const new_categories = categories.filter(
      (category: string) => category !== req.body.category
    );

    //re-serialize
    const new_categories_json = JSON.stringify(new_categories);

    //update the trip
    await db('trips').update({ categories: new_categories_json }).where({ id });

    res.json({ message: 'Category removed' });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

const create_temp_link = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user_id = res.locals.user;

  if (!id) {
    res.status(400).json({ error: 'id is required' });
    return;
  }

  if (!user_id) {
    res.status(401).json({ error: 'Unauthorized Access' });
    return;
  }

  try {
    //check if user has permission to access the trip
    const permissions = await db('permissions').select('*').where({
      user_id,
      tripid: id,
    });

    if (permissions.length === 0) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const random_string = Math.random().toString(36).substring(7);
    //create a temporary link
    const temp_link = await db('temp_links')
      .insert({
        tripid: id,
        link: random_string,
      })
      .returning('*');

    res.json(temp_link);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Backend Error' });
  }
};

const downloadTrip = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ error: 'id is required' });
    return;
  }

  //Get permissions
  try {
    //grab temp_links and make sure it was created less than 1 hour ago
    const temp_link = await db('temp_links').select('*').where({
      id,
    });

    if (temp_link.length === 0) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    //check if the link is less than 1 hour old
    const created_at = new Date(temp_link[0].created_at);
    const now = new Date();

    const diff = now.getTime() - created_at.getTime();

    if (diff > 3600000) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const tripId = temp_link[0].tripid;
    console.log('Archiving Trip', tripId);

    const trip = await db('trips').where({ id: tripId });

    if (trip.length === 0) {
      res.status(404).json({ error: 'Trip not found' });
      return;
    }

    //now -> Get All Images
    const images = await db('images').where({ tripid: tripId });

    console.log('# of Images', images.length);

    //For Now -> Skip the paths

    /**
      Here is What you want to save -> And Later ZIP and SEND to the user
      1. JSON document with trip information
      2. JSON Document with Images Metadata
      3. Images Folder -> With Images 
        a) Make Subfolder for each Category
          And Place Images in the Subfolder
          Starting with '' as the root folder
      4. Later -> Paths Folder
    
    */

    //0. Create a Folder with the Trip ID

    const tripFolder = path.join(__dirname, 'downloads', tripId.toString());

    const new_dir = await fs.mkdir(tripFolder, { recursive: true });

    //1. Create JSON Document with Trip Information -> Name this trip.json
    const tripJsonPath = path.join(tripFolder, 'trip.json');
    //fs.writeFileSync(tripJsonPath, JSON.stringify(trip[0], null, 2));
    const tripJsonFile = await fs.writeFile(
      tripJsonPath,
      JSON.stringify(trip[0], null, 2)
    );

    //2. CREATE Json Document with Images Metadata -> Name this images.json
    const images_json = JSON.stringify(images);
    const imagesJsonPath = path.join(tripFolder, 'images.json');
    //fs.writeFileSync(imagesJsonPath, JSON.stringify(images, null, 2));
    const new_images_json = await fs.writeFile(imagesJsonPath, images_json);

    //3. Create Images Folder
    const imagesFolder = path.join(tripFolder, 'images');
    //fs.mkdirSync(imagesFolder, { recursive: true });
    const new_images_folder = await fs.mkdir(imagesFolder, { recursive: true });

    console.log('Images Folder', imagesFolder);

    //3a. Create Subfolders for each Category
    console.log('Trip', trip[0]);
    const categories: Category[] = trip[0].categories;
    const imagesByCategory: {
      category: string;
      images: Image[];
    }[] = categories.map((category: Category) => {
      const categoryImages = images.filter(
        (image: Image) => image.category === category.category
      );
      return {
        category: category.category,
        images: categoryImages,
      };
    });
    //append '.' with all uncategorized images
    const uncategorizedImages = images.filter(
      (image: any) => image.category === '' || image.category === null
    );
    /*imagesByCategory.push({
      category: '',
      images: uncategorizedImages,
    });*/

    const destinations_seen: Set<string> = new Set();

    // Throttling parameters
    const MAX_CONCURRENT_OPERATIONS = 50;
    const DELAY_MS = 10;

    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    const processImage = async (
      image: Image,
      imagesFolder: string,
      destinations_seen: Set<string>
    ) => {
      const imagePath = path.join(__dirname, '..', 'images', image.file_path);
      const extension = image.file_path.split('.').pop();
      let destPath = path.join(imagesFolder, image.name + '.' + extension);

      try {
        const input_file = await fs.readFile(imagePath);

        if (destinations_seen.has(destPath)) {
          destPath = path.join(
            imagesFolder,
            image.name + '_' + Date.now() + '.' + extension
          );
        }

        destinations_seen.add(destPath);

        await fs.writeFile(destPath, input_file);
      } catch (e) {
        console.error('Error copying file', e);
      }
    };

    const createSymbolicLink = async (srcPath: string, destPath: string) => {
      try {
        await fs.symlink(srcPath, destPath);
      } catch (e) {
        //console.error('Error creating symbolic link');
      }
    };

    const processImagesWithThrottling = async (
      images: Image[],
      imagesFolder: string,
      destinations_seen: Set<string>
    ) => {
      const queue: Promise<void>[] = [];

      for (const image of images) {
        if (queue.length >= MAX_CONCURRENT_OPERATIONS) {
          await Promise.race(queue);
        }

        const operation = (async () => {
          const imagePath = path.join(
            __dirname,
            '..',
            'images',
            image.file_path
          );
          const extension = image.file_path.split('.').pop();
          let destPath = path.join(imagesFolder, image.name + '.' + extension);

          if (destinations_seen.has(destPath)) {
            destPath = path.join(
              imagesFolder,
              image.name + '_' + Date.now() + '.' + extension
            );
          }

          destinations_seen.add(destPath);

          await createSymbolicLink(imagePath, destPath);
        })().then(() => {
          queue.splice(queue.indexOf(operation), 1);
        });

        queue.push(operation);
        await delay(DELAY_MS);
      }

      await Promise.all(queue);
    };

    // Process uncategorized images with throttling
    await processImagesWithThrottling(
      uncategorizedImages,
      imagesFolder,
      destinations_seen
    );

    //3b. Create the Subfolders for each Category
    for (const { category, images } of imagesByCategory) {
      const categoryFolder = path.join(imagesFolder, category);
      await fs.mkdir(categoryFolder, { recursive: true });

      const desinations_seen: Set<string> = new Set();

      await processImagesWithThrottling(
        images,
        categoryFolder,
        desinations_seen
      );
    }

    console.log('Making ZIP ');
    //ZIP
    //Make it Titled {Trip.name}_{timestamp}.zip
    const zipFileName = `${trip[0].name}_${Date.now()}.tar.gz`;
    const zipFilePath = path.join(__dirname, 'downloads', zipFileName);
    const output = createWriteStream(zipFilePath);

    console.log('Zip File Path', zipFilePath);

    //execute command and wait for it to finish
    //zip -r -y ${zipFilePath} ${tripFolder}
    //exec command now using nodejs

    //const command = `sh -c 'zip -r -y ${zipFilePath} ${tripFolder}'`;
    // tar -czf archive.tar.gz --dereference -C 0cbd0581-2a50-43b1-9ecd-62412bb8de4e/ .
    console.log('Creating Zip');
    console.log('Trip Folder', tripFolder);
    const command = `sh -c 'tar -czf \"${zipFilePath}\" --dereference -C ${tripFolder} .'`;
    //const command = `tar -czf ${zipFilePath} --dereference -C ${tripFolder} .`;
    const { stdout, stderr } = await execAsync(command);

    console.log('Zip Created', command);

    if (stderr) {
      console.error('Error Creating Zip');
      res.status(500).json({ error: 'Error Creating Zip' });
      return;
    }
    await fs.rm(tripFolder, { recursive: true });
    res.setHeader('Content-Disposition', `attachment; filename=${zipFileName}`);
    res.sendFile(zipFilePath);
    await fs.rm(zipFilePath);

    /*const archive = archiver('zip', {
      zlib: { level: 9 },
    });
    output.on('close', async () => {
      //remove the files
      console.log('Removing Files');
      await fs.rm(tripFolder, { recursive: true });
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=${zipFileName}`
      );
      res.sendFile(zipFilePath);
      //remove the zip file
      await fs.rm(zipFilePath);
    });

    archive.on('error', (err) => {
      throw err;
    });

    archive.pipe(output);
    archive.directory(tripFolder, false);
    archive.finalize();
    */
    //send the zip file to the user

    // and SEND to the user with content-disposition: attachment
  } catch (e) {
    console.log('Error downloading trip', e);
    console.error(e);
    res.status(500).json({ error: 'Backend Error' });
  }
};

export {
  GetTrips,
  CreateTrip,
  deleteTrip,
  updateTrip,
  getTrip,
  addCategoryToTrip,
  removeCategoryFromTrip,
  downloadTrip,
  create_temp_link,
};
