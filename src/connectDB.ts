import mongoose from 'mongoose';

let isDBConnected = false;

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const connectDB = async (dbUrl: string): Promise<void> => {
  // Check if already connected
  if (isDBConnected && mongoose.connection.readyState === 1) {
    console.info('✅ Already connected to database');
    return;
  }

  let lastError: any;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.info(`🔄 Database connection attempt ${attempt}/${MAX_RETRIES}...`);

      // Log connection URL (masked for security)
      const urlDomain = dbUrl.match(/@([^/]+)/)?.[1] || 'unknown';
      console.info(`📍 Connecting to cluster: ${urlDomain}`);

      await mongoose.connect(dbUrl, {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 30000,
        retryWrites: true,
        maxPoolSize: 10,
      });

      isDBConnected = true;
      console.info('✅ Database connection established successfully');
      return;
    } catch (error: any) {
      lastError = error;
      console.error(
        `❌ Connection attempt ${attempt} failed: ${error.message}`
      );

      if (attempt < MAX_RETRIES) {
        console.info(`⏳ Retrying in ${RETRY_DELAY / 1000} seconds...`);
        await sleep(RETRY_DELAY);
      }
    }
  }

  isDBConnected = false;
  console.error('❌ Failed to connect to database after all retries');
  console.error(`Error: ${lastError?.message}`);
  console.error(`Error Code: ${lastError?.code}`);

  // Don't throw - let server start anyway so we can serve /health endpoint
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    isDBConnected = false;
    console.info('✅ Database disconnected successfully');
  } catch (error) {
    console.error('❌ Failed to disconnect from database');
    console.error(error);
    throw error;
  }
};

export const getDBStatus = (): boolean => {
  // Check actual mongoose connection state
  const mongooseConnected = mongoose.connection.readyState === 1;
  return mongooseConnected;
};

export const setDBStatus = (status: boolean): void => {
  isDBConnected = status;
};
