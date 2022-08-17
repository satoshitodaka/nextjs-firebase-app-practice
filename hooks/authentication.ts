import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import { useEffect } from 'react'
import { User } from '../models/User'
import { atom, useRecoilState } from 'recoil' 

const userState = atom<User>({
  key: 'user',
  default: null,
})

export function useAuthentication() {
  const [user, setUser] = useRecoilState(userState)

  useEffect(() => {
    if (user !== null) {
      return
    }

    const auth = getAuth()

    signInAnonymously(auth).catch(function (error) {
      // 認証の結果エラーが出れば、エラー情報を出力する
      console.error(error)
    })

    onAuthStateChanged(auth, function (firebaseUser) {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          isAnonymous: firebaseUser.isAnonymous,
        })
      } else {
        // User is signed out.
        setUser(null)
      }
    })
  }, [])

  return { user }
}
