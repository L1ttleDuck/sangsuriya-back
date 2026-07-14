import { Elysia } from 'elysia'
import { webhook } from '@line/bot-sdk'
import { lineClient } from '../services/line'

type Event = webhook.Event
type MessageEvent = webhook.MessageEvent
type TextMessageContent = webhook.TextMessageContent

export const webhookRoute = new Elysia()
  .post('/webhook', async ({ body, set }) => {
    let payload: { events?: Event[] }

    if (typeof body === 'string') {
      payload = JSON.parse(body)
    } else {
      payload = body as { events?: Event[] }
    }

    const events = payload.events
    if (!events || !Array.isArray(events)) {
      set.status = 200
      return { status: 'ok' }
    }

    console.log(`Received ${events.length} event(s)`)
    console.log('Raw body:', JSON.stringify(body).substring(0, 500))

    for (const event of events) {
      console.log('Event type:', event.type, 'Message type:', (event as any).message?.type, 'Text:', (event as any).message?.text)
      try {
        await handleEvent(event)
      } catch (err: any) {
        console.error('Event error:', err?.message || err)
        if (err?.body) console.error('Error body:', err.body)
        if (err?.status) console.error('Error status:', err.status)
      }
    }

    set.status = 200
    return { status: 'ok' }
  })

async function handleEvent(event: Event) {
  if (event.type !== 'message' || event.message.type !== 'text') return

  const msg = (event as MessageEvent).message as TextMessageContent
  const text = msg.text.trim()
  const replyToken = (event as MessageEvent).replyToken

  if (!replyToken) return

  if (text === 'ราคาทอง' || text.toLowerCase() === 'gold price') {
    await replyFlexCarousel(replyToken)
  } else if (text === 'ลงทะเบียน' || text.toLowerCase() === 'register') {
    await replyRegisterLink(replyToken)
  } else if (text === 'สลับ') {
    await toggleRichMenu(replyToken, event)
  } else if (text === 'ซื้อทอง') {
    await replyFlexBubble(replyToken)
  } else if (text === 'ผ่อนทอง') {
    await replyTemplateButtons(replyToken)
  } else if (text === 'ออมทอง') {
    await replyImagemap(replyToken)
  }
}

async function toggleRichMenu(replyToken: string, event: Event) {
  const msgEvent = event as MessageEvent
  const userId = msgEvent.source?.userId

  if (!userId) {
    await lineClient.replyMessage({
      replyToken,
      messages: [{ type: 'text', text: 'ไม่สามารถสลับเมนูได้: ไม่พบ userId' }],
    })
    return
  }

  const defaultMenuId = process.env.RICH_MENU_ID_DEFAULT
  const memberMenuId = process.env.RICH_MENU_ID_MEMBER

  if (!defaultMenuId || !memberMenuId) {
    await lineClient.replyMessage({
      replyToken,
      messages: [{ type: 'text', text: 'ยังไม่ได้ตั้งค่า Rich Menu ID' }],
    })
    return
  }

  let currentMenuId: string | undefined
  try {
    const res = await lineClient.getRichMenuIdOfUser(userId)
    currentMenuId = res.richMenuId
  } catch {
    console.error('Failed to get current rich menu')
  }

  let targetMenuId: string
  let menuName: string

  if (currentMenuId === memberMenuId) {
    targetMenuId = defaultMenuId
    menuName = 'เมนูทั่วไป'
  } else {
    targetMenuId = memberMenuId
    menuName = 'เมนูสมาชิก'
  }

  try {
    await lineClient.linkRichMenuIdToUser(userId, targetMenuId)
    await lineClient.replyMessage({
      replyToken,
      messages: [{ type: 'text', text: `สลับเป็น${menuName}แล้ว` }],
    })
  } catch (err) {
    console.error('Failed to switch rich menu:', err)
    await lineClient.replyMessage({
      replyToken,
      messages: [{ type: 'text', text: 'สลับเมนูไม่สำเร็จ' }],
    })
  }
}

async function replyFlexBubble(replyToken: string) {
  await lineClient.replyMessage({
    replyToken,
    messages: [
      {
        type: 'flex',
        altText: 'ซื้อทอง - ร้านทอง แสงสุริยา',
        contents: {
          type: 'bubble',
          size: 'kilo',
          header: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: 'ร้านทอง แสงสุริยา',
                weight: 'bold',
                size: 'xl',
                color: '#D4AF37',
              },
              {
                type: 'text',
                text: 'สั่งซื้อทองคำ',
                size: 'sm',
                color: '#888888',
                margin: 'sm',
              },
            ],
            backgroundColor: '#1a1a2e',
            paddingAll: '20px',
          },
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'text',
                    text: 'ทองคำแท่ง 96.5%',
                    size: 'md',
                    flex: 4,
                  },
                  {
                    type: 'text',
                    text: '46,900 บ.',
                    size: 'md',
                    weight: 'bold',
                    color: '#D4AF37',
                    align: 'end',
                    flex: 6,
                  },
                ],
              },
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'text',
                    text: 'ทองคำแท่ง 99.99%',
                    size: 'md',
                    flex: 4,
                  },
                  {
                    type: 'text',
                    text: '48,500 บ.',
                    size: 'md',
                    weight: 'bold',
                    color: '#D4AF37',
                    align: 'end',
                    flex: 6,
                  },
                ],
                margin: 'md',
              },
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'text',
                    text: 'ทองรูปพรรณ',
                    size: 'md',
                    flex: 4,
                  },
                  {
                    type: 'text',
                    text: '43,500 บ.',
                    size: 'md',
                    weight: 'bold',
                    color: '#D4AF37',
                    align: 'end',
                    flex: 6,
                  },
                ],
                margin: 'md',
              },
              {
                type: 'separator',
                margin: 'xl',
              },
              {
                type: 'text',
                text: 'เลือกประเภททองคำที่ต้องการสั่งซื้อ',
                size: 'xs',
                color: '#888888',
                margin: 'md',
              },
            ],
          },
          footer: {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'button',
                action: {
                  type: 'message',
                  label: 'ทองแท่ง',
                  text: 'สั่งซื้อ ทองแท่ง',
                },
                style: 'primary',
                color: '#D4AF37',
              },
              {
                type: 'button',
                action: {
                  type: 'message',
                  label: 'รูปพรรณ',
                  text: 'สั่งซื้อ รูปพรรณ',
                },
                style: 'secondary',
              },
            ],
          },
        },
      },
    ],
  })
}

async function replyFlexCarousel(replyToken: string) {
  const makeCard = (title: string, sellPrice: string, buyPrice: string): any => ({
    type: 'bubble',
    size: 'micro',
    header: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: title,
          weight: 'bold',
          size: 'md',
          color: '#D4AF37',
        },
      ],
      backgroundColor: '#1a1a2e',
      paddingAll: '12px',
    },
    body: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'text',
              text: 'ขาย',
              size: 'xs',
              color: '#888888',
              flex: 4,
            },
            {
              type: 'text',
              text: sellPrice,
              size: 'md',
              weight: 'bold',
              color: '#D4AF37',
              align: 'end',
              flex: 6,
            },
          ],
        },
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'text',
              text: 'รับซื้อ',
              size: 'xs',
              color: '#888888',
              flex: 4,
            },
            {
              type: 'text',
              text: buyPrice,
              size: 'sm',
              color: '#666666',
              align: 'end',
              flex: 6,
            },
          ],
          margin: 'sm',
        },
      ],
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'button',
          action: {
            type: 'message',
            label: 'สนใจ',
            text: `สนใจ ${title}`,
          },
          style: 'primary',
          color: '#D4AF37',
          height: 'sm',
        },
      ],
    },
  })

  await lineClient.replyMessage({
    replyToken,
    messages: [
      {
        type: 'flex',
        altText: 'ราคาทองวันนี้ - ร้านทอง แสงสุริยา',
        contents: {
          type: 'carousel',
          contents: [
            makeCard('ทองแท่ง 96.5%', '46,900', '45,900'),
            makeCard('ทองแท่ง 99.99%', '48,500', '47,500'),
            makeCard('ทองรูปพรรณ', '43,500', '41,500'),
          ],
        },
      },
    ],
  })
}

async function replyTemplateButtons(replyToken: string) {
  await lineClient.replyMessage({
    replyToken,
    messages: [
      {
        type: 'template',
        altText: 'ผ่อนทอง - เลือกแผนผ่อนชำระ',
        template: {
          type: 'buttons',
          thumbnailImageUrl: `${process.env.PUBLIC_API_BASE_URL || 'http://localhost:5001'}/static/gold-price.png`,
          imageAspectRatio: 'rectangle',
          imageSize: 'cover',
          title: 'แผนผ่อนทองคำ',
          text: 'เลือกแผนผ่อนชำระที่เหมาะสม',
          actions: [
            {
              type: 'message',
              label: 'ผ่อน 3 เดือน',
              text: 'เลือกผ่อน 3 เดือน',
            },
            {
              type: 'message',
              label: 'ผ่อน 6 เดือน',
              text: 'เลือกผ่อน 6 เดือน',
            },
            {
              type: 'message',
              label: 'ผ่อน 12 เดือน',
              text: 'เลือกผ่อน 12 เดือน',
            },
            {
              type: 'uri',
              label: 'ดูรายละเอียดเพิ่มเติม',
              uri: process.env.LIFF_REGISTER_URL || 'https://liff.line.me/your-liff-id',
            },
          ],
        },
      },
    ],
  })
}

async function replyImagemap(replyToken: string) {
  const baseUrl = process.env.PUBLIC_API_BASE_URL || 'http://localhost:5001'

  await lineClient.replyMessage({
    replyToken,
    messages: [
      {
        type: 'imagemap',
        baseUrl: `${baseUrl}/static/gold-price`,
        altText: 'ออมทอง - คลิกเพื่อเลือกแผนออมทอง',
        baseSize: {
          width: 1040,
          height: 1040,
        },
        actions: [
          {
            type: 'message',
            text: 'ออมทอง 10 กรัม',
            area: {
              x: 0,
              y: 0,
              width: 520,
              height: 520,
            },
          },
          {
            type: 'message',
            text: 'ออมทอง 50 กรัม',
            area: {
              x: 520,
              y: 0,
              width: 520,
              height: 520,
            },
          },
          {
            type: 'message',
            text: 'ออมทอง 100 กรัม',
            area: {
              x: 0,
              y: 520,
              width: 520,
              height: 520,
            },
          },
          {
            type: 'uri',
            linkUri: process.env.LIFF_REGISTER_URL || 'https://liff.line.me/your-liff-id',
            area: {
              x: 520,
              y: 520,
              width: 520,
              height: 520,
            },
          },
        ],
      },
    ],
  })
}

async function replyRegisterLink(replyToken: string) {
  const liffUrl = process.env.LIFF_REGISTER_URL || 'https://liff.line.me/your-liff-id/register'

  await lineClient.replyMessage({
    replyToken,
    messages: [
      {
        type: 'text',
        text: 'กรุณาลงทะเบียนเพื่อใช้งานบริการ\nคลิกลิงก์ด้านล่างเพื่อไปหน้าลงทะเบียน',
      },
      {
        type: 'template',
        altText: 'ลงทะเบียน - ร้านทอง แสงสุริยา',
        template: {
          type: 'buttons',
          text: 'ลงทะเบียนสมาชิก',
          actions: [
            {
              type: 'uri',
              label: 'ไปหน้าลงทะเบียน',
              uri: liffUrl,
            },
          ],
        },
      },
    ],
  })
}
