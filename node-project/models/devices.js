/* import mongoose from "mongoose";

// Define o schema para o modelo Device
const deviceSchema = new mongoose.Schema({
    deviceID: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    location: { type: String },
    createdDate: { type: Date, default: Date.now },
    status: { type: String, required: true },
    lastActive: { type: Date, default: Date.now },
});

// Cria o modelo Device com base no schema definido
const Device = mongoose.model('Device', deviceSchema);
// Exporta o modelo para uso em outras partes da aplicação
export default Device; */