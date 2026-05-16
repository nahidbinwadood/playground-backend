import mongoose from 'mongoose';

let isDBConnected = false;

export const connectDB = async (dbUrl: string): Promise<void> => {
  try {
    console.info('🔄 Database connection initiated...');

    await mongoose.connect(dbUrl, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isDBConnected = true;
    console.info('✅ Database connection established successfully');
  } catch (error) {
    isDBConnected = false;
    console.error('❌ Failed to connect to database');
    console.error(error);
    throw error;
  }
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

export const getDBStatus = (): boolean => isDBConnected;

export const setDBStatus = (status: boolean): void => {
  isDBConnected = status;
};
