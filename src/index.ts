import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { staticPlugin } from '@elysiajs/static'
import { webhookRoute } from './routes/webhook'
import { registerRoute } from './routes/register'

const app = new Elysia()
  .use(cors())
  .get('/health', () => ({ status: 'ok' }))
  .use(webhookRoute)
  .use(registerRoute)
  .use(staticPlugin({ assets: 'public', prefix: '/static' }))
  .listen(5001)

console.log(`Backend running on http://localhost:5001`)
