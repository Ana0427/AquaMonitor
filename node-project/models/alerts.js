import mongoose from "mongoose";

const alertsSchema = new mongoose.Schema({
/*     deviceID: { type: String, required: true }, */
    timestamp: { type: Date, default: Date.now },
    alertType: { type: String, required: true },
    message: { type: String, required: true },
    value: { type: Number },
    endTime: { type: Date },
    duration: { type: Number }, // duração em minutos
    isResolved: { type: Boolean, default: false },
});

const Alert = mongoose.model('Alert', alertsSchema);

export default Alert;