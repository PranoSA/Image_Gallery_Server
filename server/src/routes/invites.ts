/**

Invites routes

Generate a new invite


Accept an invite


Decline an invite


Get all invites for a user
 knex.schema.createTable('invites', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('email').notNullable();
    table.string('token').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('expires_at').notNullable();
*/

import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import { Request, Response } from 'express';
import knex from '../db/knex';

import { send_invite } from '../migrations/Send_Email';

type InsertionInvite = {
  id: string;
  email: string;
  expires_at: Date;
  code: string;
  permissions: string;
  tripid: string;
  role: string;
};

type PostInviteBody = {
  email: string;
  permissions: string;
};

const generate_invite = async (req: Request, res: Response) => {
  //How Should I Send The Invite?
  //Email? SMS? QR Code?

  const { email, permission: permissions } = req.body;

  const tripid = req.params.tripid;

  if (!tripid) {
    return res.status(400).json({ error: 'Trip ID is required' });
  }

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  //ensure permissions is either read-write, read-only, or admin
  if (
    permissions !== 'read-write' &&
    permissions !== 'read-only' &&
    permissions !== 'admin'
  ) {
    return res.status(400).json({ error: 'Invalid Permissions' });
  }

  //generate uuid for invite
  const id = uuidv4();

  //generate random 20 byte token
  const token = crypto.randomBytes(20).toString('hex');

  //expires in 1 day
  const expires_at = new Date();
  expires_at.setDate(expires_at.getDate() + 1);

  const code = crypto.randomBytes(20).toString('hex');

  //save invite to database
  const invite: InsertionInvite = {
    id,
    email,
    expires_at,
    code,
    permissions,
    tripid,
    role: permissions,
  };

  const trip = await knex('trips').where({ id: tripid }).first();

  const username = res.locals.name;

  const invite_db = await knex('invites').insert(invite).returning('*');
  // email invite??
  const invite_id = invite_db[0].id;

  await send_invite(username, email, trip.name, invite_id, code);

  //Later - add logic to catch and deal with these failures

  //save to da(tabase

  //return invite id
  res.json({ id });
};

//accept invite will have the id in the path param and code in the query param

const accept_invite = async (req: Request, res: Response) => {
  const { inviteid } = req.params;
  const { code } = req.query;

  //test if id in form of uuid
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

  const id = inviteid;

  if (!id || id === '') {
    return res.status(400).json({ error: 'Invite ID is required' });
  }

  if (!code || code === '') {
    return res.status(400).json({ error: 'Missing Code' });
  }

  //check if the invite exists
  const invites = await knex('invites').where({ id });

  const invite = invites[0];

  if (!invite) {
    return res.status(404).json({ error: 'Invite not found' });
  }

  //check if the code matches
  if (invite.code !== code) {
    return res.status(400).json({ error: 'Invalid Code' });
  }

  //check if the invite has expired
  if (new Date() > invite.expires_at) {
    return res.status(400).json({ error: 'Invite has expired' });
  }

  //create the permissions
  const permissions = {
    tripid: invite.tripid,
    permission: invite.permissions,
    user_id: res.locals.user,
  };

  try {
    //insert permissions
    await knex('permissions').insert(permissions);

    //delete the invite
    await knex('invites').where({ id }).delete();

    //redirect user to the trip page or something
    const url = process.env.CLIENT_URL || 'http://localhost:3000';

    const trip = await knex('trips').where({ id: invite.tripid }).first();

    return res.status(200).json({ trip });

    //res.redirect(`${url}/trip/${invite.tripid}`);
  } catch (e) {
    res.status(500).json({ error: 'Failed to accept invite' });
  }
  //res.json({ message: 'Invite Accepted' });
};

//decline invite will have the id in the path param and code in the query param

const decline_invite = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { code } = req.query;

  //check if the invite exists
  const invite = await knex('invites').where({ id }).first();

  if (!invite) {
    return res.status(404).json({ error: 'Invite not found' });
  }

  //check if the code matches
  if (invite.code !== code) {
    return res.status(400).json({ error: 'Invalid Code' });
  }

  //check if the invite has expired
  if (new Date() > invite.expires_at) {
    return res.status(400).json({ error: 'Invite has expired' });
  }

  //delete the invite
  await knex('invites').where({ id }).delete();

  res.json({ message: 'Invite Declined' });
};

//get all invites for a user
const get_invites = async (req: Request, res: Response) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const invites = await knex('invites').where({ email });

  res.json(invites);
};

export { generate_invite, accept_invite, decline_invite, get_invites };
