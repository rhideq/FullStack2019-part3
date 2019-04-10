if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const app = express()
const Person = require('./models/person')

app.use(express.static('build'))
app.use(bodyParser.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body_on_post'))

morgan.token('body_on_post', (req) => {
  return req.method === 'POST' ? JSON.stringify(req.body) : null
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons.map(person => person.toJSON()))
  })
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person => {
    response.json(person.toJSON())
  })
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (body.name === '' || body.number === '') {
    return response.status(400).json({ error: 'give a name and a number' })
  }

  /*Person.find({}).then(result => {
    if (result.map(person => person.name).includes(body.name) === true) {
      console.log("true")
      return response.send({ error: "give an unique name"})
    }
  })*/

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save().then(savedPerson => {
    response.json(savedPerson.toJSON())
  })
    .catch(error => next(error))
})

app.get('/info', (request, response) => {
  Person.find({}).then(result => {
    response.send(`Puhelinluettelossa ${result.length} henkilön tiedot <br> ${new Date()}`)
  })
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person ={
    number: body.number,
  }
  Person.findByIdAndUpdate(request.params.id, person, { new: true })

    .then(updatedPerson => {
      response.json(updatedPerson.toJSON)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
