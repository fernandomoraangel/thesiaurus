document.addEventListener('DOMContentLoaded', () => {
    // --- 1. CONFIGURACIÓN DE SUPABASE ---
    const SUPABASE_URL = 'https://ljxaakuiepxxdqsqcpsc.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqeGFha3VpZXB4eGRxc3FjcHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MzQ3NzUsImV4cCI6MjA3MTIxMDc3NX0.q7jfHERVexiluOWwwetf-NSYZeRPg-JJfcs77Zug5ys';
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
    const logoutBtn = document.getElementById('logout-btn');
    const thesaurusSelect = document.getElementById('thesaurus-select');
    const newThesaurusForm = document.getElementById('new-thesaurus-form');
    const newThesaurusNameInput = document.getElementById('new-thesaurus-name');
    const renameThesaurusBtn = document.getElementById('rename-thesaurus-btn');
    const deleteThesaurusBtn = document.getElementById('delete-thesaurus-btn');

    // --- 3. ESTADO DE LA APLICACIÓN Y CONFIGURACIÓN DE D3 ---
    let state = {
        terms: [],
        relationships: [],
        thesauruses: [],
        activeThesaurusId: null,
        user: null
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

    // --- 4. FUNCIONES DE AUTENTICACIÓN Y GESTIÓN DE USUARIO ---
    async function checkUserSession() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            window.location.href = '/index.html';
        } else {
            state.user = session.user;
            initialize();
        }
    }

    logoutBtn.addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = '/index.html';
    });

    // --- 5. FUNCIONES DE GESTIÓN DE TESAUROS ---
    async function fetchUserThesauruses() {
        const { data, error } = await supabase
            .from('thesauruses')
            .select('*')
            .eq('user_id', state.user.id);

        if (error) {
            console.error('Error fetching thesauruses:', error);
            return;
        }
        state.thesauruses = data;
        renderThesaurusSelector();
        if (data.length > 0) {
            state.activeThesaurusId = data[0].id;
            fetchInitialData();
        }
    }

    function renderThesaurusSelector() {
        thesaurusSelect.innerHTML = state.thesauruses
            .map(t => `<option value="${t.id}">${t.name}</option>`)
            .join('');
    }

    newThesaurusForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = newThesaurusNameInput.value;
        const { data, error } = await supabase
            .from('thesauruses')
            .insert({ name, user_id: state.user.id })
            .select()
            .single();

        if (error) {
            Swal.fire('Error', 'No se pudo crear el tesauro.', 'error');
            return;
        }
        state.thesauruses.push(data);
        renderThesaurusSelector();
        thesaurusSelect.value = data.id;
        state.activeThesaurusId = data.id;
        fetchInitialData();
        newThesaurusNameInput.value = '';
    });

    renameThesaurusBtn.addEventListener('click', async () => {
        const thesaurusId = state.activeThesaurusId;
        if (!thesaurusId) return;

        const { value: newName } = await Swal.fire({
            title: 'Renombrar Tesauro',
            input: 'text',
            inputValue: state.thesauruses.find(t => t.id === thesaurusId).name,
            showCancelButton: true,
            inputValidator: (value) => {
                if (!value) {
                    return '¡Necesitas escribir un nombre!'
                }
            }
        });

        if (newName) {
            const { error } = await supabase
                .from('thesauruses')
                .update({ name: newName })
                .eq('id', thesaurusId);

            if (error) {
                Swal.fire('Error', 'No se pudo renombrar el tesauro.', 'error');
            } else {
                const index = state.thesauruses.findIndex(t => t.id === thesaurusId);
                state.thesauruses[index].name = newName;
                renderThesaurusSelector();
                Swal.fire('Éxito', 'Tesauro renombrado.', 'success');
            }
        }
    });

    deleteThesaurusBtn.addEventListener('click', async () => {
        const thesaurusId = state.activeThesaurusId;
        if (!thesaurusId) return;

        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "¡Se eliminará el tesauro y todos sus términos y relaciones!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, ¡elimínalo!'
        });

        if (result.isConfirmed) {
            const { error } = await supabase
                .from('thesauruses')
                .delete()
                .eq('id', thesaurusId);

            if (error) {
                Swal.fire('Error', 'No se pudo eliminar el tesauro.', 'error');
            } else {
                state.thesauruses = state.thesauruses.filter(t => t.id !== thesaurusId);
                renderThesaurusSelector();
                if (state.thesauruses.length > 0) {
                    state.activeThesaurusId = state.thesauruses[0].id;
                } else {
                    state.activeThesaurusId = null;
                }
                fetchInitialData();
                Swal.fire('Eliminado', 'El tesauro ha sido eliminado.', 'success');
            }
        }
    });

    thesaurusSelect.addEventListener('change', () => {
        state.activeThesaurusId = thesaurusSelect.value;
        fetchInitialData();
    });

    // --- 6. FUNCIONES DE SUPABASE (CRUD) ---
    async function fetchInitialData() {
        if (!state.activeThesaurusId) {
            state.terms = [];
            state.relationships = [];
            updateAll();
            return;
        }
        loader.classList.remove('hidden');
        try {
            const { data: terms, error: termsError } = await supabase
                .from('terms')
                .select('*')
                .eq('thesaurus_id', state.activeThesaurusId);
            if (termsError) throw termsError;

            const termIds = terms.map(t => t.id);
            const { data: relationships, error: relsError } = await supabase
                .from('relationships')
                .select('*')
                .in('source_term_id', termIds);
            if (relsError) throw relsError;

            state.terms = terms;
            state.relationships = relationships;

            updateAll();
        } catch (error) {
            console.error('Error fetching initial data:', error);
            Swal.fire('Error', 'No se pudieron cargar los datos. Revisa la consola.', 'error');
        } finally {
            loader.classList.add('hidden');
        }
    }

    async function addTerm(name, scope_note) {
        try {
            const { data, error } = await supabase
                .from('terms')
                .insert({ name, scope_note, thesaurus_id: state.activeThesaurusId })
                .select()
                .single();
            if (error) throw error;

            state.terms.push(data);
            updateAll();
            Swal.fire('Éxito', 'Término añadido correctamente.', 'success');
        } catch (error) {
            console.error('Error adding term:', error);
            Swal.fire('Error', 'Error al añadir el término.', 'error');
        }
    }

    async function updateTerm(id, name, scope_note) {
        try {
            const { data, error } = await supabase
                .from('terms')
                .update({ name, scope_note })
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;

            const index = state.terms.findIndex(t => t.id === id);
            if (index !== -1) state.terms[index] = data;

            updateAll();
            Swal.fire('Éxito', 'Término actualizado correctamente.', 'success');
        } catch (error) {
            console.error('Error updating term:', error);
            Swal.fire('Error', 'Error al actualizar el término.', 'error');
        }
    }

    async function deleteTerm(id) {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "¡No podrás revertir esto!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, ¡elimínalo!'
        });

        if (!result.isConfirmed) return;

        try {
            // Gracias a ON DELETE CASCADE en la DB, solo necesitamos eliminar el término.
            const { error } = await supabase.from('terms').delete().eq('id', id);
            if (error) throw error;

            // Actualiza el estado local.
            state.terms = state.terms.filter(t => t.id !== id);
            state.relationships = state.relationships.filter(r => r.source_term_id !== id && r.target_term_id !== id);

            updateAll();
            clearForm();
            Swal.fire('¡Eliminado!', 'El término ha sido eliminado.', 'success');
        } catch (error) {
            console.error('Error deleting term:', error);
            Swal.fire('Error', 'Error al eliminar el término.', 'error');
        }
    }

    async function addRelationship(source_id, target_id, type) {
        try {
            const relationshipsToInsert = [{
                source_term_id: source_id,
                target_term_id: target_id,
                relationship_type: type
            }];

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
            Swal.fire('Éxito', 'Relación creada correctamente.', 'success');
        } catch (error) {
            console.error('Error adding relationship:', error);
            Swal.fire('Error', 'Error al crear la relación. ¿Quizás ya existe?', 'error');
        }
    }

    // --- 7. FUNCIONES DE D3 (VISUALIZACIÓN) ---
    function updateGraph() {
        const nodes = state.terms;
        const links = state.relationships.map(d => ({ ...d, source: d.source_term_id, target: d.target_term_id }));

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

                    nodeEnter.append("text")
                        .attr("dy", -15)
                        .text(d => d.name);
                    nodeEnter.call(d3.drag()
                        .on("start", dragstarted)
                        .on("drag", dragged)
                        .on("end", dragended));
                    return nodeEnter;
                },
                update => update,
                exit => exit.remove()
            );

        const link = linkGroup.selectAll("line")
            .data(links, d => d.id)
            .join("line")
            .attr("class", d => `link ${d.relationship_type}`)
            .attr("stroke-width", 2);

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

    const zoom = d3.zoom().on("zoom", (event) => {
        nodeGroup.attr("transform", event.transform);
        linkGroup.attr("transform", event.transform);
    });
    svg.call(zoom);

    // --- 8. FUNCIONES DE UI ---
    function populateTermDropdowns() {
        const options = state.terms
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(term => `<option value="${term.id}">${term.name}</option>`).join('');
        sourceTermSelect.innerHTML = options;
        targetTermSelect.innerHTML = options;
    }

    function showTermDetails(term) {
        termIdInput.value = term.id;
        termNameInput.value = term.name;
        termScopeNoteInput.value = term.scope_note || '';
        addTermBtn.disabled = true;
        updateTermBtn.disabled = false;
        deleteTermBtn.disabled = false;
    }

    function clearForm() {
        termForm.reset();
        termIdInput.value = '';
        addTermBtn.disabled = false;
        updateTermBtn.disabled = true;
        deleteTermBtn.disabled = true;
    }

    function updateAll() {
        updateGraph();
        populateTermDropdowns();
    }

    // --- 9. MANEJADORES DE EVENTOS ---
    termForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (termIdInput.value) return;
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
            Swal.fire('Error', 'Un término no puede relacionarse consigo mismo.', 'error');
            return;
        }
        addRelationship(source_id, target_id, type);
    });

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        d3.selectAll(".node")
            .classed("highlighted", d => query && d.name.toLowerCase().includes(query));
    });

    // --- 10. IMPORTACIÓN / EXPORTACIÓN ---
    exportBtn.addEventListener('click', () => {
        const dataToExport = {
            terms: state.terms,
            relationships: state.relationships.map(({ source, target, ...rest }) => rest)
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

                const result = await Swal.fire({
                    title: '¿Estás seguro?',
                    text: `Vas a importar ${data.terms.length} términos y ${data.relationships.length} relaciones al tesauro actual. ¿Continuar?`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Sí, ¡importar!'
                });

                if (!result.isConfirmed) return;

                const termsToInsert = data.terms.map(t => ({ ...t, thesaurus_id: state.activeThesaurusId }));

                const { error: termsError } = await supabase.from('terms').insert(termsToInsert);
                if (termsError) throw termsError;

                const { error: relsError } = await supabase.from('relationships').insert(data.relationships);
                if (relsError) throw relsError;

                Swal.fire('¡Éxito!', 'Importación completada con éxito.', 'success');
                fetchInitialData();
            } catch (error) {
                console.error('Error importing data:', error);
                Swal.fire('Error', 'Error al importar el archivo. Revisa la consola.', 'error');
            }
        };
        reader.readAsText(file);
        importInput.value = '';
    });

    // --- 11. INICIALIZACIÓN ---
    function initialize() {
        fetchUserThesauruses();
    }

    checkUserSession();
});
