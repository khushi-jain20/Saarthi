const mongoose = require('mongoose');

// NEW: A reusable sub-schema to store location information properly.
const locationSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true,
    },
    coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
    }
}, { _id: false }); // _id: false prevents Mongoose from creating an id for the sub-document

const rideSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    captain: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'captain',
    },

    // CHANGED: Replaced simple strings with the new location schema
    pickupLocation: locationSchema,
    destinationLocation: locationSchema,
    
    // This field is for the vehicle type requested by the user
    vehicleType: {
        type: String,
        required: true,
        enum: ['auto', 'go', 'moto']
    },

    finalFare: {
        type: Number,
        required: true,
    },
    fareDetails: {
        type: Object, // Stores the full object { go: 94, moto: 43, ... }
        required: true
    },

    status: {
        type: String,
        // CHANGED: Added 'requested' as the initial state
        enum: [ 'requested', 'accepted', "ongoing", 'completed', 'cancelled' ],
        default: 'requested',
    },

    // These fields are fine, no changes needed
    duration: { type: String }, // Can be string like "25 mins"
    distance: { type: String }, // Can be string like "10 km"
    paymentID: { type: String },
    orderId: { type: String },
    signature: { type: String },

    otp: {
        type: String,
        select: false,
        required: true,
    },
}, { timestamps: true }); // Added timestamps for createdAt/updatedAt

module.exports = mongoose.model('ride', rideSchema);