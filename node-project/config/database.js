import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config(); // Carrega as variáveis de ambiente do arquivo .env

// Conecta ao banco de dados MongoDB usando a variável de ambiente MONGO_URI
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log('Database:', mongoose.connection.db.databaseName);
    console.log('Host:', mongoose.connection.host);
    console.log('MongoDB conectado com sucesso!');
  } catch (err) {
    console.error('Erro ao conectar ao MongoDB:', err.message);
    process.exit(1);
  }
};

export default connectDB;