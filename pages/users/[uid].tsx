import { useRouter } from 'next/router'
import { FormEvent,useEffect, useState } from 'react'
import { User } from '../../models/User'
import Layout from '../../components/Layout'
import { useAuthentication } from '../../hooks/authentication'
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
} from 'firebase/firestore'
import { toast } from 'react-toastify';
import Link from 'next/dist/client/link' 

type Query = {
  uid: string
}

export default function UserShow() {
  const [user, setUser] = useState<User>(null)
  const router = useRouter()
  const query = router.query as Query
  // ログイン中のユーザーを取得する
  const { user: currentUser } = useAuthentication()
  // 入力内容をbodyに保存する
  const [body, setBody] = useState('')
  const [isSending, setIsSending] = useState(false)

  // useEffectを利用し、初回のみ実行させるようにする
  useEffect(() => {
    if (query.uid === undefined) {
      return
    }

    async function loadUser() {
      const db = getFirestore()
      const ref = doc(collection(db, 'users'), query.uid)
      const userDoc = await getDoc(ref)

      if (!userDoc.exists()) {
        return
      }

      const gotUser = userDoc.data() as User
      gotUser.uid = userDoc.id
      setUser(gotUser)
    }
    loadUser()
  }, [query.uid])

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
  
    const db = getFirestore()
    

    setIsSending(true)
  
    await addDoc(collection(db, 'questions'), {
      senderUid: currentUser.uid,
      receiverUid: user.uid,
      body,
      isReplied: false,
      createdAt: serverTimestamp(),
    })

    setIsSending(false)
  
    setBody('')
    toast.success('質問を送信しました。', {
      position: 'bottom-left',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    })
  }

  return (
    <Layout>
      {user && (
        <div className="text-center">
          <h1 className="h4">{user.name}さんのページ</h1>
          <div className="m-5">{user.name}さんに質問しよう！</div>
        </div>
      )}
      <div className="row justify-content-center mb-3">
        <div className="col-12 col-md-6">
          <form onSubmit={onSubmit}>
            <textarea
              className="form-control"
              placeholder="おげんきですか？"
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            ></textarea>
            <div className="m-3">
              {isSending ? (
                <div className="spinner-border text-secondary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              ) : (
                <button type="submit" className="btn btn-primary">
                  質問を送信する
                </button>
              )}
            </div>
          </form>
          <div>
            {user && (
              <p>
                <Link href="/users/me">
                  <a className="btn btn-link">自分もみんなに質問してもらおう！</a>
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
