import { Request, Response } from 'express';

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
};

const GetTrips = async (req: Request, res: Response) => {
  //get trip id from req.params

  //const { id } = req.params;
  try {
    //retrieve all trips with matching permissions (user_id)

    const permissions = await db('permissions').select('*').where({
      user_id: res.locals.user,
    });

    console.log('Permissions', permissions);

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
    console.log('Trip Error', error);
    res.status(500).json({ error: error });
  }
};

const CreateTrip = async (req: Request, res: Response) => {
  const { name, description, start_date, end_date, categories } = req.body;
  //chck fields provided
  if (!name || !description || !start_date || !end_date) {
    res
      .status(400)
      .json({ error: 'name, description, start_date, end_date are required' });
    return;
  }

  if (!categories) {
    res.status(400).json({ error: 'categories is required' });
  }

  //get sub from res.locals
  const user_id = res.locals.user;

  if (!user_id) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  //check categories is type of array
  if (categories && !Array.isArray(categories)) {
    res.status(400).json({ error: 'categories must be an array' });
    return;
  }

  console.log('Categories', categories);

  try {
    const trip_to_insert: TripToInsert = {
      name,
      description,
      start_date,
      end_date,
      categories: JSON.stringify(categories),
    };

    const trip = await db('trips').insert(trip_to_insert).returning('*');

    //create permissions admin for the user
    await db('permissions').insert({
      tripid: trip[0].id,
      permission: 'admin',
      user_id,
    });

    res.json(trip);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
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
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const trip = await db('trips').delete('*').where({ id });

    //delete all permissions
    await db('permissions').delete().where({ tripid: id });

    res.json(trip);
  } catch (error) {
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
};

const updateTrip = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, start_date, end_date, categories } = req.body;

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
    console.log(error);
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
    console.log(error);
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
    console.log(error);
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
    console.log(error);
    res.status(500).json({ error: error });
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
};
