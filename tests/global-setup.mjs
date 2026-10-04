import { MongoMemoryServer } from 'mongodb-memory-server';

// One mongod for the whole run; each test file gets its own database (setup.mjs).
export default async function globalSetup({ provide }) {
  const mongod = await MongoMemoryServer.create();
  provide('mongoUri', mongod.getUri());

  return async () => {
    await mongod.stop();
  };
}
