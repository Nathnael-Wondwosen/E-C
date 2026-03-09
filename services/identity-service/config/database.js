const mongoose = require('mongoose');

const connectToMongo = ({ mongoUri, dbName }) =>
  mongoose.connect(mongoUri, { dbName });

module.exports = {
  connectToMongo,
  mongoose
};
