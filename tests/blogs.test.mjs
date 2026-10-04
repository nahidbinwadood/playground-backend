import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import app from '../src/app';
import { Blog } from '../src/app/modules/blog/blog.model';
import { accessTokenFor, createCategory, createUser } from './helpers.mjs';

describe('blog privacy', () => {
  let adminToken;
  let userToken;

  beforeAll(async () => {
    const admin = await createUser({ email: 'admin@blogs.test', role: 'admin' });
    await createUser({ email: 'reader@blogs.test' });
    const category = await createCategory('Backend');

    await Blog.create({
      title: 'Published Post',
      content: 'Visible to everyone',
      author: admin._id,
      category: category._id,
      status: 'PUBLISHED',
      isPublished: true,
    });
    await Blog.create({
      title: 'Secret Draft',
      content: 'Not ready yet',
      author: admin._id,
      category: category._id,
      status: 'DRAFT',
      isPublished: false,
    });

    adminToken = await accessTokenFor('admin@blogs.test');
    userToken = await accessTokenFor('reader@blogs.test');
  });

  it('GET /blogs excludes drafts', async () => {
    const res = await request(app).get('/api/v1/blogs');

    expect(res.status).toBe(200);
    const slugs = res.body.data.map((blog) => blog.slug);
    expect(slugs).toContain('published-post');
    expect(slugs).not.toContain('secret-draft');
  });

  it('GET /blogs/:slug returns 404 for a draft', async () => {
    const res = await request(app).get('/api/v1/blogs/secret-draft');

    expect(res.status).toBe(404);
    expect(res.body.data).toBeUndefined();
  });

  it('GET /blogs/:slug returns 200 for a published post', async () => {
    const res = await request(app).get('/api/v1/blogs/published-post');

    expect(res.status).toBe(200);
    expect(res.body.data.slug).toBe('published-post');
  });

  it('GET /blogs/all/:slug rejects a request without a token', async () => {
    const res = await request(app).get('/api/v1/blogs/all/secret-draft');

    expect(res.status).toBe(401);
  });

  it('GET /blogs/all/:slug rejects a non-admin', async () => {
    const res = await request(app)
      .get('/api/v1/blogs/all/secret-draft')
      .set('Authorization', `Bearer ${userToken}`);

    expect([401, 403]).toContain(res.status);
    expect(res.body.data).toBeUndefined();
  });

  it('GET /blogs/all/:slug returns a draft to an admin', async () => {
    const res = await request(app)
      .get('/api/v1/blogs/all/secret-draft')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.slug).toBe('secret-draft');
    expect(res.body.data.isPublished).toBe(false);
  });

  it('GET /blogs/all includes drafts for an admin only', async () => {
    const asUser = await request(app)
      .get('/api/v1/blogs/all')
      .set('Authorization', `Bearer ${userToken}`);
    expect([401, 403]).toContain(asUser.status);

    const asAdmin = await request(app)
      .get('/api/v1/blogs/all')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(asAdmin.status).toBe(200);
    expect(asAdmin.body.data.map((blog) => blog.slug)).toEqual(
      expect.arrayContaining(['published-post', 'secret-draft'])
    );
  });
});
