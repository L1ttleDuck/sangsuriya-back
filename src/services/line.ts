import { LineBotClient } from '@line/bot-sdk'

const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || 'dummy-token-for-dev'

export const lineClient = LineBotClient.fromChannelAccessToken({
  channelAccessToken,
})
