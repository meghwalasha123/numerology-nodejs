const mongoose = require("mongoose");

const numerologySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    birthDate: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    vehicle: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
    },
}, { timestamps: true });

const Numerology = mongoose.model("numerology", numerologySchema);

module.exports = Numerology;
