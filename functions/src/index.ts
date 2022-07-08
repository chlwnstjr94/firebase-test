// CommonJS => require(), module.exports
// ESM => import, export
import * as admin from 'firebase-admin'
// 초기화
admin.initializeApp()

// import * as dotenv from 'dotenv'
// dotenv.config()

import * as functions from 'firebase-functions'
import * as express from 'express'
import * as cors from 'cors'
import todo from './routes/todo'
// import './jobs'

const app = express()
app.use(express.json())
// 모든 요청 허용
app.use(cors())
app.use('/todo', todo)

export const api = functions.https.onRequest(app)
// http://localhost:5001/my-project-ff475/us-central1/api/todo
