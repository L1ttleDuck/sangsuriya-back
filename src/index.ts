import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { staticPlugin } from '@elysiajs/static'
import { file } from 'bun'
import { webhookRoute } from './routes/webhook'
import { registerRoute } from './routes/register'

const app = new Elysia()
  .use(cors())
  .onAfterHandle(({ set }) => {
    set.headers['ngrok-skip-browser-warning'] = 'true'
  })
  .get('/health', () => ({ status: 'ok' }))
  .use(webhookRoute)
  .use(registerRoute)
  .use(staticPlugin({ assets: 'public', prefix: '/static' }))
  .onRequest(({ request }) => {
    const url = new URL(request.url)
    const match = url.pathname.match(/^\/imagemap\/gold-price(?:-v\d+)?\/(\d+)$/)
    if (!match) return
    const validWidths = ['240', '300', '460', '700', '1040']
    const width = match[1]
    if (!validWidths.includes(width)) {
      return new Response('Not found', { status: 404 })
    }
    const f = Bun.file(`${import.meta.dir}/../public/gold-price/${width}.png`)
    return new Response(f, { headers: { 'content-type': 'image/png' } })
  })
  .listen(5001)

console.log(`Backend running on http://localhost:5001`)
