import { Elysia } from 'elysia'
import { lineClient } from '../services/line'

export const registerRoute = new Elysia()
  .post('/api/register', async ({ body, set }) => {
    let parsed: any
    if (typeof body === 'string') {
      parsed = JSON.parse(body)
    } else {
      parsed = body
    }

    const { userId, firstName, lastName, phone, lineId, address } = parsed as {
      userId: string
      firstName: string
      lastName: string
      phone: string
      lineId?: string
      address?: string
    }

    if (!userId || !firstName || !lastName || !phone) {
      set.status = 400
      return { error: 'Missing required fields' }
    }

    console.log(`Registering user: ${userId} - ${firstName} ${lastName}`)

    const richMenuId = process.env.RICH_MENU_ID_MEMBER
    if (richMenuId) {
      try {
        await lineClient.linkRichMenuIdToUser(userId, richMenuId)
        console.log(`Linked rich menu ${richMenuId} to user ${userId}`)
      } catch (err) {
        console.error('Failed to link rich menu:', err)
      }
    } else {
      console.warn('RICH_MENU_ID_MEMBER not set, skipping rich menu switch')
    }

    set.status = 200
    return { status: 'ok', message: 'Register successful' }
  })
