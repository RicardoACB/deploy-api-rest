import express from 'express'
import fs from 'node:fs/promises'
import crypto from 'node:crypto'
import cors from 'cors'
import path from 'node:path'
import { validateMovie, validateMoviePartial } from './schemas/movies.mjs'
const allMovies = path.join(process.cwd(), 'movies.json')

/* import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const movies = require('allMovies.json') */

const movies = JSON.parse(await fs.readFile(allMovies, 'utf8'))

const PORT = process.env.PORT ?? 1234
const app = express()

app.disable('x-powered-by')

// Se pasa al objeto global de respuesta la cabecera Access-Control-Allow-Origin

app.use(express.json())

app.use(cors({
  origin: (origin, callback) => {
    const ACCEPTED_ORIGINS = [
      'http://127.0.0.1:1234/movies',
      'http://127.0.0.1:5500',
      'https://deploy-api-rest-taupe.vercel.app/'
    ]

    if (!origin) callback(null, true)
    if (ACCEPTED_ORIGINS.includes(origin)) return callback(null, true)

    return callback(new Error('Hubo un error de CORS'))
  },
  methods: ['DELETE'],
  allowedHeaders: ['Content-Type']
}))

app.delete('/movies/:id', (req, res) => {
  console.log(movies.length)
  const { id } = req.params
  if (!id) return res.status(404).json({ error: 'Flato pasar algun parametro' })
  const indexID = movies.findIndex(mov => mov.id === id)
  if (indexID === -1) return res.status(404).json({ error: 'No se encontro el ID del elemento' })
  movies.splice(indexID, 1)
  console.log(movies.length)
  res.status(200).json(movies)
})

app.get('/movies', async (req, res, next) => {
  const { genre } = req.query

  if (!genre) return next()

  const data = JSON.parse(await fs.readFile('allMovies.json', 'utf8'))

  const selectedMovies = data.filter(mov => mov.genre.some(m => m.toLowerCase() === genre.toLowerCase()))
  if (selectedMovies) {
    return res.status(200).json(selectedMovies)
  }
  res.status(404).send('<h1>ERROR 404</h1>')
})

// GET principal

app.get('/movies', async (req, res) => {
  const movies = JSON.parse(await fs.readFile('allMovies.json', 'utf8'))
  res.status(200).json(movies)
})

app.post('/movies', async (req, res) => {
  const result = validateMovie(req.body)

  if (result.error) {
    return res.status(400).send(result.error.message)
  }

  const movie = {
    id: crypto.randomUUID(),
    ...result.data
  }

  res.status(201).json(movie)
})

app.patch('/movies/:id', async (req, res) => {
  console.log('Aqui andamos')
  const { id } = req.params
  const result = validateMoviePartial(req.body)

  if (result.error) {
    return res.status(400).json({ error: result.error.message })
  }

  const movies = JSON.parse(await fs.readFile('allMovies.json', 'utf8'))
  const movieIndex = movies.findIndex(mov => mov.id === id)

  if (movieIndex === -1) return res.status(404).json({ error: 'Recurso no encotradooooo' })

  const newMovie = {
    ...movies[movieIndex],
    ...result.data
  }

  res.status(201).json(newMovie)
})

app.get('/movies/:id', async (req, res, next) => {
  const { id } = req.params
  if (!id) {
    res.status(404).send('{}')
    next()
  }
  const data = JSON.parse(await fs.readFile('allMovies.json'))
  const pelicula = data.find(movie => movie.id === id)
  if (pelicula) {
    return res.status(200).json(pelicula)
  }
  res.status(404).send('{}')
})

app.get('/movies', (req, res, next) => {
  res.status(200).send(movies)
})

app.options('/movies/:id', (req, res) => {
  res.header('Access-Control-Allow-Methods', 'DELETE')
  res.status(200).send('Se permite')
})

app.use((req, res) => {
  res.status(404).json({ error: 'Recurso no encontrado 1' })
})

const server = app.listen(PORT, () => {
  console.log(`El server se abrio exitosamente en el puerto ${server.address().port}`)
})

process.on('SIGINT', () => {
  console.log(`Se empiezarà a cerra el servidor en el puerto ${1234}`)
  server.close(() => {
    console.log('El servidor se cerro exitosamente, tenga un buen dia')
  })
})
