const mongoose = require("mongoose");

const numerologySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
    lat: {
        type: Number,
        required: true,
    },
    lon: {
        type: Number,
        required: true,
    },
    tz: {
        type: Number,
        required: true,
    },
    lang: {
        type: String,
        required: true,
    },
    style: {
        type: String,
        required: true,
    },
    place: {
        type: String,
        required: true,
    },
    company_name: {
        type: String,
        required: true,
    },
    company_address: {
        type: String,
        required: true,
    },
    company_email: {
        type: String,
        required: true,
    },
    company_phone: {
        type: String,
        required: true,
    },
    company_website: {
        type: String,
        required: true,
    },
    pdf_type: {
        type: String,
        required: true,
    },
    pdfUrl: {
        type: String,
        required: false,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    // phone: { type: String },
    // vehicle: { type: String },
    // gender: { type: String },
}, { timestamps: true });

const Numerology = mongoose.model("numerology", numerologySchema);

module.exports = Numerology;
