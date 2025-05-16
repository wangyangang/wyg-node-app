require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const mongoose = require('mongoose')

const url = process.env.MONGODB_URI
console.log('url', url);

mongoose.set('strictQuery', false)

mongoose.connect(url)

const noteSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        minLength: 5
    },
    important: Boolean,
})
noteSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})
const Note = mongoose.model('Note', noteSchema)

const app = express()
app.use(express.json())
app.use(express.static('dist'))

morgan.token('data', function (req, res) { return JSON.stringify(req.body) })

const m = morgan(':method :url :status :res[content-length] - :response-time ms :data')
app.use(m)

// middleware
const requestLogger = (req, res, next) => {
    // console.log(req.method, req.path, req.body);
    next()
}
app.use(requestLogger)

const cors = require('cors')
app.use(cors())

let notes = [
    {
        id: 1,
        content: "HTML is easy",
        date: "2022-05-30T17:30:31.098Z",
        important: true
    },
    {
        id: 2,
        content: "Browser can execute only Javascript",
        date: "2022-05-30T18:39:34.091Z",
        important: false
    },
    {
        id: 3,
        content: "GET and POST are the most important methods of HTTP protocol",
        date: "2022-05-30T19:20:14.298Z",
        important: true
    }
]
app.get('/', (request, response) => {
    response.send('<h1>Hello, World</h1>')
})

app.get('/api/notes', (request, response) => {
    Note.find({}).then(data => {
        response.json(data)
    })
})

app.get('/api/notes/:id', (request, response, next) => {
    Note.findById(request.params.id).then(note => {
        if (note) {
            response.json(note)
        } else {
            response.status(404).end()
        }
    })
        .catch(error => {
            next(error)
        })
})

app.post('/api/notes', (request, response, next) => {
    const body = request.body

    const note = new Note({
        content: body.content,
        important: body.important || false,
    })
    note.save()
        .then(data => {
            response.json(data)
        })
        .catch(error => {
            next(error)
        })
})
app.delete('/api/notes/:id', (request, response) => {
    const id = Number(request.params.id)
    notes = notes.filter(n => n.id !== id)
    response.status(204).end()
})
app.put('/api/notes/:id', (req, res, next) => {
    const body = req.body
    const note = {
        content: body.content,
        important: body.important,
    }
    Note.findByIdAndUpdate(req.params.id, note, { new: true, runValidators: true, context: 'query' })
        .then(data => {
            res.json(data)
        })
        .catch(error => {
            next(error)
        })
})
let persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]
const peopleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minLength: 3,
    },
    number: {
        type: String,
        required: [true, '手机号码必填'],
        validate: {
            validator: function(v) {
                return /\d+-\d+/.test(v)
            },
            message: props => `${props.value} 不是有效的手机号`
        }
    },
})
peopleSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})
const People = mongoose.model('People', peopleSchema)
app.get('/api/persons', (req, res) => {
    People.find({}).then(data => {
        res.json(data)
    })
})

app.get('/info', (req, res) => {
    const msg = `Phonebook has info for ${persons.length} people
${new Date()}`
    res.header("Content-Type", "text/plain").end(msg)
})

app.get('/api/persons/:id', (req, res, next) => {
    People.findById(req.params.id).then(person => {
        if (person) {
            return res.json(person)
        } else {
            res.status(404).json({
                message: 'person not found'
            })
        }
    })
        .catch(error => {
            next(error)
        })
})
app.post('/api/persons', (req, res, next) => {
    const body = req.body

    const person = new People({
        name: body.name,
        number: body.number,
    })
    person.save().then(data => {
        res.json(data)
    })
    .catch(error => {
        next(error)
    })
})
app.delete('/api/persons/:id', (req, res, next) => {
    People.findByIdAndDelete(req.params.id)
        .then(data => {
            res.status(204).end()
        })
        .catch(error => {
            next(error)
        })
})
app.put('/api/persons/:id', (req, res, error) => {
    const body = req.body
    const person = {
        name: body.name,
        number: body.number,
    }
    People.findByIdAndUpdate(req.params.id, person, { new: true, runValidators: true, context: 'query' })
        .then(data => {
            res.json(data)
        })
        .catch(error => {
            next(error)
        })
})
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
    // console.log(error);
    if (error.name === 'CastError') {
        return res.status(400).send({ error: 'id 错误' })
    } else if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message })
    }
    next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
