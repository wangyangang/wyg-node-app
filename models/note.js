const mongoose = require('mongoose')
mongoose.set('strictQuery', true)

const url = process.env.MONGODB_URI
console.log(`connecting to ${url}`);

mongoose.connect(url)
    .then(() => {
        console.log('connected to mongodb');

    }).catch(error => {
        console.log('error connecting to mongodb:', error);

    })

const noteSchema = new mongoose.Schema({
    content: String,
    important: Boolean
})

noteSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Note', noteSchema)
