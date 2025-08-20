document.addEventListener('DOMContentLoaded', () => {
    // --- 1. CONFIGURACIÓN DE SUPABASE ---
    const SUPABASE_URL = 'https://ljxaakuiepxxdqsqcpsc.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqeGFha3VpZXB4eGRxc3FjcHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MzQ3NzUsImV4cCI6MjA3MTIxMDc3NX0.q7jfHERVexiluOWwwetf-NSYZeRPg-JJfcs77Zug5ys';
    const supabase = self.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // --- 2. SELECCIÓN DE ELEMENTOS DEL DOM ---
    const loader = document.getElementById('loader');
    const searchInput = document.getElementById('search-input');
    const exportBtn = document.getElementById('export-json-btn');
    const importInput = document.getElementById('import-json-input');
    const tooltip = document.getElementById('tooltip');
    const visPanel = document.getElementById('visualization-panel');
    const logoutBtn = document.getElementById('logout-btn');
    
    // Elementos del gestor de tesauros
    const thesaurusSelect = document.getElementById('thesaurus-select');
    const newThesaurusForm = document.getElementById('new-thesaurus-form');
    const newThesaurusNameInput = document.getElementById('new-thesaurus-name');
    const renameThesaurusBtn = document.getElementById('rename-thesaurus-btn');
    const deleteThesaurusBtn = document.getElementById('delete-thesaurus-btn');

    // Elementos del formulario de conceptos (SKOS)
    const conceptForm = document.getElementById('concept-form');
    const conceptIdInput = document.getElementById('concept-id');
    const prefLabelInput = document.getElementById('pref-label');
    const altLabelsInput = document.getElementById('alt-labels');
    const hiddenLabelsInput = document.getElementById('hidden-labels');
    const definitionInput = document.getElementById('definition');
    const scopeNoteInput = document.getElementById('scope-note');
    const exampleInput = document.getElementById('example');
    const broaderConceptSelect = document.getElementById('broader-concept');
    const relatedConceptsSelect = document.getElementById('related-concepts');
    const saveConceptBtn = document.getElementById('save-concept-btn');
    const deleteConceptBtn = document.getElementById('delete-concept-btn');
    const clearFormBtn = document.getElementById('clear-form-btn');

    // --- 3. ESTADO DE LA APLICACIÓN Y CONFIGURACIÓN DE D3 ---
    let state = {
        concepts: [], // Almacenará los conceptos con sus etiquetas, notas y relaciones
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
        .force("link", d3.forceLink().id(d => d.id).distance(120))
        .force("charge", d3.forceManyBody().strength(-500))
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
            .select('id, name')
            .eq('user_id', state.user.id);

        if (error) {
            console.error('Error fetching thesauruses:', error);
            return;
        }
        state.thesauruses = data;
        renderThesaurusSelector();
        if (data.length > 0) {
            state.activeThesaurusId = data[0].id;
            await fetchAllConceptData();
        } else {
            // Si no hay tesauros, limpiar la vista
            state.concepts = [];
            updateAll();
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
        await fetchAllConceptData();
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
            text: "¡Se eliminará el tesauro y todos sus conceptos y relaciones!",
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
                await fetchAllConceptData();
                Swal.fire('Eliminado', 'El tesauro ha sido eliminado.', 'success');
            }
        }
    });

    thesaurusSelect.addEventListener('change', async () => {
        state.activeThesaurusId = thesaurusSelect.value;
        await fetchAllConceptData();
    });


    // --- 6. FUNCIONES DE GESTIÓN DE CONCEPTOS (SKOS) ---
    async function fetchAllConceptData() {
        if (!state.activeThesaurusId) {
            state.concepts = [];
            updateAll();
            return;
        }
        loader.classList.remove('hidden');
        try {
            // 1. Fetch all concepts for the thesaurus
            const { data: concepts, error: conceptsError } = await supabase
                .from('concepts')
                .select('id, created_at')
                .eq('thesaurus_id', state.activeThesaurusId);
            if (conceptsError) throw conceptsError;

            if (concepts.length === 0) {
                state.concepts = [];
                updateAll();
                return;
            }

            const conceptIds = concepts.map(c => c.id);

            // 2. Fetch all labels, notes, and relationships for those concepts
            const [labelsRes, notesRes, relationshipsRes] = await Promise.all([
                supabase.from('labels').select('*').in('concept_id', conceptIds),
                supabase.from('notes').select('*').in('concept_id', conceptIds),
                supabase.from('relationships').select('*').in('source_concept_id', conceptIds)
            ]);

            if (labelsRes.error) throw labelsRes.error;
            if (notesRes.error) throw notesRes.error;
            if (relationshipsRes.error) throw relationshipsRes.error;

            // 3. Assemble the complete concept objects
            const conceptMap = new Map(concepts.map(c => [c.id, { ...c, labels: [], notes: [], relationships: [] }]));

            labelsRes.data.forEach(label => {
                if (conceptMap.has(label.concept_id)) {
                    conceptMap.get(label.concept_id).labels.push(label);
                }
            });

            notesRes.data.forEach(note => {
                if (conceptMap.has(note.concept_id)) {
                    conceptMap.get(note.concept_id).notes.push(note);
                }
            });
            
            relationshipsRes.data.forEach(rel => {
                 if (conceptMap.has(rel.source_concept_id)) {
                    conceptMap.get(rel.source_concept_id).relationships.push(rel);
                }
            });

            state.concepts = Array.from(conceptMap.values());
            updateAll();

        } catch (error) {
            console.error('Error fetching concept data:', error);
            Swal.fire('Error', 'No se pudieron cargar los datos del tesauro.', 'error');
        } finally {
            loader.classList.add('hidden');
        }
    }

    async function saveConcept() {
        const conceptId = conceptIdInput.value || null;
        const thesaurusId = state.activeThesaurusId;
        if (!thesaurusId) {
            Swal.fire('Error', 'No hay un tesauro activo seleccionado.', 'error');
            return;
        }

        // Recopilar datos del formulario
        const prefLabel = { type: 'prefLabel', text: prefLabelInput.value.trim() };
        if (!prefLabel.text) {
            Swal.fire('Error', 'La Etiqueta Preferida es obligatoria.', 'error');
            return;
        }

        const altLabels = altLabelsInput.value.split('\n').map(t => t.trim()).filter(Boolean).map(text => ({ type: 'altLabel', text }));
        const hiddenLabels = hiddenLabelsInput.value.split('\n').map(t => t.trim()).filter(Boolean).map(text => ({ type: 'hiddenLabel', text }));
        const allLabels = [prefLabel, ...altLabels, ...hiddenLabels];

        const definition = { type: 'definition', text: definitionInput.value.trim() };
        const scopeNote = { type: 'scopeNote', text: scopeNoteInput.value.trim() };
        const example = { type: 'example', text: exampleInput.value.trim() };
        const allNotes = [definition, scopeNote, example].filter(n => n.text);
        
        const broaderConceptId = broaderConceptSelect.value || null;
        const relatedConceptIds = Array.from(relatedConceptsSelect.selectedOptions).map(opt => opt.value);

        try {
            let currentConceptId = conceptId;

            // --- Transacción para guardar el concepto ---
            // 1. Crear o identificar el concepto
            if (!currentConceptId) {
                // Crear nuevo concepto
                const { data, error } = await supabase
                    .from('concepts')
                    .insert({ thesaurus_id: thesaurusId })
                    .select('id')
                    .single();
                if (error) throw error;
                currentConceptId = data.id;
            }

            // 2. Borrar y re-insertar etiquetas y notas (más simple que hacer un diff)
            await Promise.all([
                supabase.from('labels').delete().eq('concept_id', currentConceptId),
                supabase.from('notes').delete().eq('concept_id', currentConceptId)
            ]);

            const labelsToInsert = allLabels.map(l => ({ concept_id: currentConceptId, label_type: l.type, label_text: l.text }));
            const notesToInsert = allNotes.map(n => ({ concept_id: currentConceptId, note_type: n.type, note_text: n.text }));

            const { error: labelsError } = await supabase.from('labels').insert(labelsToInsert);
            if (labelsError) throw labelsError;
            
            if (notesToInsert.length > 0) {
                const { error: notesError } = await supabase.from('notes').insert(notesToInsert);
                if (notesError) throw notesError;
            }

            // 3. Gestionar relaciones
            // Borrar relaciones existentes para este concepto
            await supabase.from('relationships').delete().or(`source_concept_id.eq.${currentConceptId},target_concept_id.eq.${currentConceptId}`);
            
            const relationshipsToInsert = [];
            // Relación broader/narrower
            if (broaderConceptId) {
                relationshipsToInsert.push({ source_concept_id: currentConceptId, target_concept_id: broaderConceptId, relationship_type: 'broader' });
                relationshipsToInsert.push({ source_concept_id: broaderConceptId, target_concept_id: currentConceptId, relationship_type: 'narrower' });
            }
            // Relaciones related
            relatedConceptIds.forEach(relatedId => {
                relationshipsToInsert.push({ source_concept_id: currentConceptId, target_concept_id: relatedId, relationship_type: 'related' });
                relationshipsToInsert.push({ source_concept_id: relatedId, target_concept_id: currentConceptId, relationship_type: 'related' });
            });

            if (relationshipsToInsert.length > 0) {
                 const { error: relsError } = await supabase.from('relationships').insert(relationshipsToInsert);
                 if (relsError) throw relsError;
            }

            Swal.fire('Éxito', 'Concepto guardado correctamente.', 'success');
            await fetchAllConceptData(); // Recargar todos los datos
            clearForm();

        } catch (error) {
            console.error('Error saving concept:', error);
            Swal.fire('Error', `No se pudo guardar el concepto: ${error.message}`, 'error');
        }
    }
    
    async function deleteConcept() {
        const conceptId = conceptIdInput.value;
        if (!conceptId) return;

        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "¡Se eliminará el concepto y todas sus relaciones asociadas!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, ¡elimínalo!'
        });

        if (result.isConfirmed) {
            try {
                // ON DELETE CASCADE se encarga del resto (labels, notes, relationships)
                const { error } = await supabase.from('concepts').delete().eq('id', conceptId);
                if (error) throw error;

                Swal.fire('Eliminado', 'El concepto ha sido eliminado.', 'success');
                await fetchAllConceptData();
                clearForm();
            } catch (error) {
                console.error('Error deleting concept:', error);
                Swal.fire('Error', 'No se pudo eliminar el concepto.', 'error');
            }
        }
    }


    // --- 7. FUNCIONES DE D3 (VISUALIZACIÓN) ---
    function updateGraph() {
        const nodes = state.concepts.map(c => ({
            id: c.id,
            name: c.labels.find(l => l.label_type === 'prefLabel')?.label_text || 'Sin Etiqueta',
            fullConcept: c
        }));
        
        const relationships = [];
        state.concepts.forEach(c => {
            c.relationships.forEach(r => {
                // Solo añadir una dirección de la relación para no duplicar líneas
                if (r.relationship_type === 'broader' || r.relationship_type === 'related' && r.source_concept_id < r.target_concept_id) {
                     relationships.push({
                        ...r,
                        source: r.source_concept_id,
                        target: r.target_concept_id
                    });
                }
            });
        });

        const node = nodeGroup.selectAll(".node")
            .data(nodes, d => d.id)
            .join(
                enter => {
                    const nodeEnter = enter.append("g").attr("class", "node");
                    nodeEnter.append("circle")
                        .attr("r", 10)
                        .attr("fill", "#2c5282")
                        .on("click", (event, d) => showConceptDetails(d.fullConcept))
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
                update => update.select('text').text(d => d.name), // Actualizar nombre si cambia
                exit => exit.remove()
            );

        const link = linkGroup.selectAll("line")
            .data(relationships, d => d.id)
            .join("line")
            .attr("class", d => `link ${d.relationship_type}`)
            .attr("stroke-width", 2);

        simulation.nodes(nodes);
        simulation.force("link").links(relationships);
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
        const scopeNote = d.fullConcept.notes.find(n => n.note_type === 'scopeNote')?.note_text;
        if (scopeNote) {
            tooltip.classList.remove('hidden');
            tooltip.innerHTML = scopeNote;
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
    function populateConceptDropdowns(currentConceptId = null) {
        const sortedConcepts = [...state.concepts].sort((a, b) => {
            const nameA = a.labels.find(l => l.label_type === 'prefLabel')?.label_text || '';
            const nameB = b.labels.find(l => l.label_type === 'prefLabel')?.label_text || '';
            return nameA.localeCompare(nameB);
        });

        const options = sortedConcepts
            .filter(c => c.id !== currentConceptId) // No puede ser su propio padre
            .map(c => {
                const prefLabel = c.labels.find(l => l.label_type === 'prefLabel')?.label_text;
                return `<option value="${c.id}">${prefLabel || c.id}</option>`;
            }).join('');

        broaderConceptSelect.innerHTML = `<option value="">-- Ninguno --</option>${options}`;
        relatedConceptsSelect.innerHTML = options;
    }

    function showConceptDetails(concept) {
        clearForm();
        conceptIdInput.value = concept.id;

        prefLabelInput.value = concept.labels.find(l => l.label_type === 'prefLabel')?.label_text || '';
        altLabelsInput.value = concept.labels.filter(l => l.label_type === 'altLabel').map(l => l.label_text).join('\n');
        hiddenLabelsInput.value = concept.labels.filter(l => l.label_type === 'hiddenLabel').map(l => l.label_text).join('\n');

        definitionInput.value = concept.notes.find(n => n.note_type === 'definition')?.note_text || '';
        scopeNoteInput.value = concept.notes.find(n => n.note_type === 'scopeNote')?.note_text || '';
        exampleInput.value = concept.notes.find(n => n.note_type === 'example')?.note_text || '';
        
        populateConceptDropdowns(concept.id);

        // Seleccionar relaciones
        const broaderRel = concept.relationships.find(r => r.relationship_type === 'broader');
        broaderConceptSelect.value = broaderRel ? broaderRel.target_concept_id : '';

        const relatedIds = concept.relationships.filter(r => r.relationship_type === 'related').map(r => r.target_concept_id);
        Array.from(relatedConceptsSelect.options).forEach(opt => {
            opt.selected = relatedIds.includes(opt.value);
        });

        deleteConceptBtn.disabled = false;
    }

    function clearForm() {
        conceptForm.reset();
        conceptIdInput.value = '';
        relatedConceptsSelect.selectedIndex = -1; // Deseleccionar 'multiple' select
        deleteConceptBtn.disabled = true;
        populateConceptDropdowns();
    }

    function updateAll() {
        updateGraph();
        populateConceptDropdowns();
    }

    // --- 9. MANEJADORES DE EVENTOS ---
    conceptForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveConcept();
    });
    
    deleteConceptBtn.addEventListener('click', deleteConcept);
    clearFormBtn.addEventListener('click', clearForm);

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        d3.selectAll(".node")
            .classed("highlighted", d => {
                if (!query) return false;
                const prefLabel = d.fullConcept.labels.find(l => l.label_type === 'prefLabel')?.label_text.toLowerCase() || '';
                const altLabels = d.fullConcept.labels.filter(l => l.label_type === 'altLabel').map(l => l.label_text.toLowerCase());
                return prefLabel.includes(query) || altLabels.some(l => l.includes(query));
            });
    });

    // --- 10. IMPORTACIÓN / EXPORTACIÓN (SKOS-based) ---
    exportBtn.addEventListener('click', () => {
        if (state.concepts.length === 0) {
            Swal.fire('Info', 'No hay conceptos para exportar.', 'info');
            return;
        }
        // Estructura de exportación más limpia
        const dataToExport = {
            concepts: state.concepts.map(c => ({
                id: c.id,
                labels: c.labels.map(({ concept_id, ...rest }) => rest),
                notes: c.notes.map(({ concept_id, ...rest }) => rest),
                relationships: c.relationships.map(({ id, created_at, ...rest }) => rest)
            }))
        };

        const dataStr = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `thesaurus_skos_export_${state.activeThesaurusId}.json`;
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
                if (!data.concepts || !Array.isArray(data.concepts)) throw new Error('Formato de archivo inválido. Se esperaba un objeto con una propiedad "concepts".');

                const result = await Swal.fire({
                    title: '¿Estás seguro?',
                    text: `Vas a importar ${data.concepts.length} conceptos al tesauro actual. Esto no eliminará los conceptos existentes. ¿Continuar?`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Sí, ¡importar!'
                });

                if (!result.isConfirmed) return;
                
                loader.classList.remove('hidden');

                for (const concept of data.concepts) {
                    // 1. Insertar el concepto
                    const { data: newConcept, error: conceptError } = await supabase
                        .from('concepts')
                        .insert({ thesaurus_id: state.activeThesaurusId })
                        .select('id')
                        .single();
                    if (conceptError) throw conceptError;

                    // 2. Insertar labels y notes
                    if (concept.labels && concept.labels.length > 0) {
                        const labelsToInsert = concept.labels.map(l => ({ ...l, concept_id: newConcept.id }));
                        await supabase.from('labels').insert(labelsToInsert);
                    }
                    if (concept.notes && concept.notes.length > 0) {
                        const notesToInsert = concept.notes.map(n => ({ ...n, concept_id: newConcept.id }));
                        await supabase.from('notes').insert(notesToInsert);
                    }
                    // NOTA: Las relaciones no se importan en este flujo simplificado para evitar conflictos de ID.
                    // Una importación completa requeriría mapear los IDs antiguos a los nuevos.
                }

                Swal.fire('¡Éxito!', 'Importación completada. Las relaciones no se importan en este proceso.', 'success');
                await fetchAllConceptData();
            } catch (error) {
                console.error('Error importing data:', error);
                Swal.fire('Error', `Error al importar el archivo: ${error.message}`, 'error');
            } finally {
                 loader.classList.add('hidden');
                 importInput.value = '';
            }
        };
        reader.readAsText(file);
    });


    // --- 11. INICIALIZACIÓN ---
    async function initialize() {
        await fetchUserThesauruses();
    }

    checkUserSession();
});
