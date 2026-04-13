const { MongoClient } = require('mongodb');
const { configureMongoDns } = require('../../../shared/utils/configureMongoDns');

const connectToMongo = async ({ mongoUri, dbName }) => {
  configureMongoDns({ mongoUri });
  const client = await MongoClient.connect(mongoUri);
  return client.db(dbName);
};

module.exports = {
  connectToMongo
};
