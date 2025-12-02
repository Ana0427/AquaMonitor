import mongoose from "mongoose";

const readingsSchema = new mongoose.Schema({
/*     deviceID: { type: String, required: true },
 */ timestamp: { type: Date, default: Date.now },
    flowRate: { type: Number, required: true },
    totalVolume: { type: Number, required: true },
});

const Reading = mongoose.model('Reading', readingsSchema);

export default Reading;