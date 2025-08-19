import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      alert('¡Has iniciado sesión!')
    } catch (error) {
      alert(error.error_description || error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    try {
        setLoading(true)
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        alert('¡Usuario registrado! Revisa tu correo para la verificación.')
      } catch (error) {
        alert(error.error_description || error.message)
      } finally {
        setLoading(false)
      }
  }

  return (
    <div style={{ maxWidth: '420px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Autenticación del Tesauro</h2>
      <p>Inicia sesión o crea una cuenta para continuar</p>
      <form onSubmit={handleLogin}>
        <div>
          <input
            type="email"
            placeholder="Tu correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
        </div>
        <div>
          <button type="submit" disabled={loading}>
            {loading ? <span>Cargando...</span> : <span>Iniciar Sesión</span>}
          </button>
          <button type="button" onClick={handleSignup} disabled={loading} style={{ marginLeft: '10px' }}>
            {loading ? <span>Cargando...</span> : <span>Registrarse</span>}
          </button>
        </div>
      </form>
    </div>
  )
}
