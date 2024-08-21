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

type Trip = {
  id: string;
  name: string;
  description: string;
  start_date: Date;
  end_date: Date;
};

type TripToInsert = {
  name: string;
  description: string;
  start_date: Date;
  end_date: Date;
};

export const GetTrips = async (req: Request, res: Response) => {
  //get trip id from req.params

  const { id } = req.params;
  try {
    const trips = await db('trips').select('*').where({ id });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

const CreateTrip = async (req: Request, res: Response) => {
  const { name, description, start_date, end_date } = req.body;

  const { id } = req.params;

  try {
    const trip_to_insert: TripToInsert = {
      name,
      description,
      start_date,
      end_date,
    };

    const trip = await db('trips').insert(trip_to_insert).returning('*');

    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

const deleteTrip = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const trip = await db('trips').delete('*').where({ id });

    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

const updateTrip = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, start_date, end_date } = req.body;

  try {
    const trip_to_update: Trip = {
      id,
      name,
      description,
      start_date,
      end_date,
    };

    const trip = await db('trips')
      .update(trip_to_update)
      .where({ id })
      .returning('*');

    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

export default {
  GetTrips,
  CreateTrip,
  deleteTrip,
  updateTrip,
};
