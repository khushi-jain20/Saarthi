const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Switched to bcryptjs for consistency
const jwt = require('jsonwebtoken');

const captainSchema = new mongoose.Schema({
    fullname: {
        firstname: {
            type: String,
            required: true,
            minlength: [3, 'Firstname must be at least 3 characters long'],
        },
        lastname: {
            type: String,
            minlength: [3, 'Lastname must be at least 3 characters long'],
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    socketId: {
        type: String,
        default: null, // Good practice to have a default
    },

    // FIX #1: Changed 'status' to 'isAvailable' for clarity and added a default
    isAvailable: {
        type: Boolean,
        default: false,
    },

    vehicle: {
        color: { type: String, required: true, minlength: [3, 'Color must be at least 3 characters long'] },
        plate: { type: String, required: true, minlength: [3, 'Plate must be at least 3 characters long'] },
        capacity: { type: Number, required: true, min: [1, 'Capacity must be at least 1'] },
        vehicleType: { type: String, required: true, enum: ['car', 'motorcycle', 'auto'] }
    },

    // FIX #2: Changed the location schema to the official GeoJSON Point format
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // This will store [longitude, latitude]
            default: [0, 0]
        }
    }
}, { timestamps: true }); // Added timestamps for createdAt/updatedAt

// FIX #3: Create the special index for location queries
captainSchema.index({ location: '2dsphere' });


captainSchema.methods.generateAuthToken = function () {
    // FIX #4: Use 'id' in the token payload for consistency with the rest of the app
    const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    return token;
};

captainSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

captainSchema.statics.hashPassword = async function (password) {
    return await bcrypt.hash(password, 10);
};

const captainModel = mongoose.model('captain', captainSchema);

module.exports = captainModel;