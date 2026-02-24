import z from 'zod'

const movieSchema = z.object({
  title: z.string({ invalid_type: 'Es necesario que la variable sea un string' }).min(5).max(700),
  year: z.int(),
  duration: z.int(),
  poster: z.string(),
  genre: z.string(),
  rate: z.int().positive(),
  director: z.string()
})

export function validateMovie (object) {
  console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
  return movieSchema.safeParse(object)
}

export function validateMoviePartial (object) {
  return movieSchema.partial().safeParse(object)
}
