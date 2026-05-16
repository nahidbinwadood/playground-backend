import { loadEnvironmentVariables } from './app/config/env';
import { connectDB } from './app/db/connectDB';
import app from './app';

const envVars = loadEnvironmentVariables();

// Connect to DB once at module load — Vercel reuses warm instances,
// so subsequent invocations reuse the existing connection.
connectDB(envVars.DB_URL).catch((err) => {
  console.error('❌ Initial DB connection failed:', err.message);
});

// Vercel requires the default export to be the Express app (a function).
// Do NOT call app.listen() — Vercel manages the HTTP server.
export default app;
