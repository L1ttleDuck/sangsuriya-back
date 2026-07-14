import { LineBotClient } from '@line/bot-sdk'
import { readFileSync, writeFileSync } from 'node:fs'
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
      action: { type: 'uri', uri: process.env.LIFF_REGISTER_URL || 'https://liff.line.me/2010700498-S81OqCge' },
    },
    {
      bounds: { x: 1249, y: 781, width: 1060, height: 742 },
      action: { type: 'message', text: 'ราคาทองวันนี้' },
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

async function deleteAllRichMenus() {
  const list = await client.getRichMenuList()
  if (!list.richmenus || list.richmenus.length === 0) {
    console.log('No existing rich menus to delete')
    return
  }
  for (const menu of list.richmenus) {
    console.log(`  Deleting ${menu.richMenuId} (${menu.name})...`)
    await client.deleteRichMenu(menu.richMenuId)
  }
  console.log(`Deleted ${list.richmenus.length} old rich menu(s)`)
}

function updateEnv(defaultId: string, memberId: string) {
  const envPath = join(process.cwd(), '.env')
  let env = readFileSync(envPath, 'utf-8')
  env = env.replace(/RICH_MENU_ID_DEFAULT=.*/, `RICH_MENU_ID_DEFAULT=${defaultId}`)
  env = env.replace(/RICH_MENU_ID_MEMBER=.*/, `RICH_MENU_ID_MEMBER=${memberId}`)
  writeFileSync(envPath, env)
  console.log('.env updated automatically')
}

async function main() {
  console.log('=== Cleaning up old rich menus ===')
  await deleteAllRichMenus()

  console.log('\n=== Creating Default Rich Menu ===')
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

  console.log('\n=== Updating .env ===')
  updateEnv(defaultRes.richMenuId, memberRes.richMenuId)

  console.log('\n=== Done ===')
  console.log(`Default: ${defaultRes.richMenuId}`)
  console.log(`Member:  ${memberRes.richMenuId}`)
}

main().catch(console.error)
