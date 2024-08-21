/**

For Paths, Users will enter a multipart form with a KML File upload
*/

import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

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
  color_g: number;
  color_b: number;
  color_r: number;
  style: 'solid' | 'dashed' | 'dotted';
  thickness: number;
};

type PathToInsert = {
  name: string;
  description: string;
  start_date: Date;
  end_date: Date;
  color_g: number;
  color_b: number;
  color_r: number;
  style: 'solid' | 'dashed' | 'dotted';
  thickness: number;
  tripid: string;
  kml_file: string;
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

  const { tripid } = req.params;

  try {
    const paths = await db('paths').select('*').where({ tripid });
    res.json(paths);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

export const CreatePath = async (req: SubmitPathRequest, res: Response) => {
  const {
    name,
    description,
    start_date,
    end_date,
    color_g,
    color_r,
    color_b,
    style,
    thickness,
  } = req.body;

  const { tripid } = req.params;

  if (!req.file) {
    return res.status(400).json({ error: 'No KML File Uploaded' });
  }

  if (!tripid) {
    return res.status(400).json({ error: 'No Trip ID Provided' });
  }

  try {
    // get info about the uploaded KML file
    const req_kml = req.file as Express.Multer.File;

    const path_to_insert: PathToInsert = {
      name: name ?? '',
      description: description ?? '',
      start_date: start_date ?? new Date().toISOString().split('T')[0], // Default to today's date
      end_date: end_date ?? new Date().toISOString().split('T')[0], // Default to today's date
      color_g: color_g ?? 255,
      color_r: color_r ?? 255,
      color_b: color_b ?? 255,
      style: style ?? 'solid',
      thickness: thickness ?? 2,
      tripid: tripid ?? 0, // Ensure tripid is provided
      kml_file: req_kml.filename ?? '',
    };

    const new_path = await db('paths').insert(path_to_insert).returning('*');

    res.json(new_path);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

export const DeletePaths = async (req: Request, res: Response) => {
  const { pathid } = req.params;

  try {
    const path_file = (await db('paths')
      .where({ id: pathid })
      .select('*')) as Path[];

    await db('paths').where({ id: pathid }).del();

    //find the path to delete

    fs.unlinkSync(path.join(__dirname, 'paths', path_file[0].kml_file));

    res.json({ message: 'Path Deleted' });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

export const editPath = async (req: Request, res: Response) => {
  //only support updating
  //style, width, color, description, name

  const { pathid } = req.params;

  const { style, width, color_g, color_r, color_b, description, name } =
    req.body;

  try {
    await db('paths')
      .where({ id: pathid })
      .update({ style, width, color_g, color_r, color_b, description, name });

    res.json({ message: 'Path Updated' });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};
