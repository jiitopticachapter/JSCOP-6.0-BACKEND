const mongoose = require('mongoose');
const uuid4 = require('uuid4');
const schema = mongoose.Schema;

const qrCodeSchema = new schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',

    },

    qr_id: {
        type: String,
        default: uuid4(),
        required: true,
        unique: true,
    },

    redeemed_count: {
        type: Number,
        default: 0,
    },
    reedeemed_timestamp: {
        type: Date,
        default: null,
    },

});


module.exports = mongoose.model('QrCode', qrCodeSchema);