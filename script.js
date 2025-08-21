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
    const userEmail = document.getElementById('user-email');
    
    // Elementos del gestor de tesauros
    const thesaurusSelect = document.getElementById('thesaurus-select');
    const newThesaurusForm = document.getElementById('new-thesaurus-form');
    const newThesaurusTitleInput = document.getElementById('new-thesaurus-title');
    const renameThesaurusBtn = document.getElementById('rename-thesaurus-btn');
    const deleteThesaurusBtn = document.getElementById('delete-thesaurus-btn');
    const thesaurusDetailsForm = document.getElementById('thesaurus-details-form');

    // Elementos del formulario de detalles del tesauro
    const thesaurusUriInput = document.getElementById('thesaurus-uri');
    const thesaurusAuthorInput = document.getElementById('thesaurus-author');
    const thesaurusVersionInput = document.getElementById('thesaurus-version');
    const thesaurusLanguageInput = document.getElementById('thesaurus-language');
    const thesaurusLicenseInput = document.getElementById('thesaurus-license');
    const thesaurusPublishedAtInput = document.getElementById('thesaurus-published_at');
    const thesaurusDescriptionInput = document.getElementById('thesaurus-description');

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

    // Elementos del Modal
    const conceptModal = document.getElementById('concept-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalBody = document.getElementById('modal-body');
    const modalTitle = document.getElementById('modal-title');

    // --- 3. ESTADO DE LA APLICACIÓN Y CONFIGURACIÓN DE D3 ---
    let state = {
        concepts: [],
        relationships: [], // Fuente de verdad única para las relaciones
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
            userEmail.textContent = state.user.email;
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
            renderThesaurusDetails(data[0]);
            await fetchAllConceptData();
        } else {
            state.concepts = [];
            state.relationships = [];
            updateAll();
        }
    }

    function renderThesaurusSelector() {
        thesaurusSelect.innerHTML = state.thesauruses
            .map(t => `<option value="${t.id}">${t.title}</option>`)
            .join('');
    }

    function renderThesaurusDetails(thesaurus) {
        if (!thesaurus) {
            thesaurusDetailsForm.classList.add('hidden');
            return;
        }
        thesaurusDetailsForm.classList.remove('hidden');
        thesaurusUriInput.value = thesaurus.uri || '';
        thesaurusAuthorInput.value = thesaurus.author || '';
        thesaurusVersionInput.value = thesaurus.version || '';
        thesaurusLanguageInput.value = thesaurus.language || '';
        thesaurusLicenseInput.value = thesaurus.license || '';
        thesaurusPublishedAtInput.value = thesaurus.published_at ? thesaurus.published_at.split('T')[0] : '';
        thesaurusDescriptionInput.value = thesaurus.description || '';
    }

    newThesaurusForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = newThesaurusTitleInput.value;
        const { data, error } = await supabase
            .from('thesauruses')
            .insert({ title, user_id: state.user.id })
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
        renderThesaurusDetails(data);
        await fetchAllConceptData();
        newThesaurusTitleInput.value = '';
    });
    
    renameThesaurusBtn.addEventListener('click', async () => {
        const thesaurusId = state.activeThesaurusId;
        if (!thesaurusId) return;

        const { value: newTitle } = await Swal.fire({
            title: 'Renombrar Tesauro',
            input: 'text',
            inputValue: state.thesauruses.find(t => t.id === thesaurusId).title,
            showCancelButton: true,
            inputValidator: (value) => {
                if (!value) {
                    return '¡Necesitas escribir un nombre!'
                }
            }
        });

        if (newTitle) {
            const { error } = await supabase
                .from('thesauruses')
                .update({ title: newTitle })
                .eq('id', thesaurusId);

            if (error) {
                Swal.fire('Error', 'No se pudo renombrar el tesauro.', 'error');
            } else {
                const index = state.thesauruses.findIndex(t => t.id === thesaurusId);
                state.thesauruses[index].title = newTitle;
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
                    renderThesaurusDetails(state.thesauruses[0]);
                } else {
                    state.activeThesaurusId = null;
                    renderThesaurusDetails(null);
                }
                await fetchAllConceptData();
                Swal.fire('Eliminado', 'El tesauro ha sido eliminado.', 'success');
            }
        }
    });

    thesaurusSelect.addEventListener('change', async () => {
        state.activeThesaurusId = thesaurusSelect.value;
        const selectedThesaurus = state.thesauruses.find(t => t.id == state.activeThesaurusId);
        renderThesaurusDetails(selectedThesaurus);
        await fetchAllConceptData();
    });

    thesaurusDetailsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const thesaurusId = state.activeThesaurusId;
        if (!thesaurusId) return;

        const updatedDetails = {
            uri: thesaurusUriInput.value,
            author: thesaurusAuthorInput.value,
            version: thesaurusVersionInput.value,
            language: thesaurusLanguageInput.value,
            license: thesaurusLicenseInput.value,
            published_at: thesaurusPublishedAtInput.value || null,
            description: thesaurusDescriptionInput.value
        };

        const { error } = await supabase
            .from('thesauruses')
            .update(updatedDetails)
            .eq('id', thesaurusId);

        if (error) {
            Swal.fire('Error', 'No se pudieron guardar los detalles.', 'error');
        } else {
            const index = state.thesauruses.findIndex(t => t.id === thesaurusId);
            state.thesauruses[index] = { ...state.thesauruses[index], ...updatedDetails };
            Swal.fire('Éxito', 'Detalles del tesauro guardados.', 'success');
        }
    });

    document.querySelectorAll('.collapsible-header').forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const toggle = header.querySelector('.toggle-collapse');
            content.classList.toggle('hidden');
            toggle.textContent = content.classList.contains('hidden') ? '+' : '-';
        });
    });


    // --- 6. FUNCIONES DE GESTIÓN DE CONCEPTOS (SKOS) ---
    async function fetchAllConceptData() {
        if (!state.activeThesaurusId) {
            state.concepts = [];
            state.relationships = [];
            updateAll();
            return;
        }
        loader.classList.remove('hidden');
        try {
            const { data: concepts, error: conceptsError } = await supabase
                .from('concepts')
                .select('id, created_at')
                .eq('thesaurus_id', state.activeThesaurusId);
            if (conceptsError) throw conceptsError;

            if (concepts.length === 0) {
                state.concepts = [];
                state.relationships = [];
                updateAll();
                return;
            }

            const conceptIds = concepts.map(c => c.id);

            const [labelsRes, notesRes, relationshipsRes] = await Promise.all([
                supabase.from('labels').select('*').in('concept_id', conceptIds),
                supabase.from('notes').select('*').in('concept_id', conceptIds),
                supabase.from('relationships').select('*').or(`source_concept_id.in.(${conceptIds.join(',')}),target_concept_id.in.(${conceptIds.join(',')})`)
            ]);

            if (labelsRes.error) throw labelsRes.error;
            if (notesRes.error) throw notesRes.error;
            if (relationshipsRes.error) throw relationshipsRes.error;

            state.relationships = relationshipsRes.data;
            const conceptMap = new Map(concepts.map(c => [c.id, { ...c, labels: [], notes: [] }]));

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

            if (!currentConceptId) {
                const { data, error } = await supabase
                    .from('concepts')
                    .insert({ thesaurus_id: thesaurusId })
                    .select('id')
                    .single();
                if (error) throw error;
                currentConceptId = data.id;
            }

            await Promise.all([
                supabase.from('labels').delete().eq('concept_id', currentConceptId),
                supabase.from('notes').delete().eq('concept_id', currentConceptId)
            ]);

            const labelsToInsert = allLabels.map(l => ({ concept_id: currentConceptId, label_type: l.type, label_text: l.text }));
            const notesToInsert = allNotes.map(n => ({ concept_id: currentConceptId, note_type: n.type, note_text: n.text }));

            await supabase.from('labels').insert(labelsToInsert);
            if (notesToInsert.length > 0) {
                await supabase.from('notes').insert(notesToInsert);
            }

            await supabase.from('relationships').delete().or(`source_concept_id.eq.${currentConceptId},target_concept_id.eq.${currentConceptId}`);
            
            const relationshipsToInsert = [];
            if (broaderConceptId) {
                relationshipsToInsert.push({ source_concept_id: currentConceptId, target_concept_id: broaderConceptId, relationship_type: 'broader' });
                relationshipsToInsert.push({ source_concept_id: broaderConceptId, target_concept_id: currentConceptId, relationship_type: 'narrower' });
            }
            relatedConceptIds.forEach(relatedId => {
                relationshipsToInsert.push({ source_concept_id: currentConceptId, target_concept_id: relatedId, relationship_type: 'related' });
                relationshipsToInsert.push({ source_concept_id: relatedId, target_concept_id: currentConceptId, relationship_type: 'related' });
            });

            if (relationshipsToInsert.length > 0) {
                 await supabase.from('relationships').insert(relationshipsToInsert);
            }

            Swal.fire('Éxito', 'Concepto guardado correctamente.', 'success');
            await fetchAllConceptData();
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
    let node;
    let link;

    simulation.on("tick", () => {
        if (link) {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
        }
        if (node) {
            node
                .attr("transform", d => `translate(${d.x},${d.y})`);
        }
    });

    function updateGraph() {
        const nodes = state.concepts.map(c => ({
            id: c.id,
            name: c.labels.find(l => l.label_type === 'prefLabel')?.label_text || 'Sin Etiqueta',
            fullConcept: c
        }));
        
        const nodeIds = new Set(nodes.map(n => n.id));
        const links = state.relationships
            .filter(r => nodeIds.has(r.source_concept_id) && nodeIds.has(r.target_concept_id))
            .map(r => ({ ...r, source: r.source_concept_id, target: r.target_concept_id }));

        // === UPDATE THE SIMULATION ===
        simulation.nodes(nodes);
        simulation.force("link").links(links);

        // === UPDATE THE VISUAL ELEMENTS ===
        // LINKS
        link = linkGroup
            .selectAll("line")
            .data(links, d => d.id);
        
        link.exit().remove();
        
        link = link.enter().append("line")
            .attr("class", d => `link ${d.relationship_type}`)
            .attr("stroke-width", 2)
            .merge(link);

        // NODES
        node = nodeGroup
            .selectAll(".node")
            .data(nodes, d => d.id);
        
        node.exit().remove();

        const nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        nodeEnter.append("circle")
            .attr("r", 10)
            .attr("fill", "#2c5282")
            .on("click", (event, d) => {
                if (event.shiftKey) {
                    showConceptModal(d.fullConcept);
                } else {
                    showConceptDetails(d.fullConcept);
                }
            })
            .on("mouseover", showTooltip)
            .on("mousemove", moveTooltip)
            .on("mouseout", hideTooltip);

        nodeEnter.append("text")
            .attr("dy", -12);

        node = nodeEnter.merge(node);
        node.select("text").text(d => d.name);

        simulation.alpha(1).restart();
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
            .filter(c => c.id !== currentConceptId)
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

        const broaderRel = state.relationships.find(r => r.source_concept_id === concept.id && r.relationship_type === 'broader');
        broaderConceptSelect.value = broaderRel ? broaderRel.target_concept_id : '';

        const relatedIds = state.relationships
            .filter(r => r.source_concept_id === concept.id && r.relationship_type === 'related')
            .map(r => r.target_concept_id);
        Array.from(relatedConceptsSelect.options).forEach(opt => {
            opt.selected = relatedIds.includes(opt.value);
        });

        deleteConceptBtn.disabled = false;
    }

    function showConceptModal(concept) {
        const getLabel = (type) => concept.labels.find(l => l.label_type === type)?.label_text || 'N/A';
        const getNote = (type) => concept.notes.find(n => n.note_type === type)?.note_text || 'No disponible';
        const getLabels = (type) => {
            const labels = concept.labels.filter(l => l.label_type === type).map(l => `<li>${l.label_text}</li>`).join('');
            return labels || '<li>Ninguna</li>';
        };

        const getConceptName = (conceptId) => {
            const foundConcept = state.concepts.find(c => c.id === conceptId);
            return foundConcept ? (foundConcept.labels.find(l => l.label_type === 'prefLabel')?.label_text || 'Concepto sin nombre') : 'Concepto no encontrado';
        };

        const broaderRel = state.relationships.find(r => r.source_concept_id === concept.id && r.relationship_type === 'broader');
        const narrowerRels = state.relationships.filter(r => r.source_concept_id === concept.id && r.relationship_type === 'narrower').map(r => `<li>${getConceptName(r.target_concept_id)}</li>`).join('');
        const relatedRels = state.relationships.filter(r => r.source_concept_id === concept.id && r.relationship_type === 'related').map(r => `<li>${getConceptName(r.target_concept_id)}</li>`).join('');

        modalTitle.textContent = getLabel('prefLabel');
        modalBody.innerHTML = `
            <div class="modal-section">
                <h4>Definición</h4>
                <p>${getNote('definition')}</p>
            </div>
            <div class="modal-section">
                <h4>Nota de Alcance</h4>
                <p>${getNote('scopeNote')}</p>
            </div>
            <div class="modal-section">
                <h4>Ejemplo de Uso</h4>
                <p>${getNote('example')}</p>
            </div>
            <div class="modal-section">
                <h4>Etiquetas Alternativas (Sinónimos)</h4>
                <ul>${getLabels('altLabel')}</ul>
            </div>
            <div class="modal-section">
                <h4>Relaciones Semánticas</h4>
                <p><strong>Término Genérico (Más amplio):</strong> ${broaderRel ? getConceptName(broaderRel.target_concept_id) : 'Ninguno'}</p>
                
                <h4>Términos Específicos (Más estrechos):</h4>
                <ul>${narrowerRels || '<li>Ninguno</li>'}</ul>

                <h4>Términos Relacionados:</h4>
                <ul>${relatedRels || '<li>Ninguno</li>'}</ul>
            </div>
        `;

        conceptModal.classList.remove('hidden');
    }

    function clearForm() {
        conceptForm.reset();
        conceptIdInput.value = '';
        relatedConceptsSelect.selectedIndex = -1;
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

    // Manejadores del modal
    modalCloseBtn.addEventListener('click', () => conceptModal.classList.add('hidden'));
    conceptModal.addEventListener('click', (e) => {
        if (e.target === conceptModal) { // Cierra el modal si se hace clic en el overlay
            conceptModal.classList.add('hidden');
        }
    });

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
        
        const dataToExport = {
            concepts: state.concepts,
            relationships: state.relationships
        };

        const dataStr = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.download = `thesaurus_skos_export_${state.activeThesaurusId}.json`;
        a.href = url;
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
                if (!data.concepts || !data.relationships) throw new Error('Formato de archivo inválido.');

                const result = await Swal.fire({
                    title: '¿Estás seguro?',
                    text: `Vas a importar ${data.concepts.length} conceptos y ${data.relationships.length} relaciones. Esto puede crear duplicados si ya existen.`, 
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Sí, ¡importar!'
                });

                if (!result.isConfirmed) return;
                
                loader.classList.remove('hidden');

                const conceptIdMap = new Map();
                for (const concept of data.concepts) {
                    const oldId = concept.id;
                    const { data: newConcept, error } = await supabase
                        .from('concepts')
                        .insert({ thesaurus_id: state.activeThesaurusId })
                        .select('id')
                        .single();
                    if (error) throw error;
                    conceptIdMap.set(oldId, newConcept.id);

                    if (concept.labels) {
                        const labelsToInsert = concept.labels.map(l => ({ ...l, concept_id: newConcept.id, id: undefined }));
                        await supabase.from('labels').insert(labelsToInsert);
                    }
                    if (concept.notes) {
                        const notesToInsert = concept.notes.map(n => ({ ...n, concept_id: newConcept.id, id: undefined }));
                        await supabase.from('notes').insert(notesToInsert);
                    }
                }

                if (data.relationships) {
                    const relsToInsert = data.relationships.map(r => ({
                        ...r,
                        id: undefined,
                        source_concept_id: conceptIdMap.get(r.source_concept_id),
                        target_concept_id: conceptIdMap.get(r.target_concept_id)
                    })).filter(r => r.source_concept_id && r.target_concept_id);
                    await supabase.from('relationships').insert(relsToInsert);
                }

                Swal.fire('¡Éxito!', 'Importación completada.', 'success');
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
