const mongoose = require('mongoose');
const { configureMongoDns } = require('../../../shared/utils/configureMongoDns');

const connectToMongo = ({ mongoUri, dbName }) => {
  configureMongoDns({ mongoUri });
  return mongoose.connect(mongoUri, { dbName });
};

module.exports = {
  connectToMongo,
  mongoose
};
