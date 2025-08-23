document.addEventListener("DOMContentLoaded", () => {
  // --- 1. CONFIGURACIÓN DE SUPABASE ---
  const SUPABASE_URL = "https://ljxaakuiepxxdqsqcpsc.supabase.co";
  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqeGFha3VpZXB4eGRxc3FjcHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MzQ3NzUsImV4cCI6MjA3MTIxMDc3NX0.q7jfHERVexiluOWwwetf-NSYZeRPg-JJfcs77Zug5ys";
  const supabase = self.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // --- 2. SELECCIÓN DE ELEMENTOS DEL DOM ---
  const loader = document.getElementById("loader");
  const searchInput = document.getElementById("search-input");
  const exportBtn = document.getElementById("export-json-btn");
  const importInput = document.getElementById("import-json-input");
  const tooltip = document.getElementById("tooltip");
  const visPanel = document.getElementById("visualization-panel");
  const logoutBtn = document.getElementById("logout-btn");
  const userEmail = document.getElementById("user-email");
  const summaryBtn = document.getElementById("summary-btn");
  const exportSummaryBtn = document.getElementById("export-summary-btn");

  // Elementos del gestor de tesauros
  const thesaurusSelect = document.getElementById("thesaurus-select");
  const newThesaurusForm = document.getElementById("new-thesaurus-form");
  const newThesaurusTitleInput = document.getElementById("new-thesaurus-title");
  const renameThesaurusBtn = document.getElementById("rename-thesaurus-btn");
  const deleteThesaurusBtn = document.getElementById("delete-thesaurus-btn");
  const thesaurusDetailsForm = document.getElementById(
    "thesaurus-details-form"
  );

  // Elementos del formulario de detalles del tesauro
  const thesaurusUriInput = document.getElementById("thesaurus-uri");
  const thesaurusAuthorInput = document.getElementById("thesaurus-author");
  const thesaurusVersionInput = document.getElementById("thesaurus-version");
  const thesaurusLanguageInput = document.getElementById("thesaurus-language");
  const thesaurusLicenseInput = document.getElementById("thesaurus-license");
  const thesaurusPublishedAtInput = document.getElementById(
    "thesaurus-published_at"
  );
  const thesaurusDescriptionInput = document.getElementById(
    "thesaurus-description"
  );

  // Elementos del formulario de conceptos (SKOS)
  const conceptForm = document.getElementById("concept-form");
  const conceptIdInput = document.getElementById("concept-id");
  const prefLabelInput = document.getElementById("pref-label");
  const altLabelsInput = document.getElementById("alt-labels");
  const hiddenLabelsInput = document.getElementById("hidden-labels");
  const definitionInput = document.getElementById("definition");
  const scopeNoteInput = document.getElementById("scope-note");
  const exampleInput = document.getElementById("example");
  const broaderConceptSelect = document.getElementById("broader-concept");
  const relatedConceptsSelect = document.getElementById("related-concepts");
  const saveConceptBtn = document.getElementById("save-concept-btn");
  const deleteConceptBtn = document.getElementById("delete-concept-btn");
  const clearFormBtn = document.getElementById("clear-form-btn");

  // Elementos del Modal
  const conceptModal = document.getElementById("concept-modal");
  const modalCloseBtn = document.getElementById("modal-close-btn");
  const modalBody = document.getElementById("modal-body");
  const modalTitle = document.getElementById("modal-title");

  // Elementos del Modal de Resumen
  const summaryModal = document.getElementById("summary-modal");
  const summaryModalTitle = document.getElementById("summary-modal-title");
  const summaryModalBody = document.getElementById("summary-modal-body");
  const summaryModalCloseBtn = document.getElementById(
    "summary-modal-close-btn"
  );

  // --- 3. ESTADO DE LA APLICACIÓN Y CONFIGURACIÓN DE D3 ---
  let state = {
    concepts: [],
    relationships: [], // Fuente de verdad única para las relaciones
    thesauruses: [],
    activeThesaurusId: null,
    user: null,
  };

  const width = visPanel.clientWidth;
  const height = visPanel.clientHeight;

  const svg = d3
    .select("#visualization-panel")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const simulation = d3
    .forceSimulation()
    .force(
      "link",
      d3
        .forceLink()
        .id((d) => d.id)
        .distance(120)
    )
    .force("charge", d3.forceManyBody().strength(-500))
    .force("center", d3.forceCenter(width / 2, height / 2));

  let linkGroup = svg.append("g").attr("class", "links");
  let nodeGroup = svg.append("g").attr("class", "nodes");

  // --- 4. FUNCIONES DE AUTENTICACIÓN Y GESTIÓN DE USUARIO ---
  async function checkUserSession() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      // Redirección automática según entorno
      const isGithubPages = window.location.hostname.endsWith("github.io");
      if (isGithubPages) {
        console.log("Redirigiendo a la página principal del repositorio");
        const repo = window.location.pathname.split("/")[1];
        window.location.href = `/${repo}/main.html`;
      } else {
        console.log("Redirigiendo a la página principal");
        window.location.href = "./main.html";
      }
    } else {
      state.user = session.user;
      userEmail.textContent = state.user.email;
      initialize();
    }
  }

  logoutBtn.addEventListener("click", async () => {
    await supabase.auth.signOut();
    // Redirección automática según entorno
    const isGithubPages = window.location.hostname.endsWith("github.io");
    if (isGithubPages) {
      const repo = window.location.pathname.split("/")[1];
      window.location.href = `/${repo}/index.html`;
    } else {
      window.location.href = "./index.html";
    }
  });

  // --- 5. FUNCIONES DE GESTIÓN DE TESAUROS ---
  async function fetchUserThesauruses() {
    const { data, error } = await supabase
      .from("thesauruses")
      .select("*")
      .eq("user_id", state.user.id);

    if (error) {
      console.error("Error fetching thesauruses:", error);
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
      .map((t) => `<option value="${t.id}">${t.title}</option>`)
      .join("");
  }

  function renderThesaurusDetails(thesaurus) {
    if (!thesaurus) {
      thesaurusDetailsForm.classList.add("hidden");
      return;
    }
    thesaurusDetailsForm.classList.remove("hidden");
    thesaurusUriInput.value = thesaurus.uri || "";
    thesaurusAuthorInput.value = thesaurus.author || "";
    thesaurusVersionInput.value = thesaurus.version || "";
    thesaurusLanguageInput.value = thesaurus.language || "";
    thesaurusLicenseInput.value = thesaurus.license || "";
    thesaurusPublishedAtInput.value = thesaurus.published_at
      ? thesaurus.published_at.split("T")[0]
      : "";
    thesaurusDescriptionInput.value = thesaurus.description || "";
  }

  newThesaurusForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = newThesaurusTitleInput.value;
    const { data, error } = await supabase
      .from("thesauruses")
      .insert({ title, user_id: state.user.id })
      .select()
      .single();

    if (error) {
      Swal.fire("Error", "No se pudo crear el tesauro.", "error");
      return;
    }
    state.thesauruses.push(data);
    renderThesaurusSelector();
    thesaurusSelect.value = data.id;
    state.activeThesaurusId = data.id;
    renderThesaurusDetails(data);
    await fetchAllConceptData();
    newThesaurusTitleInput.value = "";
  });

  renameThesaurusBtn.addEventListener("click", async () => {
    const thesaurusId = state.activeThesaurusId;
    if (!thesaurusId) return;

    const { value: newTitle } = await Swal.fire({
      title: "Renombrar Tesauro",
      input: "text",
      inputValue: state.thesauruses.find((t) => t.id === thesaurusId).title,
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "¡Necesitas escribir un nombre!";
        }
      },
    });

    if (newTitle) {
      const { error } = await supabase
        .from("thesauruses")
        .update({ title: newTitle })
        .eq("id", thesaurusId);

      if (error) {
        Swal.fire("Error", "No se pudo renombrar el tesauro.", "error");
      } else {
        const index = state.thesauruses.findIndex((t) => t.id === thesaurusId);
        state.thesauruses[index].title = newTitle;
        renderThesaurusSelector();
        Swal.fire("Éxito", "Tesauro renombrado.", "success");
      }
    }
  });

  deleteThesaurusBtn.addEventListener("click", async () => {
    const thesaurusId = state.activeThesaurusId;
    if (!thesaurusId) return;

    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "¡Se eliminará el tesauro y todos sus conceptos y relaciones!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, ¡elimínalo!",
    });

    if (result.isConfirmed) {
      const { error } = await supabase
        .from("thesauruses")
        .delete()
        .eq("id", thesaurusId);

      if (error) {
        Swal.fire("Error", "No se pudo eliminar el tesauro.", "error");
      } else {
        state.thesauruses = state.thesauruses.filter(
          (t) => t.id !== thesaurusId
        );
        renderThesaurusSelector();
        if (state.thesauruses.length > 0) {
          state.activeThesaurusId = state.thesauruses[0].id;
          renderThesaurusDetails(state.thesauruses[0]);
        } else {
          state.activeThesaurusId = null;
          renderThesaurusDetails(null);
        }
        await fetchAllConceptData();
        Swal.fire("Eliminado", "El tesauro ha sido eliminado.", "success");
      }
    }
  });

  thesaurusSelect.addEventListener("change", async () => {
    state.activeThesaurusId = thesaurusSelect.value;
    const selectedThesaurus = state.thesauruses.find(
      (t) => t.id == state.activeThesaurusId
    );
    renderThesaurusDetails(selectedThesaurus);
    await fetchAllConceptData();
  });

  thesaurusDetailsForm.addEventListener("submit", async (e) => {
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
      description: thesaurusDescriptionInput.value,
    };

    const { error } = await supabase
      .from("thesauruses")
      .update(updatedDetails)
      .eq("id", thesaurusId);

    if (error) {
      Swal.fire("Error", "No se pudieron guardar los detalles.", "error");
    } else {
      const index = state.thesauruses.findIndex((t) => t.id === thesaurusId);
      state.thesauruses[index] = {
        ...state.thesauruses[index],
        ...updatedDetails,
      };
      Swal.fire("Éxito", "Detalles del tesauro guardados.", "success");
    }
  });

  document.querySelectorAll(".collapsible-header").forEach((header) => {
    header.addEventListener("click", () => {
      const content = header.nextElementSibling;
      const toggle = header.querySelector(".toggle-collapse");
      content.classList.toggle("hidden");
      toggle.textContent = content.classList.contains("hidden") ? "+" : "-";
    });
  });

  function generateThesaurusSummary() {
    let summary = "";
    const concepts = state.concepts;
    const relationships = state.relationships;
    const thesaurus = state.thesauruses.find(
      (t) => t.id === state.activeThesaurusId
    );

    if (thesaurus) {
      summary += `<div class="summary-thesaurus-details">
`;
      summary += `<ul>
`;
      if (thesaurus.author)
        summary += `<li><strong>Autor:</strong> ${thesaurus.author}</li>
`;
      if (thesaurus.version)
        summary += `<li><strong>Versión:</b> ${thesaurus.version}</li>
`;
      if (thesaurus.language)
        summary += `<li><strong>Idioma:</strong> ${thesaurus.language}</li>
`;
      if (thesaurus.license)
        summary += `<li><strong>Licencia:</strong> ${thesaurus.license}</li>
`;
      if (thesaurus.published_at)
        summary += `<li><strong>Fecha de Publicación:</strong> ${
          thesaurus.published_at.split("T")[0]
        }</li>
`;
      summary += `</ul>
`;
      summary += `<h3>Descripción</h3>
`;
      summary += `<p>${thesaurus.description || ""}</p>
`;
      summary += `</div>
`;
    }

    summary += `<h2>Conceptos</h2>
`;

    concepts.forEach((concept, index) => {
      const prefLabel =
        concept.labels.find((l) => l.label_type === "prefLabel")?.label_text ||
        "Sin Etiqueta";
      summary += `<div class="summary-concept">
`;
      summary += `<h3>${prefLabel}</h3>
`;

      summary += '<table class="summary-table">';

      const altLabels = concept.labels
        .filter((l) => l.label_type === "altLabel")
        .map((l) => l.label_text)
        .join(", ");
      if (altLabels) {
        summary += `<tr><td class="summary-label">Etiquetas Alternativas</td><td>${altLabels}</td></tr>`;
      }

      const hiddenLabels = concept.labels
        .filter((l) => l.label_type === "hiddenLabel")
        .map((l) => l.label_text)
        .join(", ");
      if (hiddenLabels) {
        summary += `<tr><td class="summary-label">Etiquetas Ocultas</td><td>${hiddenLabels}</td></tr>`;
      }

      const definition = concept.notes.find(
        (n) => n.note_type === "definition"
      )?.note_text;
      if (definition) {
        summary += `<tr><td class="summary-label">Definición</td><td>${definition}</td></tr>`;
      }

      const scopeNote = concept.notes.find(
        (n) => n.note_type === "scopeNote"
      )?.note_text;
      if (scopeNote) {
        summary += `<tr><td class="summary-label">Nota de Alcance</td><td>${scopeNote}</td></tr>`;
      }

      const example = concept.notes.find(
        (n) => n.note_type === "example"
      )?.note_text;
      if (example) {
        summary += `<tr><td class="summary-label">Ejemplo</td><td>${example}</td></tr>`;
      }

      const broader = relationships.find(
        (r) =>
          r.source_concept_id === concept.id &&
          r.relationship_type === "broader"
      );
      if (broader) {
        const broaderConcept = concepts.find(
          (c) => c.id === broader.target_concept_id
        );
        if (broaderConcept) {
          const broaderLabel =
            broaderConcept.labels.find((l) => l.label_type === "prefLabel")
              ?.label_text || "Sin Etiqueta";
          summary += `<tr><td class="summary-label">Término Genérico</td><td>${broaderLabel}</td></tr>`;
        }
      }

      const narrower = relationships.filter(
        (r) =>
          r.source_concept_id === concept.id &&
          r.relationship_type === "narrower"
      );
      if (narrower.length > 0) {
        const narrowerLabels = narrower
          .map((r) => {
            const narrowerConcept = concepts.find(
              (c) => c.id === r.target_concept_id
            );
            return narrowerConcept
              ? narrowerConcept.labels.find((l) => l.label_type === "prefLabel")
                  ?.label_text || "Sin Etiqueta"
              : "";
          })
          .filter(Boolean)
          .join(", ");
        if (narrowerLabels) {
          summary += `<tr><td class="summary-label">Términos Específicos</td><td>${narrowerLabels}</td></tr>`;
        }
      }

      const related = relationships.filter(
        (r) =>
          r.source_concept_id === concept.id &&
          r.relationship_type === "related"
      );
      if (related.length > 0) {
        const relatedLabels = related
          .map((r) => {
            const relatedConcept = concepts.find(
              (c) => c.id === r.target_concept_id
            );
            return relatedConcept
              ? relatedConcept.labels.find((l) => l.label_type === "prefLabel")
                  ?.label_text || "Sin Etiqueta"
              : "";
          })
          .filter(Boolean)
          .join(", ");
        if (relatedLabels) {
          summary += `<tr><td class="summary-label">Términos Relacionados</td><td>${relatedLabels}</td></tr>`;
        }
      }

      summary += "</table>";
      summary += `</div>`;

      if (index < concepts.length - 1) {
        summary += '<hr class="summary-divider">';
      }
    });

    return summary;
  }

  function showThesaurusSummary() {
    const thesaurus = state.thesauruses.find(
      (t) => t.id === state.activeThesaurusId
    );
    if (thesaurus) {
      summaryModalTitle.textContent = thesaurus.title;
    } else {
      summaryModalTitle.textContent = "Resumen del Tesauro";
    }
    const summary = generateThesaurusSummary();
    summaryModalBody.innerHTML = summary;
    summaryModal.classList.remove("hidden");
  }

  summaryBtn.addEventListener("click", showThesaurusSummary);
  summaryModalCloseBtn.addEventListener("click", () =>
    summaryModal.classList.add("hidden")
  );
  summaryModal.addEventListener("click", (e) => {
    if (e.target === summaryModal) {
      // Cierra el modal si se hace clic en el overlay
      summaryModal.classList.add("hidden");
    }
  });

  // --- Función para exportar el resumen a PDF ---
  async function exportSummaryToPdf() {
    try {
      // Inicializar jsPDF
      const doc = new jspdf.jsPDF();
      const margin = 18; // margen superior ampliado
      let yOffset = margin;

      // Guardar el estado original de visPanel
      const originalVisPanelDisplay = visPanel.style.display;
      const originalVisPanelVisibility = visPanel.style.visibility;
      visPanel.style.display = "block"; // Asegurarse de que sea visible para la captura
      visPanel.style.visibility = "hidden"; // Pero oculto para el usuario

      // 1. Añadir el resumen como texto
      const thesaurus = state.thesauruses.find(
        (t) => t.id === state.activeThesaurusId
      );

      if (thesaurus) {
        // Título principal elegante
        doc.setFont("times", "bold");
        doc.setFontSize(22);
        doc.setTextColor(44, 82, 130); // Azul oscuro
        doc.text(thesaurus.title || "Resumen del Tesauro", margin, yOffset, {
          align: "left",
        });
        yOffset += 12;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        if (thesaurus.author) {
          doc.text(`Autor: ${thesaurus.author}`, margin, yOffset);
          yOffset += 7;
        }
        if (thesaurus.version) {
          doc.text(`Versión: ${thesaurus.version}`, margin, yOffset);
          yOffset += 7;
        }
        if (thesaurus.language) {
          doc.text(`Idioma: ${thesaurus.language}`, margin, yOffset);
          yOffset += 7;
        }
        if (thesaurus.license) {
          doc.text(`Licencia: ${thesaurus.license}`, margin, yOffset);
          yOffset += 7;
        }
        if (thesaurus.published_at) {
          doc.text(
            `Fecha de Publicación: ${thesaurus.published_at.split("T")[0]}`,
            margin,
            yOffset
          );
          yOffset += 7;
        }
        if (thesaurus.description) {
          yOffset += 5; // Espacio antes de la descripción
          doc.setFont("times", "bold");
          doc.setFontSize(15);
          doc.setTextColor(44, 82, 130);
          doc.text("Descripción:", margin, yOffset, { align: "left" });
          yOffset += 7;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
          const splitDescription = doc.splitTextToSize(
            thesaurus.description,
            doc.internal.pageSize.getWidth() - 2 * margin
          );
          // Justificar cada línea de la descripción
          splitDescription.forEach((line) => {
            doc.text(line, margin, yOffset, { align: "justify" });
            yOffset += 7;
          });
        }
        // Espacio mínimo antes de 'Conceptos'
        yOffset += 2;
      }

      // Salto de página antes de 'Conceptos'
      doc.addPage();
      yOffset = margin;
      // Título elegante para 'Conceptos'
      doc.setFont("times", "bold");
      doc.setFontSize(18);
      doc.setTextColor(44, 82, 130);
      doc.text("Conceptos", margin, yOffset, { align: "left" });
      yOffset += 8;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(13);
      doc.setTextColor(0, 0, 0);

      // Mejorar diagramación: ajustar salto de página y espacio entre conceptos
      const pageHeight = doc.internal.pageSize.getHeight();
      const pageWidth = doc.internal.pageSize.getWidth();
      const maxConceptHeight = 60; // Altura máxima estimada por concepto
      const textWidth = pageWidth - 2 * margin - 5; // margen derecho ajustado

      state.concepts.forEach((concept, index) => {
        let conceptStartY = yOffset;
        const prefLabel =
          concept.labels.find((l) => l.label_type === "prefLabel")
            ?.label_text || "Sin Etiqueta";
        // Título elegante para cada concepto
        doc.setFont("times", "bold");
        doc.setFontSize(15);
        doc.setTextColor(44, 82, 130);
        const prefLabelLines = doc.splitTextToSize(prefLabel, textWidth);
        doc.text(prefLabelLines, margin, yOffset, { align: "left" });
        yOffset += prefLabelLines.length * 7;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);

        const addDetail = (label, value) => {
          if (value) {
            let isBold =
              label === "Etiquetas Alternativas" ||
              label === "Definición" ||
              label === "Términos Relacionados" ||
              label == "Términos Específicos" ||
              label == "Término Genérico";
            const detailText = `${label}: ${value}`;
            const detailLines = doc.splitTextToSize(detailText, textWidth);
            detailLines.forEach((line, idx) => {
              if (isBold && idx === 0) {
                // Solo la primera línea lleva la etiqueta en negrita
                const labelPart = `${label}:`;
                const valuePart = line.substring(labelPart.length).trim();
                doc.setFont("helvetica", "bold");
                doc.text(labelPart, margin + 5, yOffset, { align: "left" });
                doc.setFont("helvetica", "normal");
                doc.text(
                  "    " + valuePart,
                  margin + 5 + doc.getTextWidth(labelPart + " "),
                  yOffset,
                  { align: "justify" }
                );
                yOffset += 5;
                // Salto de línea extra después de estas etiquetas
              } else {
                doc.text(line, margin + 5, yOffset, { align: "justify" });
                yOffset += 5;
              }
            });
          }
        };

        addDetail(
          "Etiquetas Alternativas",
          concept.labels
            .filter((l) => l.label_type === "altLabel")
            .map((l) => l.label_text)
            .join(", ")
        );
        addDetail(
          "Etiquetas Ocultas",
          concept.labels
            .filter((l) => l.label_type === "hiddenLabel")
            .map((l) => l.label_text)
            .join(", ")
        );
        addDetail(
          "Definición",
          concept.notes.find((n) => n.note_type === "definition")?.note_text
        );
        addDetail(
          "Nota de Alcance",
          concept.notes.find((n) => n.note_type === "scopeNote")?.note_text
        );
        addDetail(
          "Ejemplo",
          concept.notes.find((n) => n.note_type === "example")?.note_text
        );

        const broader = state.relationships.find(
          (r) =>
            r.source_concept_id === concept.id &&
            r.relationship_type === "broader"
        );
        if (broader) {
          const broaderConcept = state.concepts.find(
            (c) => c.id === broader.target_concept_id
          );
          if (broaderConcept) {
            const broaderLabel =
              broaderConcept.labels.find((l) => l.label_type === "prefLabel")
                ?.label_text || "Sin Etiqueta";
            addDetail("Término Genérico", broaderLabel);
          }
        }

        const narrowerLabels = state.relationships
          .filter(
            (r) =>
              r.source_concept_id === concept.id &&
              r.relationship_type === "narrower"
          )
          .map((r) => {
            const narrowerConcept = state.concepts.find(
              (c) => c.id === r.target_concept_id
            );
            return narrowerConcept
              ? narrowerConcept.labels.find((l) => l.label_type === "prefLabel")
                  ?.label_text || "Sin Etiqueta"
              : "";
          })
          .filter(Boolean)
          .join(", ");
        addDetail("Términos Específicos", narrowerLabels);

        const relatedLabels = state.relationships
          .filter(
            (r) =>
              r.source_concept_id === concept.id &&
              r.relationship_type === "related"
          )
          .map((r) => {
            const relatedConcept = state.concepts.find(
              (c) => c.id === r.target_concept_id
            );
            return relatedConcept
              ? relatedConcept.labels.find((l) => l.label_type === "prefLabel")
                  ?.label_text || "Sin Etiqueta"
              : "";
          })
          .filter(Boolean)
          .join(", ");
        addDetail("Términos Relacionados", relatedLabels);

        // ...sin línea divisoria entre conceptos...

        // Si el concepto se desborda, hacer salto de página
        if (
          yOffset - conceptStartY > maxConceptHeight ||
          yOffset > pageHeight - margin - maxConceptHeight
        ) {
          doc.addPage();
          yOffset = margin;
        }
      });

      // 2. Capturar el grafo (SVG dentro de visualization-panel) y agregarlo al final
      // No agregar página en blanco antes del grafo, solo si el espacio restante es insuficiente
      if (yOffset > doc.internal.pageSize.getHeight() - 80) {
        doc.addPage();
        yOffset = margin;
      }

      const svgElement = document.querySelector("#visualization-panel svg");
      if (!svgElement) {
        console.error("SVG element not found for graph capture.");
        Swal.fire(
          "Error",
          "No se encontró el elemento SVG del grafo.",
          "error"
        );
        return;
      }

      // Incrustar los estilos CSS en el SVG para que se exporten las aristas
      function getCSSStyles(parentElement) {
        let css = "";
        for (const sheet of document.styleSheets) {
          try {
            for (const rule of sheet.cssRules) {
              if (
                rule.selectorText &&
                (rule.selectorText.includes(".link") ||
                  rule.selectorText.includes(".node") ||
                  rule.selectorText.includes("circle") ||
                  rule.selectorText.includes("line"))
              ) {
                css += rule.cssText + "\n";
              }
            }
          } catch (e) {
            /* Ignorar errores de CORS */
          }
        }
        return css;
      }

      function appendCSS(svgEl, cssText) {
        const styleEl = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "style"
        );
        styleEl.setAttribute("type", "text/css");
        styleEl.innerHTML = cssText;
        svgEl.insertBefore(styleEl, svgEl.firstChild);
      }

      const cssText = getCSSStyles(svgElement);
      appendCSS(svgElement, cssText);

      // Get SVG dimensions
      const svgWidth =
        svgElement.viewBox?.baseVal?.width || svgElement.clientWidth;
      const svgHeight =
        svgElement.viewBox?.baseVal?.height || svgElement.clientHeight;

      if (svgWidth === 0 || svgHeight === 0) {
        console.error("SVG element has zero dimensions.");
        Swal.fire(
          "Error",
          "El grafo SVG tiene dimensiones cero, no se puede capturar.",
          "error"
        );
        return;
      }

      // Crear un canvas temporal para renderizar el SVG
      const tempCanvas = document.createElement("canvas");
      // Limitar el alto del gráfico en el PDF
      const maxGraphHeight = doc.internal.pageSize.getHeight() - 2 * margin;
      // Set canvas dimensions based on SVG dimensions, scaled for quality
      tempCanvas.width = svgWidth * 2;
      tempCanvas.height = svgHeight * 2;
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const ctx = tempCanvas.getContext("2d");

      // Crear una imagen a partir del SVG
      const img = new Image();
      const svgBlob = new Blob([svgString], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(svgBlob);

      img.onload = async () => {
        ctx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);
        URL.revokeObjectURL(url);

        const imgDataGraph = tempCanvas.toDataURL("image/png");
        let imgWidthGraph = doc.internal.pageSize.getWidth() - 2 * margin;
        let imgHeightGraph =
          (tempCanvas.height * imgWidthGraph) / tempCanvas.width;
        // Limitar el alto del gráfico si excede la página
        if (imgHeightGraph > maxGraphHeight) {
          imgHeightGraph = maxGraphHeight;
          imgWidthGraph =
            (tempCanvas.width * imgHeightGraph) / tempCanvas.height;
        }
        // Centrar el gráfico horizontalmente
        const graphX = (doc.internal.pageSize.getWidth() - imgWidthGraph) / 2;

        doc.addImage(
          imgDataGraph,
          "PNG",
          graphX,
          yOffset,
          imgWidthGraph,
          imgHeightGraph
        );

        // Restaurar visPanel
        visPanel.style.display = originalVisPanelDisplay;
        visPanel.style.visibility = originalVisPanelVisibility;

        // Guardar el PDF
        const thesaurusTitle =
          state.thesauruses.find((t) => t.id === state.activeThesaurusId)
            ?.title || "Tesauro";
        doc.save(`resumen_${thesaurusTitle.replace(/\s+/g, "_")}.pdf`);
        Swal.close();
        Swal.fire("Éxito", "El PDF ha sido generado y descargado.", "success");
      };
      img.onerror = (err) => {
        console.error("Error al cargar la imagen SVG:", err);
        Swal.fire(
          "Error",
          "No se pudo cargar la imagen del grafo SVG.",
          "error"
        );
      };
      img.src = url;
    } catch (error) {
      console.error("Error al exportar el resumen a PDF:", error);
      Swal.fire("Error", "No se pudo exportar el resumen a PDF.", "error");
    }
  }

  exportSummaryBtn.addEventListener("click", exportSummaryToPdf);

  // --- 6. FUNCIONES DE GESTIÓN DE CONCEPTOS (SKOS) ---
  async function fetchAllConceptData() {
    if (!state.activeThesaurusId) {
      state.concepts = [];
      state.relationships = [];
      updateAll();
      return;
    }
    loader.classList.remove("hidden");
    try {
      const { data: concepts, error: conceptsError } = await supabase
        .from("concepts")
        .select("id, created_at")
        .eq("thesaurus_id", state.activeThesaurusId);
      if (conceptsError) throw conceptsError;

      if (concepts.length === 0) {
        state.concepts = [];
        state.relationships = [];
        updateAll();
        return;
      }

      const conceptIds = concepts.map((c) => c.id);

      const [labelsRes, notesRes, relationshipsRes] = await Promise.all([
        supabase.from("labels").select("*").in("concept_id", conceptIds),
        supabase.from("notes").select("*").in("concept_id", conceptIds),
        supabase
          .from("relationships")
          .select("*")
          .or(
            `source_concept_id.in.(${conceptIds.join(
              ","
            )}),target_concept_id.in.(${conceptIds.join(",")})`
          ),
      ]);

      if (labelsRes.error) throw labelsRes.error;
      if (notesRes.error) throw notesRes.error;
      if (relationshipsRes.error) throw relationshipsRes.error;

      state.relationships = relationshipsRes.data;
      const conceptMap = new Map(
        concepts.map((c) => [c.id, { ...c, labels: [], notes: [] }])
      );

      labelsRes.data.forEach((label) => {
        if (conceptMap.has(label.concept_id)) {
          conceptMap.get(label.concept_id).labels.push(label);
        }
      });

      notesRes.data.forEach((note) => {
        if (conceptMap.has(note.concept_id)) {
          conceptMap.get(note.concept_id).notes.push(note);
        }
      });

      state.concepts = Array.from(conceptMap.values());
      updateAll();
    } catch (error) {
      console.error("Error fetching concept data:", error);
      Swal.fire(
        "Error",
        "No se pudieron cargar los datos del tesauro.",
        "error"
      );
    } finally {
      loader.classList.add("hidden");
    }
  }

  async function saveConcept() {
    const conceptId = conceptIdInput.value || null;
    const thesaurusId = state.activeThesaurusId;
    if (!thesaurusId) {
      Swal.fire("Error", "No hay un tesauro activo seleccionado.", "error");
      return;
    }

    const prefLabel = { type: "prefLabel", text: prefLabelInput.value.trim() };
    if (!prefLabel.text) {
      Swal.fire("Error", "La Etiqueta Preferida es obligatoria.", "error");
      return;
    }

    const altLabels = altLabelsInput.value
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean)
      .map((text) => ({ type: "altLabel", text }));
    const hiddenLabels = hiddenLabelsInput.value
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean)
      .map((text) => ({ type: "hiddenLabel", text }));
    const allLabels = [prefLabel, ...altLabels, ...hiddenLabels];

    const definition = {
      type: "definition",
      text: definitionInput.value.trim(),
    };
    const scopeNote = { type: "scopeNote", text: scopeNoteInput.value.trim() };
    const example = { type: "example", text: exampleInput.value.trim() };
    const allNotes = [definition, scopeNote, example].filter((n) => n.text);

    const broaderConceptId = broaderConceptSelect.value || null;
    const relatedConceptIds = Array.from(
      relatedConceptsSelect.selectedOptions
    ).map((opt) => opt.value);

    try {
      let currentConceptId = conceptId;

      if (!currentConceptId) {
        const { data, error } = await supabase
          .from("concepts")
          .insert({ thesaurus_id: thesaurusId })
          .select("id")
          .single();
        if (error) throw error;
        currentConceptId = data.id;
      }

      await Promise.all([
        supabase.from("labels").delete().eq("concept_id", currentConceptId),
        supabase.from("notes").delete().eq("concept_id", currentConceptId),
      ]);

      const labelsToInsert = allLabels.map((l) => ({
        concept_id: currentConceptId,
        label_type: l.type,
        label_text: l.text,
      }));
      const notesToInsert = allNotes.map((n) => ({
        concept_id: currentConceptId,
        note_type: n.type,
        note_text: n.text,
      }));

      await supabase.from("labels").insert(labelsToInsert);
      if (notesToInsert.length > 0) {
        await supabase.from("notes").insert(notesToInsert);
      }

      await supabase
        .from("relationships")
        .delete()
        .or(
          `source_concept_id.eq.${currentConceptId},target_concept_id.eq.${currentConceptId}`
        );

      const relationshipsToInsert = [];
      if (broaderConceptId) {
        relationshipsToInsert.push({
          source_concept_id: currentConceptId,
          target_concept_id: broaderConceptId,
          relationship_type: "broader",
        });
        relationshipsToInsert.push({
          source_concept_id: broaderConceptId,
          target_concept_id: currentConceptId,
          relationship_type: "narrower",
        });
      }
      relatedConceptIds.forEach((relatedId) => {
        relationshipsToInsert.push({
          source_concept_id: currentConceptId,
          target_concept_id: relatedId,
          relationship_type: "related",
        });
        relationshipsToInsert.push({
          source_concept_id: relatedId,
          target_concept_id: currentConceptId,
          relationship_type: "related",
        });
      });

      if (relationshipsToInsert.length > 0) {
        await supabase.from("relationships").insert(relationshipsToInsert);
      }

      Swal.fire("Éxito", "Concepto guardado correctamente.", "success");
      await fetchAllConceptData();
      clearForm();
    } catch (error) {
      console.error("Error saving concept:", error);
      Swal.fire(
        "Error",
        `No se pudo guardar el concepto: ${error.message}`,
        "error"
      );
    }
  }

  async function deleteConcept() {
    const conceptId = conceptIdInput.value;
    if (!conceptId) return;

    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "¡Se eliminará el concepto y todas sus relaciones asociadas!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Sí, ¡elimínalo!",
    });

    if (result.isConfirmed) {
      try {
        const { error } = await supabase
          .from("concepts")
          .delete()
          .eq("id", conceptId);
        if (error) throw error;

        Swal.fire("Eliminado", "El concepto ha sido eliminado.", "success");
        await fetchAllConceptData();
        clearForm();
      } catch (error) {
        console.error("Error deleting concept:", error);
        Swal.fire("Error", "No se pudo eliminar el concepto.", "error");
      }
    }
  }

  // --- 7. FUNCIONES DE D3 (VISUALIZACIÓN) ---
  let node;
  let link;

  simulation.on("tick", () => {
    if (link) {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);
    }
    if (node) {
      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    }
  });

  function updateGraph() {
    const nodes = state.concepts.map((c) => ({
      id: c.id,
      name:
        c.labels.find((l) => l.label_type === "prefLabel")?.label_text ||
        "Sin Etiqueta",
      fullConcept: c,
    }));

    const nodeIds = new Set(nodes.map((n) => n.id));
    const links = state.relationships
      .filter(
        (r) =>
          nodeIds.has(r.source_concept_id) && nodeIds.has(r.target_concept_id)
      )
      .map((r) => ({
        ...r,
        source: r.source_concept_id,
        target: r.target_concept_id,
      }));

    // === UPDATE THE SIMULATION ===
    simulation.nodes(nodes);
    simulation.force("link").links(links);

    // === UPDATE THE VISUAL ELEMENTS ===
    // LINKS
    link = linkGroup.selectAll("line").data(links, (d) => d.id);

    link.exit().remove();

    link = link
      .enter()
      .append("line")
      .attr("class", (d) => `link ${d.relationship_type}`)
      .attr("stroke-width", 2)
      .merge(link);

    // NODES
    node = nodeGroup.selectAll(".node").data(nodes, (d) => d.id);

    node.exit().remove();

    const nodeEnter = node
      .enter()
      .append("g")
      .attr("class", "node")
      .call(
        d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

    nodeEnter
      .append("circle")
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

    nodeEnter.append("text").attr("dy", -12);

    node = nodeEnter.merge(node);
    node.select("text").text((d) => d.name);

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
    const scopeNote = d.fullConcept.notes.find(
      (n) => n.note_type === "scopeNote"
    )?.note_text;
    if (scopeNote) {
      tooltip.classList.remove("hidden");
      tooltip.innerHTML = scopeNote;
      moveTooltip(event);
    }
  }
  function moveTooltip(event) {
    tooltip.style.left = event.pageX + 15 + "px";
    tooltip.style.top = event.pageY + 15 + "px";
  }
  function hideTooltip() {
    tooltip.classList.add("hidden");
  }

  const zoom = d3.zoom().on("zoom", (event) => {
    nodeGroup.attr("transform", event.transform);
    linkGroup.attr("transform", event.transform);
  });
  svg.call(zoom);

  // --- 8. FUNCIONES DE UI ---
  function populateConceptDropdowns(currentConceptId = null) {
    const sortedConcepts = [...state.concepts].sort((a, b) => {
      const nameA =
        a.labels.find((l) => l.label_type === "prefLabel")?.label_text || "";
      const nameB =
        b.labels.find((l) => l.label_type === "prefLabel")?.label_text || "";
      return nameA.localeCompare(nameB);
    });

    const options = sortedConcepts
      .filter((c) => c.id !== currentConceptId)
      .map((c) => {
        const prefLabel = c.labels.find(
          (l) => l.label_type === "prefLabel"
        )?.label_text;
        return `<option value="${c.id}">${prefLabel || c.id}</option>`;
      })
      .join("");

    broaderConceptSelect.innerHTML = `<option value="">-- Ninguno --</option>${options}`;
    relatedConceptsSelect.innerHTML = options;
  }

  function showConceptDetails(concept) {
    clearForm();
    conceptIdInput.value = concept.id;

    prefLabelInput.value =
      concept.labels.find((l) => l.label_type === "prefLabel")?.label_text ||
      "";
    altLabelsInput.value = concept.labels
      .filter((l) => l.label_type === "altLabel")
      .map((l) => l.label_text)
      .join("\n");
    hiddenLabelsInput.value = concept.labels
      .filter((l) => l.label_type === "hiddenLabel")
      .map((l) => l.label_text)
      .join("\n");

    definitionInput.value =
      concept.notes.find((n) => n.note_type === "definition")?.note_text || "";
    scopeNoteInput.value =
      concept.notes.find((n) => n.note_type === "scopeNote")?.note_text || "";
    exampleInput.value =
      concept.notes.find((n) => n.note_type === "example")?.note_text || "";

    populateConceptDropdowns(concept.id);

    const broaderRel = state.relationships.find(
      (r) =>
        r.source_concept_id === concept.id && r.relationship_type === "broader"
    );
    broaderConceptSelect.value = broaderRel ? broaderRel.target_concept_id : "";

    const relatedIds = state.relationships
      .filter(
        (r) =>
          r.source_concept_id === concept.id &&
          r.relationship_type === "related"
      )
      .map((r) => r.target_concept_id);
    Array.from(relatedConceptsSelect.options).forEach((opt) => {
      opt.selected = relatedIds.includes(opt.value);
    });

    deleteConceptBtn.disabled = false;
  }

  function showConceptModal(concept) {
    const getLabel = (type) =>
      concept.labels.find((l) => l.label_type === type)?.label_text || "N/A";
    const getNote = (type) =>
      concept.notes.find((n) => n.note_type === type)?.note_text ||
      "No disponible";
    const getLabels = (type) => {
      const labels = concept.labels
        .filter((l) => l.label_type === type)
        .map((l) => `<li>${l.label_text}</li>`)
        .join("");
      return labels || "<li>Ninguna</li>";
    };

    const getConceptName = (conceptId) => {
      const foundConcept = state.concepts.find((c) => c.id === conceptId);
      return foundConcept
        ? foundConcept.labels.find((l) => l.label_type === "prefLabel")
            ?.label_text || "Concepto sin nombre"
        : "Concepto no encontrado";
    };

    const broaderRel = state.relationships.find(
      (r) =>
        r.source_concept_id === concept.id && r.relationship_type === "broader"
    );
    const narrowerRels = state.relationships
      .filter(
        (r) =>
          r.source_concept_id === concept.id &&
          r.relationship_type === "narrower"
      )
      .map((r) => `<li>${getConceptName(r.target_concept_id)}</li>`)
      .join("");
    const relatedRels = state.relationships
      .filter(
        (r) =>
          r.source_concept_id === concept.id &&
          r.relationship_type === "related"
      )
      .map((r) => `<li>${getConceptName(r.target_concept_id)}</li>`)
      .join("");

    modalTitle.textContent = getLabel("prefLabel");
    modalBody.innerHTML = `
            <div class="modal-section">
                <h4>Definición</h4>
                <p>${getNote("definition")}</p>
            </div>
            <div class="modal-section">
                <h4>Nota de Alcance</h4>
                <p>${getNote("scopeNote")}</p>
            </div>
            <div class="modal-section">
                <h4>Ejemplo de Uso</h4>
                <p>${getNote("example")}</p>
            </div>
            <div class="modal-section">
                <h4>Etiquetas Alternativas (Sinónimos)</h4>
                <ul>${getLabels("altLabel")}</ul>
            </div>
            <div class="modal-section">
                <h4>Relaciones Semánticas</h4>
                <p><strong>Término Genérico (Más amplio):</strong> ${
                  broaderRel
                    ? getConceptName(broaderRel.target_concept_id)
                    : "Ninguno"
                }</p>
                
                <h4>Términos Específicos (Más estrechos):</h4>
                <ul>${narrowerRels || "<li>Ninguno</li>"}</ul>

                <h4>Términos Relacionados:</h4>
                <ul>${relatedRels || "<li>Ninguno</li>"}</ul>
            </div>
        `;

    conceptModal.classList.remove("hidden");
  }

  function clearForm() {
    conceptForm.reset();
    conceptIdInput.value = "";
    relatedConceptsSelect.selectedIndex = -1;
    deleteConceptBtn.disabled = true;
    populateConceptDropdowns();
  }

  function updateAll() {
    updateGraph();
    populateConceptDropdowns();
  }

  // --- 9. MANEJADORES DE EVENTOS ---
  conceptForm.addEventListener("submit", (e) => {
    e.preventDefault();
    saveConcept();
  });

  deleteConceptBtn.addEventListener("click", deleteConcept);
  clearFormBtn.addEventListener("click", clearForm);

  // Manejadores del modal
  modalCloseBtn.addEventListener("click", () =>
    conceptModal.classList.add("hidden")
  );
  conceptModal.addEventListener("click", (e) => {
    if (e.target === conceptModal) {
      // Cierra el modal si se hace clic en el overlay
      conceptModal.classList.add("hidden");
    }
  });

  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    d3.selectAll(".node").classed("highlighted", (d) => {
      if (!query) return false;
      const prefLabel =
        d.fullConcept.labels
          .find((l) => l.label_type === "prefLabel")
          ?.label_text.toLowerCase() || "";
      const altLabels = d.fullConcept.labels
        .filter((l) => l.label_type === "altLabel")
        .map((l) => l.label_text.toLowerCase());
      return (
        prefLabel.includes(query) || altLabels.some((l) => l.includes(query))
      );
    });
  });

  // --- 10. IMPORTACIÓN / EXPORTACIÓN (SKOS-based) ---
  exportBtn.addEventListener("click", () => {
    if (state.concepts.length === 0) {
      Swal.fire("Info", "No hay conceptos para exportar.", "info");
      return;
    }

    const dataToExport = {
      concepts: state.concepts,
      relationships: state.relationships,
    };

    const dataStr = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.download = `thesaurus_skos_export_${state.activeThesaurusId}.json`;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
  });

  importInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (!data.concepts || !data.relationships)
          throw new Error("Formato de archivo inválido.");

        const result = await Swal.fire({
          title: "¿Estás seguro?",
          text: `Vas a importar ${data.concepts.length} conceptos y ${data.relationships.length} relaciones. Esto puede crear duplicados si ya existen.`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Sí, ¡importar!",
        });

        if (!result.isConfirmed) return;

        loader.classList.remove("hidden");

        const conceptIdMap = new Map();
        for (const concept of data.concepts) {
          const oldId = concept.id;
          const { data: newConcept, error } = await supabase
            .from("concepts")
            .insert({ thesaurus_id: state.activeThesaurusId })
            .select("id")
            .single();
          if (error) throw error;
          conceptIdMap.set(oldId, newConcept.id);

          if (concept.labels) {
            const labelsToInsert = concept.labels.map((l) => ({
              label_type: l.label_type,
              label_text: l.label_text,
              concept_id: newConcept.id,
            }));
            await supabase.from("labels").insert(labelsToInsert);
          }
          if (concept.notes) {
            const notesToInsert = concept.notes.map((n) => ({
              note_type: n.note_type,
              note_text: n.note_text,
              concept_id: newConcept.id,
            }));
            await supabase.from("notes").insert(notesToInsert);
          }
        }

        if (data.relationships) {
          const relsToInsert = data.relationships
            .map((r) => ({
              source_concept_id: conceptIdMap.get(r.source_concept_id),
              target_concept_id: conceptIdMap.get(r.target_concept_id),
              relationship_type: r.relationship_type,
            }))
            .filter((r) => r.source_concept_id && r.target_concept_id);
          await supabase.from("relationships").insert(relsToInsert);
        }

        Swal.fire("¡Éxito!", "Importación completada.", "success");
        await fetchAllConceptData();
      } catch (error) {
        console.error("Error importing data:", error);
        Swal.fire(
          "Error",
          `Error al importar el archivo: ${error.message}`,
          "error"
        );
      } finally {
        loader.classList.add("hidden");
        importInput.value = "";
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
