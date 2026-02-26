import { buffer } from 'micro'
import admin from 'firebase-admin'
import { getTokenForTopic, sendMessage } from '../../../lib/multiBot'

export const config = { api: { bodyParser: false } }

if(!admin.apps.length){
  try{
    const key = process.env.GCP_SERVICE_KEY_JSON
    if(key){
      const cred = JSON.parse(key)
      admin.initializeApp({credential: admin.credential.cert(cred)})
    }
  }catch(e){
    // no-op
  }
}

export default async function handler(req,res){
  const { topic } = req.query
  if(req.method !== 'POST') return res.status(405).end()
  try{
    const buf = await buffer(req)
    const body = JSON.parse(buf.toString('utf8'))
    // basic structure from Telegram update
    const chatId = body.message?.chat?.id || body.callback_query?.message?.chat?.id
    const text = body.message?.text || body.callback_query?.data || ''

    // Log to Firestore if available
    try{
      if(admin.apps.length){
        const db = admin.firestore()
        await db.collection('chat_logs').add({topic,source:'telegram',raw:body, text, chatId, createdAt: admin.firestore.FieldValue.serverTimestamp()})
      }
    }catch(e){
      console.error('firestore log failed',e.message)
    }

    // simple auto-reply for test
    if(text && text.toLowerCase().startsWith('ping')){
      try{ await sendMessage(topic, chatId, `pong (${topic})`) }catch(e){console.error('send failed',e.message)}
    }

    res.status(200).json({ok:true})
  }catch(e){
    console.error(e)
    res.status(500).json({error:e.message})
  }
}
