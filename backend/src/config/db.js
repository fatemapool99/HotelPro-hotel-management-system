const mongoose = require('mongoose');
let pendingConnection;
module.exports = async function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required.');
  if (!pendingConnection) {
    pendingConnection = mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 })
      .finally(() => { pendingConnection = undefined; });
  }
  return pendingConnection;
};
