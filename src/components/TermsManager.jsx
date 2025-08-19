import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function TermsManager({ session }) {
  const [loading, setLoading] = useState(true)
  const [terms, setTerms] = useState([])
  const [newTermName, setNewTermName] = useState('')
  const [newTermScopeNote, setNewTermScopeNote] = useState('')

  useEffect(() => {
    fetchTerms()
  }, [])

  const fetchTerms = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('terminos')
        .select(`id, nombre_preferente, nota_alcance`)
        .order('nombre_preferente', { ascending: true })

      if (error) throw error
      setTerms(data)
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTerm = async (e) => {
    e.preventDefault()
    if (!newTermName) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('terminos')
        .insert({ 
            nombre_preferente: newTermName, 
            nota_alcance: newTermScopeNote,
            creado_por: user.id
        })
        .select()
        .single()

      if (error) throw error
      
      setTerms([...terms, data].sort((a, b) => a.nombre_preferente.localeCompare(b.nombre_preferente)))
      setNewTermName('')
      setNewTermScopeNote('')
    } catch (error) {
      alert(error.message)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-96"><span className="loading loading-lg"></span></div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Crear Nuevo Término</h2>
            <form onSubmit={handleCreateTerm}>
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Nombre del término</span>
                </label>
                <input 
                  type="text" 
                  placeholder="Ej: Fotosíntesis" 
                  className="input input-bordered w-full" 
                  value={newTermName}
                  onChange={(e) => setNewTermName(e.target.value)}
                />
              </div>
              <div className="form-control w-full mt-4">
                <label className="label">
                  <span className="label-text">Nota de alcance</span>
                </label>
                <textarea 
                  className="textarea textarea-bordered h-24" 
                  placeholder="Definición del término..."
                  value={newTermScopeNote}
                  onChange={(e) => setNewTermScopeNote(e.target.value)}
                ></textarea>
              </div>
              <div className="card-actions justify-end mt-6">
                <button type="submit" className="btn btn-primary">Crear</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="md:col-span-2">
        <h2 className="text-2xl font-bold mb-4">Términos Existentes ({terms.length})</h2>
        <div className="space-y-4">
          {terms.map(term => (
            <div key={term.id} className="card bg-base-100 shadow-md collapse collapse-arrow">
              <input type="checkbox" /> 
              <div className="collapse-title text-xl font-medium">
                {term.nombre_preferente}
              </div>
              <div className="collapse-content">
                <p>{term.nota_alcance || 'Sin nota de alcance'}</p>
                {/* Aquí se agregarán las relaciones y acciones */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}