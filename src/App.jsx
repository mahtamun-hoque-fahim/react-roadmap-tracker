import React, { useEffect, useState } from 'react'
import RoadmapTracker from './components/RoadmapTracker'
import { auth, signInWithGoogle, signOutUser, loadProgressForUser, saveProgressForUser, signInWithEmail, signUpWithEmail } from './firebase'

export default function App() {
  const [user, setUser] = useState(null)
  const [loadingRemote, setLoadingRemote] = useState(false)

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (!u) {
        setUser(null)
        return
      }
      setLoadingRemote(true)
      const remote = await loadProgressForUser(u.uid)
      setUser({ uid: u.uid, email: u.email, remoteData: remote })
      setLoadingRemote(false)
    })
    return () => unsub()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="p-4 shadow-sm bg-white">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="font-semibold text-xl">React Roadmap Tracker</h1>
          <div>
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-600">{user.email}</div>
                <button onClick={() => signOutUser()} className="px-3 py-1 bg-red-500 text-white rounded">Sign out</button>
                <button
                  onClick={async () => {
                    const evt = new CustomEvent('save-to-cloud')
                    window.dispatchEvent(evt)
                  }}
                  className="px-3 py-1 bg-green-600 text-white rounded"
                >
                  Save
                </button>
              </div>
            ) : (
              <AuthButtons />
            )}
          </div>
        </div>
      </header>

      <main className="p-6 max-w-6xl mx-auto">
        <RoadmapTracker user={user} onSaveCloud={async (uid, data) => {
          if (uid) await saveProgressForUser(uid, data)
        }} loadingRemote={loadingRemote} />
      </main>
    </div>
  )
}

function AuthButtons() {
  const [showEmail, setShowEmail] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)

  return (
    <div className="flex items-center gap-3">
      <button onClick={() => signInWithGoogle()} className="px-3 py-1 bg-blue-600 text-white rounded">Sign in with Google</button>
      <button onClick={() => setShowEmail(s => !s)} className="px-3 py-1 bg-gray-200 rounded">Email</button>
      {showEmail && (
        <div className="flex items-center gap-2 bg-white p-2 rounded shadow">
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="email" className="px-2 py-1 border rounded" />
          <input value={password} type="password" onChange={e => setPassword(e.target.value)} placeholder="password" className="px-2 py-1 border rounded" />
          <button onClick={async () => {
            try {
              if (isSignUp) await signUpWithEmail(email, password)
              else await signInWithEmail(email, password)
            } catch (err) {
              alert(err.message)
            }
          }} className="px-3 py-1 bg-green-600 text-white rounded">{isSignUp ? 'Sign up' : 'Sign in'}</button>
          <button onClick={() => setIsSignUp(s => !s)} className="px-2 py-1 text-sm text-gray-600">{isSignUp ? 'Have account?' : 'Create?'}</button>
        </div>
      )}
    </div>
  )
}
