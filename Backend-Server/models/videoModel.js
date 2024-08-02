const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const videoSchema = new Schema(
    {
        originalFileName: { 
            type: String, 
            required: true 
        },
        translatedFileName: { 
            type: String, 
            required: true 
        },
        videoPath: { 
            type: String, 
            required: true 
        },
        translationPath: { 
            type: String, 
            required: true 
        },
        email: { 
            type: String,
            required: true 
        },
        firstName: { 
            type: String, 
            required: true 
        },
        lastName: { 
            type: String, 
            required: true 
        },
        phoneNumber: { 
            type: String, 
            required: true 
        },
        createdAt: { 
            type: Date, 
            default: Date.now 
        }
    },
    {
        collection: 'NamasteVideoDataCollection'
    }
);

module.exports = mongoose.model('NamasteVideoDataCollection', videoSchema)