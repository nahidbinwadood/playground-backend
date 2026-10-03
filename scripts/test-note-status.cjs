/**
 * LOCAL TEST HELPER — exercises the note status lifecycle over real HTTP.
 *
 * Proves, against a running local server:
 *   - DRAFT is never reachable from the unauthenticated /notes/complete route
 *   - COMPLETE is
 *   - create + PATCH toggle flip that boundary both ways
 *   - an invalid status is rejected (400), not silently stored
 *   - it leaves no test notes behind
 *
 * Usage: node scripts/test-note-status.cjs
 * Requires: server running, and scripts/_mint-admin-token.cjs run first.
 */
require('dotenv').config();
const fs = require('fs');

const API = `${(process.env.APP_URL || 'http://localhost:5000').replace(/\/$/, '')}/api/v1`;
const TOKEN_PATH = process.argv[2] || '/tmp/pb-token.txt';
const TOKEN = fs.readFileSync(TOKEN_PATH, 'utf8').trim();

let pass = 0;
let fail = 0;

const check = (name, ok, extra = '') => {
  if (ok) {
    pass++;
    console.log(`  PASS  ${name}${extra ? ' — ' + extra : ''}`);
  } else {
    fail++;
    console.log(`  FAIL  ${name}${extra ? ' — ' + extra : ''}`);
  }
};

const api = async (path, { method = 'GET', body, auth = true } = {}) => {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) headers.Authorization = `Bearer ${TOKEN}`;

  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  let parsed = null;
  try {
    parsed = await res.json();
  } catch {
    /* non-JSON body */
  }
  return { status: res.status, body: parsed };
};

const completedIds = async () => {
  // no auth — this is the public read
  const { status, body } = await api('/notes/complete', { auth: false });
  if (status !== 200) throw new Error(`public read returned ${status}`);
  return body.data.map((n) => n.id);
};

const run = async () => {
  const cleanup = [];

  try {
    const categories = await api('/categories', { auth: false });
    const categoryId = categories.body.data[0].id;
    const suffix = Date.now().toString(36);

    // ---- 1. auth boundary still intact ----
    console.log('\n[1] auth boundary');
    const noAuth = await api('/notes', { auth: false });
    check('GET /notes without token is 401', noAuth.status === 401, `got ${noAuth.status}`);
    const withAuth = await api('/notes', { auth: true });
    check('GET /notes with token is 200', withAuth.status === 200, `got ${withAuth.status}`);

    // ---- 2. explicit COMPLETE is public ----
    console.log('\n[2] create with status: COMPLETE');
    const before = await completedIds();
    const created = await api('/notes/create', {
      method: 'POST',
      body: {
        title: `TEST complete ${suffix}`,
        content: 'body for the status test',
        category: categoryId,
        status: 'COMPLETE',
      },
    });
    check('POST returns 201', created.status === 201, `got ${created.status}`);
    check('stored status is COMPLETE', created.body?.data?.status === 'COMPLETE',
      `got ${JSON.stringify(created.body?.data?.status)}`);
    cleanup.push(created.body?.data?.id);

    const afterCreate = await completedIds();
    check('appears on public /notes/complete', afterCreate.includes(created.body.data.id));
    check('public list actually grew', afterCreate.length === before.length + 1);

    // ---- 3. omitted status defaults to DRAFT and stays private ----
    console.log('\n[3] create with no status (defaults to DRAFT)');
    const draft = await api('/notes/create', {
      method: 'POST',
      body: {
        title: `TEST draft ${suffix}`,
        content: 'body for the status test',
        category: categoryId,
      },
    });
    check('POST returns 201', draft.status === 201, `got ${draft.status}`);
    check('defaults to DRAFT', draft.body?.data?.status === 'DRAFT',
      `got ${JSON.stringify(draft.body?.data?.status)}`);
    cleanup.push(draft.body?.data?.id);

    const afterDraft = await completedIds();
    check('DRAFT note is NOT on the public route', !afterDraft.includes(draft.body.data.id));

    // ---- 4. toggle COMPLETE -> DRAFT ----
    console.log('\n[4] toggle COMPLETE -> DRAFT');
    const off = await api(`/notes/${created.body.data.id}`, {
      method: 'PATCH',
      body: { status: 'DRAFT' },
    });
    check('PATCH returns 200', off.status === 200, `got ${off.status}`);
    check('status is now DRAFT', off.body?.data?.status === 'DRAFT');
    const afterOff = await completedIds();
    check('dropped off the public route', !afterOff.includes(created.body.data.id));

    // ---- 5. toggle DRAFT -> COMPLETE ----
    console.log('\n[5] toggle DRAFT -> COMPLETE');
    const on = await api(`/notes/${created.body.data.id}`, {
      method: 'PATCH',
      body: { status: 'COMPLETE' },
    });
    check('PATCH returns 200', on.status === 200, `got ${on.status}`);
    check('status is now COMPLETE', on.body?.data?.status === 'COMPLETE');
    const afterOn = await completedIds();
    check('back on the public route', afterOn.includes(created.body.data.id));

    // ---- 6. invalid status rejected, not stored ----
    console.log('\n[6] invalid status is rejected');
    const badPatch = await api(`/notes/${created.body.data.id}`, {
      method: 'PATCH',
      body: { status: 'PUBLISHED' },
    });
    check('PATCH with bad status is 400', badPatch.status === 400,
      `got ${badPatch.status} ${JSON.stringify(badPatch.body?.message)}`);

    const badCreate = await api('/notes/create', {
      method: 'POST',
      body: { title: `TEST bad ${suffix}`, content: 'x', category: categoryId, status: 'nope' },
    });
    check('create with bad status is 400', badCreate.status === 400, `got ${badCreate.status}`);
    if (badCreate.body?.data?.id) cleanup.push(badCreate.body.data.id);

    // verify the rejected PATCH did not corrupt the record
    const verify = await api(`/notes/${created.body.data.id}`);
    check('record unchanged after rejected PATCH',
      verify.body?.data?.status === 'COMPLETE', `got ${verify.body?.data?.status}`);
  } finally {
    // ---- cleanup ----
    console.log('\n[7] cleanup');
    for (const id of cleanup.filter(Boolean)) {
      try {
        const res = await api(`/notes/${id}`, { method: 'DELETE' });
        console.log(`  delete ${id} -> ${res.status}`);
      } catch (error) {
        console.log(`  delete ${id} FAILED -> ${error.message}`);
      }
    }
    const left = await completedIds();
    check('no test notes left on the public route', left.length === 0,
      `${left.length} remaining`);
  }

  console.log(`\n${fail === 0 ? 'ALL PASS' : 'FAILURES'}: ${pass} passed, ${fail} failed\n`);
  process.exit(fail === 0 ? 0 : 1);
};

run().catch((error) => {
  console.error('\nTEST RUN ABORTED:', error.message);
  process.exit(2);
});
