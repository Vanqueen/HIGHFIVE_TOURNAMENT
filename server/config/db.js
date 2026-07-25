import mongoose from 'mongoose';
import { ServerApiVersion } from 'mongodb';

const connectDB = async () => {
  const uri = process.env.DATABASE_URL || process.env.MONGO_URI;
  if (!uri) {
    console.warn('⚠️ DATABASE_URL/MONGO_URI non défini, la connexion MongoDB est ignorée.');
    return;
  }

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, {
      serverApi: ServerApiVersion.v1,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connecté à MongoDB avec succès');
  } catch (error) {
    console.error('❌ Erreur de connexion à MongoDB :', error);
    process.exit(1);
  }
};

export default connectDB;
