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

const CreateTrip = async (req, res) => {
  try {
    const { name, description } = req.body;
    const trip = await db('trips').insert({ name, description }).returning('*');
    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
