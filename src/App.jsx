import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './components/Auth'
import TermsManager from './components/TermsManager'

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    // Intenta obtener la sesión existente al cargar la app
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Escucha los cambios en el estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    // Limpia la suscripción al desmontar el componente
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Thesiaurus</h1>
        {session && <button onClick={handleLogout}>Cerrar Sesión</button>}
      </header>
      <main>
        {!session 
          ? <Auth /> 
          : <TermsManager key={session.user.id} session={session} />
        }
      </main>
    </div>
  )
}

export default App