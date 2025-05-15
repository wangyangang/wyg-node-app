const express = require('express')
const morgan = require('morgan')


const app = express()
app.use(express.json())

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
    response.json(notes)
})

app.get('/api/notes/:id', (request, response) => {
    const id = Number(request.params.id)
    const note = notes.find(n => n.id === id)
    if (note) {
        response.json(note)
    } else {
        response.status(404).end()
    }
})

app.post('/api/notes', (request, response) => {
    const body = request.body
    if (!body.content) {
        return response.status(400).json({
            error: 'content is missing'
        })
    }
    const maxId = notes.length === 0 ? 0 : Math.max(...notes.map(n => n.id))
    const note = {
        content: body.content,
        important: body.important || false,
        date: new Date(),
        id: maxId + 1
    }
    notes = notes.concat(note)

    response.json(note)
})
app.delete('/api/notes/:id', (request, response) => {
    const id = Number(request.params.id)
    notes = notes.filter(n => n.id !== id)
    response.status(204).end()
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

app.get('/api/persons', (req, res) => {
    res.json(persons)
})

app.get('/info', (req, res) => {
    const msg = `Phonebook has info for ${persons.length} people
${new Date()}`
    res.header("Content-Type", "text/plain").end(msg)
})

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(p => p.id === id)
    if (person) {
        return res.json(person)
    } else {
        res.status(404).json({
            message: 'person not found'
        })
    }
})
app.post('/api/persons', (req, res) => {
    console.log(req.path);

    const body = req.body
    if (!body.name || !body.number) {
        return res.status(400).json({
            error: "missing params"
        })
    }
    const findOne = persons.find(p => p.name === body.name)
    if (findOne) {
        return res.status(400).json({
            error: "name already exist"
        })
    }
    const id = Math.random() * 100000
    const person = {
        name: body.name,
        number: body.number,
        id
    }
    persons = persons.concat(person)
    res.json(person)
})
app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(p => p.id === id)
    if (!person) {
        return res.status(404).json({
            message: "person not found"
        })
    } else {
        persons = persons.filter(p => p.id !== id)
        res.status(204).json({
            message: "delete success."
        })
    }
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
