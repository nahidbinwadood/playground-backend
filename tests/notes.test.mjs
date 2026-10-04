import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import app from '../src/app';
import { Note } from '../src/app/modules/note/note.model';
import { accessTokenFor, createCategory, createUser } from './helpers.mjs';

describe('note privacy', () => {
  let userToken;
  let draftId;

  beforeAll(async () => {
    await createUser({ email: 'reader@notes.test' });
    const category = await createCategory('Databases');

    await Note.create({
      title: 'Finished takeaway',
      content: 'Indexes speed up reads',
      category: category._id,
      status: 'COMPLETE',
    });
    const draft = await Note.create({
      title: 'Half-written thought',
      content: 'private scribbles',
      category: category._id,
      // status omitted on purpose: the schema default must be DRAFT
    });
    draftId = draft._id.toString();

    userToken = await accessTokenFor('reader@notes.test');
  });

  it('GET /notes/complete returns only COMPLETE notes', async () => {
    const res = await request(app).get('/api/v1/notes/complete');

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data.every((note) => note.status === 'COMPLETE')).toBe(
      true
    );
    expect(JSON.stringify(res.body)).not.toContain('private scribbles');
  });

  it.each([
    ['GET /notes', 'get', () => '/api/v1/notes'],
    ['GET /notes/:id', 'get', () => `/api/v1/notes/${draftId}`],
    ['GET /notes/blog/:blogId', 'get', () => `/api/v1/notes/blog/${draftId}`],
    ['DELETE /notes/:id', 'delete', () => `/api/v1/notes/${draftId}`],
  ])('%s rejects a normal user', async (_label, method, url) => {
    const res = await request(app)
      [method](url())
      .set('Authorization', `Bearer ${userToken}`);

    expect([401, 403]).toContain(res.status);
    expect(JSON.stringify(res.body)).not.toContain('private scribbles');
  });

  it('POST /notes/create rejects a normal user', async () => {
    const res = await request(app)
      .post('/api/v1/notes/create')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'x', content: 'y' });

    expect([401, 403]).toContain(res.status);
  });

  it('PATCH /notes/:id rejects a normal user and leaves the note untouched', async () => {
    const res = await request(app)
      .patch(`/api/v1/notes/${draftId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ status: 'COMPLETE' });

    expect([401, 403]).toContain(res.status);
    const note = await Note.findById(draftId);
    expect(note.status).toBe('DRAFT');
  });

  it('admin-only note routes reject a request without a token', async () => {
    const res = await request(app).get('/api/v1/notes');

    expect(res.status).toBe(401);
  });
});
