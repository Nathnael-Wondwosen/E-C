const { MongoClient } = require('mongodb');

const connectToMongo = async ({ mongoUri, dbName }) => {
  const client = await MongoClient.connect(mongoUri);
  return client.db(dbName);
};

module.exports = {
  connectToMongo
};
