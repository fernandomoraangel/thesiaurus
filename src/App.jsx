import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './components/Auth'
import TermsManager from './components/TermsManager'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><span className="loading loading-lg"></span></div>
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100 shadow-lg">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl">Thesiaurus</a>
        </div>
        {session && (
          <div className="flex-none">
            <button onClick={handleLogout} className="btn btn-ghost">Cerrar Sesión</button>
          </div>
        )}
      </div>
      <main className="container mx-auto p-4">
        {!session 
          ? <Auth /> 
          : <TermsManager key={session.user.id} session={session} />
        }
      </main>
    </div>
  )
}

export default App
