const fetch = require('node-fetch')

const TOKENS = {
  economy: process.env.BOT_DYNO_ECONOMY_TOKEN,
  philosophy: process.env.BOT_DYNO_PHILOSOPHY_TOKEN,
  writing: process.env.BOT_DYNO_WRITING_TOKEN,
  photo: process.env.BOT_DYNO_PHOTO_TOKEN,
  notifications: process.env.BOT_DYNO_NOTIFICATIONS_TOKEN,
  dev: process.env.BOT_DYNO_DEV_TOKEN
}

function getTokenForTopic(topic){
  return TOKENS[topic]||null
}

async function sendMessage(topic, chatId, text){
  const token = getTokenForTopic(topic)
  if(!token) throw new Error('No token for topic '+topic)
  const url = `https://api.telegram.org/bot${token}/sendMessage`
  const res = await fetch(url, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:chatId,text,disable_web_page_preview:true})})
  return res.json()
}

module.exports = { getTokenForTopic, sendMessage }
