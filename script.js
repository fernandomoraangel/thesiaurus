document.addEventListener('DOMContentLoaded', () => {
    // --- 1. CONFIGURACIÓN DE SUPABASE ---
    const SUPABASE_URL = 'https://ljxaakuiepxxdqsqcpsc.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqeGFha3VpZXB4eGRxc3FjcHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MzQ3NzUsImV4cCI6MjA3MTIxMDc3NX0.q7jfHERVexiluOWwwetf-NSYZeRPg-JJfcs77Zug5ys';

    // Inicializa el cliente de Supabase.
    const supabase = self.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // --- 2. SELECCIÓN DE ELEMENTOS DEL DOM ---
    const loader = document.getElementById('loader');
    const termForm = document.getElementById('term-form');
    const termIdInput = document.getElementById('term-id');
    const termNameInput = document.getElementById('term-name');
    const termScopeNoteInput = document.getElementById('term-scope-note');
    const addTermBtn = document.getElementById('add-term-btn');
    const updateTermBtn = document.getElementById('update-term-btn');
    const deleteTermBtn = document.getElementById('delete-term-btn');
    const clearFormBtn = document.getElementById('clear-form-btn');
    const relationshipForm = document.getElementById('relationship-form');
    const sourceTermSelect = document.getElementById('source-term');
    const targetTermSelect = document.getElementById('target-term');
    const relationshipTypeSelect = document.getElementById('relationship-type');
    const searchInput = document.getElementById('search-input');
    const exportBtn = document.getElementById('export-json-btn');
    const importInput = document.getElementById('import-json-input');
    const tooltip = document.getElementById('tooltip');
    const visPanel = document.getElementById('visualization-panel');

    // --- 3. ESTADO DE LA APLICACIÓN Y CONFIGURACIÓN DE D3 ---
    let state = {
        terms: [],
        relationships: [],
    };

    const width = visPanel.clientWidth;
    const height = visPanel.clientHeight;

    const svg = d3.select("#visualization-panel").append("svg")
        .attr("width", width)
        .attr("height", height);

    const simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(d => d.id).distance(100))
        .force("charge", d3.forceManyBody().strength(-400))
        .force("center", d3.forceCenter(width / 2, height / 2));

    let linkGroup = svg.append("g").attr("class", "links");
    let nodeGroup = svg.append("g").attr("class", "nodes");

    // --- 4. FUNCIONES DE SUPABASE (CRUD) ---

    /**
     * Carga los datos iniciales (términos y relaciones) desde Supabase.
     */
    async function fetchInitialData() {
        loader.classList.remove('hidden');
        try {
            const { data: terms, error: termsError } = await supabase.from('terms').select('*');
            if (termsError) throw termsError;

            const { data: relationships, error: relsError } = await supabase.from('relationships').select('*');
            if (relsError) throw relsError;

            state.terms = terms;
            state.relationships = relationships;

            updateAll();
        } catch (error) {
            console.error('Error fetching initial data:', error);
            alert('No se pudieron cargar los datos. Revisa la consola.');
        } finally {
            loader.classList.add('hidden');
        }
    }

    /**
     * Añade un nuevo término a la base de datos.
     * @param {string} name - El nombre del término.
     * @param {string} scope_note - La nota de alcance.
     */
    async function addTerm(name, scope_note) {
        try {
            const { data, error } = await supabase.from('terms').insert({ name, scope_note }).select().single();
            if (error) throw error;

            state.terms.push(data);
            updateAll();
        } catch (error) {
            console.error('Error adding term:', error);
            alert('Error al añadir el término.');
        }
    }
    
    /**
     * Actualiza un término existente.
     * @param {string} id - El UUID del término.
     * @param {string} name - El nuevo nombre.
     * @param {string} scope_note - La nueva nota de alcance.
     */
    async function updateTerm(id, name, scope_note) {
        try {
            const { data, error } = await supabase.from('terms').update({ name, scope_note }).eq('id', id).select().single();
            if (error) throw error;

            const index = state.terms.findIndex(t => t.id === id);
            if (index !== -1) state.terms[index] = data;
            
            updateAll();
        } catch (error) {
            console.error('Error updating term:', error);
            alert('Error al actualizar el término.');
        }
    }

    /**
     * Elimina un término y todas sus relaciones asociadas.
     * @param {string} id - El UUID del término a eliminar.
     */
    async function deleteTerm(id) {
        if (!confirm('¿Estás seguro de que quieres eliminar este término y todas sus relaciones?')) return;
        
        try {
            // Primero, elimina todas las relaciones que involucran a este término.
            const { error: relsError } = await supabase.from('relationships').delete().or(`source_term_id.eq.${id},target_term_id.eq.${id}`);
            if (relsError) throw relsError;

            // Luego, elimina el término en sí.
            const { error: termError } = await supabase.from('terms').delete().eq('id', id);
            if (termError) throw termError;

            // Actualiza el estado local.
            state.terms = state.terms.filter(t => t.id !== id);
            state.relationships = state.relationships.filter(r => r.source_term_id !== id && r.target_term_id !== id);
            
            updateAll();
            clearForm();
        } catch (error) {
            console.error('Error deleting term:', error);
            alert('Error al eliminar el término.');
        }
    }

    /**
     * Crea una relación y su inversa si es necesario (BT/NT).
     * @param {string} source_id 
     * @param {string} target_id 
     * @param {string} type 
     */
    async function addRelationship(source_id, target_id, type) {
        try {
            const relationshipsToInsert = [{
                source_term_id: source_id,
                target_term_id: target_id,
                relationship_type: type
            }];

            // Lógica de relación inversa para BT/NT
            if (type === 'BT') {
                relationshipsToInsert.push({
                    source_term_id: target_id,
                    target_term_id: source_id,
                    relationship_type: 'NT' // Narrower Term
                });
            }

            const { data, error } = await supabase.from('relationships').insert(relationshipsToInsert).select();
            if (error) throw error;

            state.relationships.push(...data);
            updateAll();
        } catch (error) {
            console.error('Error adding relationship:', error);
            alert('Error al crear la relación. ¿Quizás ya existe?');
        }
    }

    // --- 5. FUNCIONES DE D3 (VISUALIZACIÓN) ---

    /**
     * Renderiza o actualiza el grafo completo con los datos del estado.
     */
    function updateGraph() {
        const nodes = state.terms;
        const links = state.relationships.map(d => ({ ...d, source: d.source_term_id, target: d.target_term_id }));

        // Nodos
        const node = nodeGroup.selectAll(".node")
            .data(nodes, d => d.id)
            .join(
                enter => {
                    const nodeEnter = enter.append("g").attr("class", "node");
                    nodeEnter.append("circle")
                        .attr("r", 10)
                        .attr("fill", "#2c5282")
                        .on("click", (event, d) => showTermDetails(d))
                        .on("mouseover", showTooltip)
                        .on("mousemove", moveTooltip)
                        .on("mouseout", hideTooltip);
                    
                    nodeEnter.append("text").text(d => d.name);
                    nodeEnter.call(d3.drag()
                        .on("start", dragstarted)
                        .on("drag", dragged)
                        .on("end", dragended));
                    return nodeEnter;
                },
                update => update,
                exit => exit.remove()
            );

        // Enlaces
        const link = linkGroup.selectAll("line")
            .data(links, d => d.id)
            .join("line")
            .attr("class", d => `link ${d.relationship_type}`)
            .attr("stroke-width", 2);

        // Actualiza la simulación
        simulation.nodes(nodes);
        simulation.force("link").links(links);
        simulation.alpha(1).restart();

        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
            node
                .attr("transform", d => `translate(${d.x},${d.y})`);
        });
    }

    // Funciones de arrastre (drag) de D3
    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }
    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }
    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    // Funciones de Tooltip
    function showTooltip(event, d) {
        if (d.scope_note) {
            tooltip.classList.remove('hidden');
            tooltip.innerHTML = d.scope_note;
            moveTooltip(event);
        }
    }
    function moveTooltip(event) {
        tooltip.style.left = (event.pageX + 15) + 'px';
        tooltip.style.top = (event.pageY + 15) + 'px';
    }
    function hideTooltip() {
        tooltip.classList.add('hidden');
    }
    
    // Zoom y Pan
    const zoom = d3.zoom().on("zoom", (event) => {
        nodeGroup.attr("transform", event.transform);
        linkGroup.attr("transform", event.transform);
    });
    svg.call(zoom);

    // --- 6. FUNCIONES DE UI ---

    /**
     * Rellena los menús desplegables con los términos actuales.
     */
    function populateTermDropdowns() {
        const options = state.terms
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(term => `<option value="${term.id}">${term.name}</option>`).join('');
        sourceTermSelect.innerHTML = options;
        targetTermSelect.innerHTML = options;
    }

    /**
     * Muestra los detalles de un término en el formulario.
     * @param {object} term - El objeto del término.
     */
    function showTermDetails(term) {
        termIdInput.value = term.id;
        termNameInput.value = term.name;
        termScopeNoteInput.value = term.scope_note || '';
        addTermBtn.disabled = true;
        updateTermBtn.disabled = false;
        deleteTermBtn.disabled = false;
    }

    /**
     * Limpia el formulario de términos y restaura los botones.
     */
    function clearForm() {
        termForm.reset();
        termIdInput.value = '';
        addTermBtn.disabled = false;
        updateTermBtn.disabled = true;
        deleteTermBtn.disabled = true;
    }

    /**
     * Llama a todas las funciones de actualización necesarias.
     */
    function updateAll() {
        updateGraph();
        populateTermDropdowns();
    }

    // --- 7. MANEJADORES DE EVENTOS ---

    termForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (termIdInput.value) return; // Prevenir "Añadir" si se está editando
        addTerm(termNameInput.value, termScopeNoteInput.value);
        termForm.reset();
    });

    updateTermBtn.addEventListener('click', () => {
        const id = termIdInput.value;
        if (!id) return;
        updateTerm(id, termNameInput.value, termScopeNoteInput.value);
    });

    deleteTermBtn.addEventListener('click', () => {
        const id = termIdInput.value;
        if (!id) return;
        deleteTerm(id);
    });

    clearFormBtn.addEventListener('click', clearForm);

    relationshipForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const source_id = sourceTermSelect.value;
        const target_id = targetTermSelect.value;
        const type = relationshipTypeSelect.value;
        if (source_id === target_id) {
            alert('Un término no puede relacionarse consigo mismo.');
            return;
        }
        addRelationship(source_id, target_id, type);
    });

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        d3.selectAll(".node")
            .classed("highlighted", d => query && d.name.toLowerCase().includes(query));
    });

    // --- 8. IMPORTACIÓN / EXPORTACIÓN ---

    exportBtn.addEventListener('click', () => {
        const dataToExport = {
            terms: state.terms,
            relationships: state.relationships.map(({ source, target, ...rest }) => rest) // Limpiar datos de D3
        };
        const dataStr = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'thesaurus_export.json';
        a.click();
        URL.revokeObjectURL(url);
    });

    importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (!data.terms || !data.relationships) throw new Error('Formato de archivo inválido.');
                
                if (!confirm(`Vas a importar ${data.terms.length} términos y ${data.relationships.length} relaciones. ¿Continuar?`)) return;

                // Inserción masiva
                const { error: termsError } = await supabase.from('terms').insert(data.terms);
                if (termsError) throw termsError;
                
                const { error: relsError } = await supabase.from('relationships').insert(data.relationships);
                if (relsError) throw relsError;

                alert('¡Importación completada con éxito!');
                fetchInitialData(); // Recargar todo
            } catch (error) {
                console.error('Error importing data:', error);
                alert('Error al importar el archivo. Revisa la consola.');
            }
        };
        reader.readAsText(file);
        importInput.value = ''; // Resetear input
    });

    // --- 9. INICIALIZACIÓN ---
    fetchInitialData();
});
