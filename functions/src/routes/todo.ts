import * as admin from 'firebase-admin'
import * as express from 'express'
import { saveFile } from '../utils'

const db = admin.firestore()
const router = express.Router()

interface Todo {
  id?: string
  title: string
  image: string | null
  done: boolean
  createdAt: string
  updatedAt: string
  deleted: boolean
}

// 투두 조회
// req: request, res: response
router.get('/', async (req, res) => {
  console.log('req.headers:', req.headers)
  console.log('req.body:',req.body)
  console.log('req.params:',req.params)
  console.log('req.query:',req.query)

  // .where - 필터링
  const snpas = await db.collection('Todos')
    .where('deleted', '!=', true)
    .get()

  // type ResponseTodo = Todo & { id: string } => 대신 위 interface Todo에 id?: string 추가
  // const todos: ResponseTodo[] = []

  const todos: Todo[] = []

  snpas.forEach(snap => {
    const fields = snap.data()
    todos.push({
      id: snap.id,
      ...fields as Todo
    })
  })

  // 처리..

  todos.sort((a, b) => {
    const aTime: number = new Date(a.createdAt).getTime()
    const bTime: number = new Date(b.createdAt).getTime()
    return bTime - aTime
  })

  res.status(200).json(todos)
})

// 투두 추가
router.post('/', async (req, res) => {
  const { title, imageBase64 } = req.body
  const date = new Date().toISOString()

  // 스토리지에 파일 저장
  let image = ''
  try {
    image = await saveFile(imageBase64)
  } catch (error) {
    console.log(error)
  }
  // await 있을 시, image => 주소
  // await 없을 시, image => promise

  const todo: Todo = {
    title,
    image: image,
    done: false,
    createdAt: date,
    updatedAt: date,
    deleted: false
  }

  const ref = await db.collection('Todos').add(todo)

  res.status(200).json({
    id: ref.id,
    ...todo
  })
})

// 투두 수정
router.put('/:id', async (req, res) => {
  const { title, done, imageBase64 } = req.body
  const { id } = req.params

  // 스냅샷(snapshot)
  const snap = await db.collection('Todos').doc(id).get()
  if (!snap.exists) {
    return res.status(404).json('존재하지 않는 정보입니다.')
  }

  // 스토리지에 파일 저장
  let image = ''
  try {
    image = await saveFile(imageBase64)
  } catch (error) {
    console.log(error)
  }

  const { createdAt } = snap.data() as Todo
  const updatedAt = new Date().toDateString()
  await snap.ref.update({
    title,
    done,
    image,
    updatedAt
  })

  return res.status(200).json({
    id: snap.id,
    title,
    done,
    image,
    createdAt,
    updatedAt
  })
})

// 투두 삭제
router.delete('/:id', async (req, res) => {
  const { id } = req.params

  const snap = await db.collection('Todos').doc(id).get()
  if (!snap.exists) {
    return res.status(404).json('존재하지 않는 정보입니다.')
  }
  // await snap.ref.delete()
  snap.ref.update({
    deleted: true
  })

  res.status(200).json(true)
  return
})

export default router
