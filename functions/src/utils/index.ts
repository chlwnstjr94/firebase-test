import * as admin from 'firebase-admin'
import { nanoid } from 'nanoid'
// import validator from 'validator'
import * as FileType from 'file-type'

export async function saveFile(base64: string, bucketName = 'my-project-ff475-images') {
// 스토리지에 파일 저장
  const bucket = admin.storage().bucket(bucketName)

  // if  (!validator.isBase64(base64)) {
  //   throw { state: 400, message: '잘못된 양식입니다!'}
  // }

  const [, body] = base64.split(',')
  const buffer = Buffer.from(body, 'base64')
  const byteLength = Buffer.byteLength(buffer)
  if (10 * 1024 * 1024 < byteLength) {
    throw { state: 400, message: '제한 용량 초과!' }
  }

  const { ext } = await FileType.fromBuffer(buffer) as { ext: string }
  const allowTypes = ['jpg', 'png', 'webp']
  if (!allowTypes.includes(ext)) {
    throw { status: 400, message: '유효한 타입이 아닙니다!' }
  }

  const file = bucket.file(`${nanoid()}.${ext}`)
  await file.save(buffer)

  return file.publicUrl()
  // return process.env.NODE_ENV === 'development'
  //   ? `http://localhost:9199/${bucketName}/image.png`
  //   : `https://storage.googleapis.com/${bucketName}/image.png`
}
