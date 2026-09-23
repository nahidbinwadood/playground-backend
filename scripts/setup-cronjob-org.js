#!/usr/bin/env node
'use strict';

/**
 * Provisions the cron-job.org fallback triggers for the daily-log reminders.
 *
 * Why a fallback exists at all: Vercel Cron delivery is best-effort. A
 * transient network error means the invocation never reaches the function, and
 * because Vercel does not retry a failed cron run, that reminder is simply lost
 * for the day. These jobs are a second trigger from a different network, so a
 * missed Vercel run still lands.
 *
 * Why they fire 30 minutes later instead of alongside: the endpoint is
 * idempotent per day+slot (the unique index on ReminderLog), so two runs at the
 * same minute would only race each other for the same claim. Offset by 30
 * minutes, each fallback becomes a real retry instead of a coin flip — either
 * the primary already claimed the slot and this run returns `already_sent` and
 * sends nothing, or the primary was missed and this run delivers the message.
 *
 * Usage:
 *   node scripts/setup-cronjob-org.js             # create/update the jobs
 *   node scripts/setup-cronjob-org.js --dry-run   # show what would change
 *   node scripts/setup-cronjob-org.js --print     # manual UI values, no API call
 *
 * Env (put them in .env, or export them before running):
 *   CRONJOB_API_KEY   cron-job.org Console -> Settings -> API keys
 *   APP_URL           deployed base URL, e.g. https://your-app.vercel.app
 *   REMINDER_SECRET   the same value already set on Vercel
 *
 * Re-running is safe: jobs are matched by title and updated in place rather
 * than duplicated.
 */

const path = require('path');

require('dotenv').config({
  path: path.join(__dirname, '..', '.env'),
  quiet: true,
});

const API_BASE = 'https://api.cron-job.org';
const REMINDER_PATH = '/api/v1/reminders/check';

// The reminder service resolves everything against this zone, so the schedule
// is expressed in it directly rather than hand-converted to UTC (which is what
// vercel.json has to do, since Vercel Cron is UTC-only).
const TIMEZONE = process.env.REMINDER_TZ || 'Asia/Dhaka';

// Mirrors the three slots in vercel.json, each offset +30 minutes.
const JOBS = [
  { slot: '18', hour: 18, minute: 30 },
  { slot: '22', hour: 22, minute: 30 },
  { slot: '23', hour: 23, minute: 30 },
];

const titleFor = (job) => `Daily log reminder · ${job.hour}:${job.minute} fallback`;

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const PRINT_ONLY = args.includes('--print');

const apiKey = process.env.CRONJOB_API_KEY;
const appUrl = (process.env.APP_URL || '').replace(/\/+$/, '');
const reminderSecret = process.env.REMINDER_SECRET;

const endpoint = `${appUrl}${REMINDER_PATH}`;

// ---------------------------------------------------------------------------
// manual setup values
//
// Printed whenever the API key is absent so the script is still useful to
// someone who would rather click through the console.
// ---------------------------------------------------------------------------
const printManualSteps = () => {
  console.log('cron-job.org — create 3 jobs in the console (free plan):\n');
  console.log(`  URL:      ${appUrl ? endpoint : `<APP_URL>${REMINDER_PATH}`}`);
  console.log('  Method:   GET');
  // never echo the secret itself, only where to find it
  console.log('  Header:   x-reminder-secret: <your REMINDER_SECRET value>');
  console.log(`  Timezone: ${TIMEZONE}   (set this — the default is UTC)`);
  console.log('');

  JOBS.forEach((job) => {
    console.log(
      `  • ${titleFor(job).padEnd(38)} every day at ${String(job.hour).padStart(2, '0')}:${job.minute}`
    );
  });

  console.log('\n  Also enable, on each job: notify on failure, and notify if disabled.');
  console.log('  A fallback that dies quietly is worse than no fallback.');
};

// ---------------------------------------------------------------------------
// cron-job.org REST API
// ---------------------------------------------------------------------------
const api = async (method, endpointPath, body) => {
  const response = await fetch(`${API_BASE}${endpointPath}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }

  if (!response.ok) {
    throw new Error(
      `${method} ${endpointPath} -> HTTP ${response.status}: ${
        typeof payload === 'string' ? payload : JSON.stringify(payload)
      }`
    );
  }

  return payload;
};

// PUT /jobs is limited to 1 request/second, so mutations are spaced out.
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const jobPayload = (job) => ({
  url: endpoint,
  enabled: true,
  title: titleFor(job),
  saveResponses: true,
  requestMethod: 0, // GET
  requestTimeout: 30,
  schedule: {
    timezone: TIMEZONE,
    expiresAt: 0,
    hours: [job.hour],
    mdays: [-1],
    minutes: [job.minute],
    months: [-1],
    wdays: [-1],
  },
  extendedData: {
    headers: { 'x-reminder-secret': reminderSecret },
  },
  notification: {
    onFailure: true,
    onFailureCount: 1,
    onSuccess: true,
    onDisable: true,
  },
});

const formatUnix = (seconds) =>
  seconds
    ? new Date(seconds * 1000).toLocaleString('en-GB', { timeZone: TIMEZONE })
    : '—';

const main = async () => {
  if (PRINT_ONLY || !apiKey) {
    if (!PRINT_ONLY) {
      console.log('CRONJOB_API_KEY is not set — falling back to manual steps.\n');
    }
    printManualSteps();
    return;
  }

  if (!appUrl) {
    throw new Error(
      'APP_URL is not set. Use the deployed base URL, e.g. APP_URL=https://your-app.vercel.app'
    );
  }

  if (!reminderSecret) {
    throw new Error(
      'REMINDER_SECRET is not set. It must match the value already configured on Vercel, or every job will get a 401.'
    );
  }

  if (appUrl.includes('localhost') || appUrl.includes('127.0.0.1')) {
    console.warn(
      `⚠️  APP_URL looks local (${appUrl}). cron-job.org cannot reach your machine.\n`
    );
  }

  console.log(`Target:   ${endpoint}`);
  console.log(`Timezone: ${TIMEZONE}\n`);

  const { jobs = [] } = await api('GET', '/jobs');
  const existingByTitle = new Map(jobs.map((job) => [job.title, job.jobId]));

  for (const job of JOBS) {
    const title = titleFor(job);
    const existingId = existingByTitle.get(title);
    const when = `${String(job.hour).padStart(2, '0')}:${job.minute}`;

    if (DRY_RUN) {
      console.log(
        `${existingId ? 'update' : 'create'}  ${title}  (daily at ${when} ${TIMEZONE})`
      );
      continue;
    }

    if (existingId) {
      await api('PATCH', `/jobs/${existingId}`, { job: jobPayload(job) });
      console.log(`✓ updated  ${title}`);
    } else {
      const { jobId } = await api('PUT', '/jobs', { job: jobPayload(job) });
      console.log(`✓ created  ${title}  (jobId ${jobId})`);
    }

    await sleep(1200);
  }

  if (DRY_RUN) {
    console.log('\nDry run — nothing was changed.');
    return;
  }

  // Re-read so the reported next fire times come from cron-job.org itself,
  // rather than from what we asked it to store.
  const { jobs: after = [] } = await api('GET', '/jobs');
  const ours = after.filter((job) => job.title.includes('fallback'));

  console.log('\nScheduled:');
  ours
    .sort((a, b) => a.nextExecution - b.nextExecution)
    .forEach((job) => {
      console.log(
        `  ${job.title.padEnd(38)} next ${formatUnix(job.nextExecution)}  enabled=${job.enabled}`
      );
    });

  console.log(
    '\nEach job will return `already_sent` from the endpoint when Vercel Cron already\n' +
      'delivered that slot — that is the intended no-op, not an error.'
  );
};

main().catch((error) => {
  console.error(`\n✗ ${error.message}`);
  process.exit(1);
});
