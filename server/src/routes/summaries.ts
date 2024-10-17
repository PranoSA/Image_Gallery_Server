import { Request, Response } from 'express';

import db from '../db/knex';
//

/*
  //Create a Table of Day Summaries, PK [day, tripid]
  await knex.schema.createTable('day_summaries', (table) => {
    table.date('day').notNullable();
    table.integer('tripid').notNullable();
    table.string('summary').notNullable();
    table.primary(['day', 'tripid']);
    table.timestamps(true, true);
    //foreign key
    table.foreign('tripid').references('trips.id').onDelete('CASCADE');
  });

  */
export const getDaySummaries = async (req: Request, res: Response) => {
  try {
    //tabl
    const tripid = req.params.tripid;
    const date = req.params.date;

    const daySummaries = await db('day_summaries')
      .select('*')
      .where({ tripid, day: date });

    res.json(daySummaries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const createDaySummary = async (req: Request, res: Response) => {
  try {
    const tripid = req.params.tripid;
    const day = req.params.date;
    const { summary } = req.body;

    // insert or update

    const existingSummary = await db('day_summaries').where({ tripid, day });

    if (existingSummary.length > 0) {
      await db('day_summaries').update({ summary }).where({ tripid, day });
      res.json({ message: 'Day Summary Updated' });
      return;
    }

    await db('day_summaries').insert({ tripid, day, summary });

    res.json({ message: 'Day Summary Created' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const updateDaySummary = async (req: Request, res: Response) => {
  try {
    const tripid = req.params.tripid;
    const { day, summary } = req.body;

    await db('day_summaries').update({ summary }).where({ tripid, day });

    res.json({ message: 'Day Summary Updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getDaySummariesForTrip = async (req: Request, res: Response) => {
  const tripid = req.params.tripid;
  if (!tripid) {
    res.status(400).json({ message: 'Trip ID is required' });
    return;
  }
  const daySummaries = await db('day_summaries').select('*').where({ tripid });

  res.json(daySummaries);
};

export const deleteDaySummary = async (req: Request, res: Response) => {
  try {
    const tripid = req.params.tripid;
    const { day } = req.body;

    await db('day_summaries').delete().where({ tripid, day });

    res.json({ message: 'Day Summary Deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
