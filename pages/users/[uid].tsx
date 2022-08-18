import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { User } from '../../models/User'
import { collection, doc, getDoc, getFirestore } from 'firebase/firestore'
import Layout from '../../components/Layout'

type Query = {
  uid: string
}

export default function UserShow() {
  const [user, setUser] = useState<User>(null)
  const router = useRouter()
  const query = router.query as Query
  console.log(query)

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

  return (
    <Layout>
      {user && (
        <div className="text-center">
          <h1 className="h4">{user.name}さんのページ</h1>
          <div className="m-5">{user.name}さんに質問しよう！</div>
        </div>
      )}
    </Layout>
  )
}
