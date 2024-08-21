/**

For Paths, Users will enter a multipart form with a KML File upload
*/

import { Request, Response } from 'express';

/**
 *
 * POST /api/paths
 * Create a New Path
 *
 * GET /api/paths
 * Get All Paths
 *
 * GET /api/paths/:id
 * Get a Specific Path
 *
 * PUT /api/paths/:id
 * Update a Specific Path
 *
 *
 */

import db from '../db/knex';

type Path = {
  id: string;
  trip_id: string;
  name: string;
  description: string;
  kml_file: string;
  start_date: Date;
  end_date: Date;
};

type PathToInsert = {
  name: string;
  description: string;
  start_date: Date;
  end_date: Date;
};

type SubmitPathRequest = Request & {
  files: {
    [key: string]: any;
  };
  body: {
    [key: string]: any;
  };
};

export const GetPaths = async (req: Request, res: Response) => {
  //get path id from req.params

  const { trip_id } = req.params;

  try {
    const paths = await db('paths').select('*').where({ trip_id });
    res.json(paths);
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

export const CreatePath = async (req: SubmitPathRequest, res: Response) => {
  const { name, description, start_date, end_date } = req.body;

  const { trip_id } = req.params;

  try {
    // get info about the uploaded KML file
    const req_kml = req.files[0] as Express.Multer.File;

    const path_to_insert: PathToInsert = {
      name,
      description,
      start_date,
      end_date,
    };

    await db('paths').insert(path_to_insert);

    res.json({ message: 'Path Created' });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};
