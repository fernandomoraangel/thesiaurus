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
      // La alerta se elimina para una mejor UX, el cambio de estado en App.jsx se encarga
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
    <div className="hero min-h-[calc(100vh-100px)]">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="text-center lg:text-left lg:pl-8">
          <h1 className="text-5xl font-bold">¡Bienvenido!</h1>
          <p className="py-6">Gestiona tus tesauros de forma moderna y eficiente. Inicia sesión o crea una cuenta para comenzar.</p>
        </div>
        <div className="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
          <form className="card-body" onSubmit={handleLogin}>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input 
                type="email" 
                placeholder="email" 
                className="input input-bordered" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Contraseña</span>
              </label>
              <input 
                type="password" 
                placeholder="contraseña" 
                className="input input-bordered" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="form-control mt-6">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <span className="loading loading-spinner"></span> : 'Iniciar Sesión'}
              </button>
            </div>
            <div className="divider">O</div>
            <div className="form-control">
                <button type="button" className="btn btn-outline" onClick={handleSignup} disabled={loading}>
                    {loading ? <span className="loading loading-spinner"></span> : 'Registrarse'}
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}