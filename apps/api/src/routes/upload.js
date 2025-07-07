/**
 * File upload routes
 */
export default async function uploadRoutes(fastify, options) {
  // Upload image
  fastify.post('/image', async (request, reply) => {
    try {
      const data = await request.file()
      // TODO: Implement image upload logic
      return { success: true, message: 'Image uploaded' }
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ success: false, message: 'Upload failed' })
    }
  })

  // Upload multiple images
  fastify.post('/images', async (request, reply) => {
    try {
      const files = request.files()
      // TODO: Implement multiple image upload logic
      return { success: true, message: 'Images uploaded' }
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ success: false, message: 'Upload failed' })
    }
  })
}