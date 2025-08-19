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
      
      setTerms([...terms, data])
      setNewTermName('')
      setNewTermScopeNote('')
      alert('Término creado con éxito')
    } catch (error) {
      alert(error.message)
    }
  }

  /**
   * EJEMPLO DE IMPLEMENTACIÓN DE RELACIÓN TG/TE
   * Esta función crea una relación recíproca entre dos términos.
   * @param {string} idTerminoOrigen - El UUID del término específico (TE).
   * @param {string} idTerminoDestino - El UUID del término genérico (TG).
   */
  const createReciprocalRelationship = async (idTerminoEspecifico, idTerminoGenerico) => {
    try {
        // 1. El término específico (TE) tiene un término genérico (TG)
        const { error: error1 } = await supabase.from('relaciones').insert({
            id_termino_origen: idTerminoEspecifico,
            tipo_relacion: 'TG',
            id_termino_destino: idTerminoGenerico
        });
        if (error1) throw new Error(`Error creando relación TG: ${error1.message}`);

        // 2. El término genérico (TG) tiene un término específico (TE)
        const { error: error2 } = await supabase.from('relaciones').insert({
            id_termino_origen: idTerminoGenerico,
            tipo_relacion: 'TE',
            id_termino_destino: idTerminoEspecifico
        });
        if (error2) throw new Error(`Error creando relación TE: ${error2.message}`);

        alert('Relación TG/TE creada con éxito');

    } catch (error) {
        // En una aplicación real, aquí deberías manejar la posible inconsistencia 
        // si una de las dos inserciones falla.
        alert(error.message);
    }
  }

  if (loading) {
    return <p>Cargando términos...</p>
  }

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto' }}>
      <h2>Gestor de Términos del Tesauro</h2>
      
      <form onSubmit={handleCreateTerm}>
        <h3>Crear Nuevo Término</h3>
        <input 
          type="text" 
          placeholder="Nombre del término preferente" 
          value={newTermName}
          onChange={(e) => setNewTermName(e.target.value)}
          style={{ padding: '8px', marginRight: '10px' }}
        />
        <input 
          type="text" 
          placeholder="Nota de alcance (definición)" 
          value={newTermScopeNote}
          onChange={(e) => setNewTermScopeNote(e.target.value)}
          style={{ padding: '8px', marginRight: '10px' }}
        />
        <button type="submit">Crear Término</button>
      </form>

      <hr style={{ margin: '20px 0' }} />

      <h3>Términos Existentes</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {terms.map(term => (
          <li key={term.id} style={{ border: '1px solid #eee', padding: '10px', marginBottom: '10px' }}>
            <strong>{term.nombre_preferente}</strong>
            <p>{term.nota_alcance || 'Sin nota de alcance'}</p>
            {/* Aquí irían los botones para editar, eliminar y crear relaciones */}
          </li>
        ))}
      </ul>
    </div>
  )
}
