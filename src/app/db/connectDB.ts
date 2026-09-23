import mongoose from 'mongoose';

type MongooseConnect = Promise<typeof mongoose>;

// A cold serverless container can receive several requests at once, and each of
// them would otherwise call mongoose.connect() and open its own connection.
// Caching the in-flight promise on globalThis shares one handshake between
// concurrent requests and keeps it while the container stays warm.
declare global {
  // eslint-disable-next-line no-var
  var __mongooseConnectPromise: MongooseConnect | undefined;
}

export const connectDB = async (DB_URL: string): Promise<void> => {
  // already connected inside this container
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!globalThis.__mongooseConnectPromise) {
    console.info('🔄 Database connection initiated...');
    globalThis.__mongooseConnectPromise = mongoose.connect(DB_URL);
  }

  try {
    await globalThis.__mongooseConnectPromise;
    console.info('✅ Database connection established successfully');
  } catch (error) {
    // clear the rejected promise so the next request retries instead of
    // re-awaiting the same failure forever
    globalThis.__mongooseConnectPromise = undefined;

    console.error('❌ Database connection failed');
    console.error(error);

    // Never process.exit() here: this runs inside a serverless invocation, and
    // exiting kills the response before the caller can report what went wrong.
    // checkDBConnection turns this throw into a 503 and the next request retries.
    throw error;
  }
};

export const getDBStatus = (): boolean => {
  // Check actual mongoose connection state
  return mongoose.connection.readyState === 1;
};
