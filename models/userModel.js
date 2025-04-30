const mongoose = require('mongoose');
const schema = mongoose.Schema;


const userSchema = new schema({
    name: {
        type: String,
        required: [true, 'Pass a Name'],
        min: 6,
    },

    email: { 
        type: String,
        required: [true, 'Pass an Email'],
        unique: true,
        min: 6,
        max: 255,

    },
    
    phoneNo: {
        type: Number,
        required: true,
        min: 10,
    },
    college: {
        type: String,
        required: true,
    },
    batch: {
        type: String,
        required: function () {
            return this.college === "JIIT-62" || this.college === "JIIT-128";
        },
        default: "NA",
    },

    enrollmentNo: {
        type: String,
        required: function () {
            return this.college === "JIIT-62" || this.college === "JIIT-128";
        },
        default: "NA",
    },
    branch: {
        type: String,
        required: function () {
            return this.college === "JIIT-62" || this.college === "JIIT-128";
        },
        default: "NA",
    },

    verified: {
        type: Boolean,
        default: false,
    },
    selectedDay: {
        type: String,
        required: true,
        enum: ['day1', 'day2', 'both'],
    },
    enrollmentType: {
       type: String,
       required: function () {
        return this.college === "JIIT-62" || this.college === "JIIT-128";
    },
       default: "NA"
    },
    payment: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true
        }
    }

});


module.exports = mongoose.model('User', userSchema);