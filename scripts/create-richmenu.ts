import { LineBotClient } from '@line/bot-sdk'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || ''
const client = LineBotClient.fromChannelAccessToken({ channelAccessToken })

const defaultRichMenu: any = {
  size: { width: 2500, height: 1686 },
  selected: true,
  name: 'Rich Menu 1 (Default)',
  chatBarText: 'เมนู',
  areas: [
    {
      bounds: { x: 156, y: 777, width: 1076, height: 746 },
      action: { type: 'uri', uri: 'https://6396-223-205-216-182.ngrok-free.app/register' },
    },
    {
      bounds: { x: 1249, y: 781, width: 1060, height: 742 },
      action: { type: 'message', text: 'ราคาทอง' },
    },
  ],
}

const memberRichMenu: any = {
  size: { width: 2500, height: 1686 },
  selected: false,
  name: 'Rich Menu 2 (Member)',
  chatBarText: 'เมนูสมาชิก',
  areas: [
    {
      bounds: { x: 96, y: 841, width: 591, height: 704 },
      action: { type: 'message', text: 'ราคาทอง' },
    },
    {
      bounds: { x: 714, y: 846, width: 557, height: 704 },
      action: { type: 'message', text: 'ซื้อทอง' },
    },
    {
      bounds: { x: 1290, y: 840, width: 557, height: 704 },
      action: { type: 'message', text: 'ผ่อนทอง' },
    },
    {
      bounds: { x: 1862, y: 841, width: 544, height: 704 },
      action: { type: 'message', text: 'ออมทอง' },
    },
  ],
}

async function uploadImage(richMenuId: string, filename: string) {
  const imagePath = join(process.cwd(), 'public', filename)
  const image = readFileSync(imagePath)
  console.log(`  Uploading ${filename} (${image.length} bytes)...`)
  const blob = new Blob([image], { type: 'image/png' })
  await client.setRichMenuImage(richMenuId, blob)
  console.log('  Image uploaded')
}

async function main() {
  console.log('=== Creating Default Rich Menu ===')
  const defaultRes = await client.createRichMenu(defaultRichMenu)
  console.log(`Created: ${defaultRes.richMenuId}`)
  await uploadImage(defaultRes.richMenuId, 'richmenu-default.png')

  console.log('\n=== Setting as Default ===')
  await client.setDefaultRichMenu(defaultRes.richMenuId)
  console.log('Default rich menu set')

  console.log('\n=== Creating Member Rich Menu ===')
  const memberRes = await client.createRichMenu(memberRichMenu)
  console.log(`Created: ${memberRes.richMenuId}`)
  await uploadImage(memberRes.richMenuId, 'richmenu-member.png')

  console.log('\n=== Done ===')
  console.log(`Default Rich Menu ID: ${defaultRes.richMenuId}`)
  console.log(`Member Rich Menu ID: ${memberRes.richMenuId}`)
  console.log(`\nAdd to .env: RICH_MENU_ID_MEMBER=${memberRes.richMenuId}`)
}

main().catch(console.error)
