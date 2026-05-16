import mongoose from 'mongoose';

export const connectDB = async (DB_URL: string): Promise<void> => {
  try {
    console.info('🔄 Database connection initiated...');
    await mongoose.connect(DB_URL);
    console.info('✅ Database connection established successfully');
  } catch (error) {
    console.error('❌ Failed to start the server');
    console.error(error);
    process.exit(1);
  }
};

export const getDBStatus = (): boolean => {
  // Check actual mongoose connection state
  return mongoose.connection.readyState === 1;
};
