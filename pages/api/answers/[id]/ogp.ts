import { NextApiRequest, NextApiResponse } from 'next'
import { createCanvas, registerFont, loadImage } from 'canvas'
import * as path from 'path'
import '../../../../lib/firebase_admin'
import { firestore } from 'firebase-admin'
import { Answer } from '../../../../models/Answer'
import { Question } from '../../../../models/Question'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const id = req.query.id as string

  const answerDoc = await firestore().collection('answers').doc(id).get()
  const answer = answerDoc.data() as Answer
  const questionDoc = await firestore()
    .collection('questions')
    .doc(answer.questionId)
    .get()
  const question = questionDoc.data() as Question

  const width = 600
  const height = 315

  registerFont(path.resolve('./fonts/ipaexg.ttf'), {
    family: 'ipaexg',
  })

  const canvas = createCanvas(width, height)
  const context = canvas.getContext('2d')

  // 背景画像を描画する
  const backgroundImage = await loadImage(
    path.resolve('./images/ogp_background.png')
  )
  context.drawImage(backgroundImage, 0, 0, width, height)
  
  // テキストの描画
  context.font = '20px ipaexp'
  context.fillStyle = '#424242'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  const lines = createTextLines(context, question.body)
  lines.forEach((line, index) => {
    const y = 157 + 40 * (index - (lines.length - 1) / 2)
    context.fillText(line, 300, y)
  })

  const buffer = canvas.toBuffer()

  res.writeHead(200, {
    'Content-Type': 'image/png',
    'Content-Length': buffer.length,
  })
  res.end(buffer, 'binary')
}

type SeparatedText = {
  line: string
  remaining: string
}

function createTextLine(context, text: string): SeparatedText {
  const maxWidth = 400

  for (let i = 0; i < text.length; i++) {
    const line = text.substring(0, i + 1)
    if (context.measureText(line).width > maxWidth) {
      return {
        line,
        remaining: text.substring(i + 1),
      }
    }
  }

  return {
    line: text,
    remaining: '',
  }
}

function createTextLines(context, text: string): string[] {
  const lines: string[] = []
  let currentText = text

  while (currentText !== '') {
    const separatedText = createTextLine(context, currentText)
    lines.push(separatedText.line)
    currentText = separatedText.remaining
  }

  return lines
}