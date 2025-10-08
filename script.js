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
  const temporalStartInput = document.getElementById("temporal-start");
  const temporalEndInput = document.getElementById("temporal-end");
  const temporalRelevanceInput = document.getElementById("temporal-relevance");

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

  // Elementos del Modal de Historicidad de Relaciones
  const relationshipModal = document.getElementById("relationship-modal");
  const relationshipModalTitle = document.getElementById(
    "relationship-modal-title"
  );
  const relationshipModalCloseBtn = document.getElementById(
    "relationship-modal-close-btn"
  );
  const relationshipHistoricityForm = document.getElementById(
    "relationship-historicity-form"
  );
  const relationshipIdInput = document.getElementById("relationship-id");
  const relationshipTemporalStartInput = document.getElementById(
    "relationship-temporal-start"
  );
  const relationshipTemporalEndInput = document.getElementById(
    "relationship-temporal-end"
  );
  const relationshipTemporalRelevanceInput = document.getElementById(
    "relationship-temporal-relevance"
  );
  const clearRelationshipBtn = document.getElementById(
    "clear-relationship-btn"
  );

  // Elementos del editor de categorías
  const categoryForm = document.getElementById("category-form");
  const categoryIdInput = document.getElementById("category-id");
  const categoryNameInput = document.getElementById("category-name");
  const categoryDescriptionInput = document.getElementById(
    "category-description"
  );
  const categoryNotesInput = document.getElementById("category-notes");
  const clearCategoryFormBtn = document.getElementById(
    "clear-category-form-btn"
  );
  const categoryList = document.getElementById("category-list");

  // --- 3. ESTADO DE LA APLICACIÓN Y CONFIGURACIÓN DE D3 ---
  let state = {
    concepts: [],
    relationships: [], // Fuente de verdad única para las relaciones
    thesauruses: [],
    categories: [],
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

  // --- 5.1. FUNCIONES DE GESTIÓN DE CATEGORÍAS ---
  function createColorPicker(colors, defaultColor = "#cccccc") {
    const swatches = colors
      .map(
        (color) =>
          `<button type="button" class="color-swatch" style="background-color: ${color};" data-color="${color}"></button>`
      )
      .join("");

    return `
      <div class="custom-color-picker">
        <div class="color-swatches">
          ${swatches}
        </div>
        <input type="color" class="custom-color-input" value="${defaultColor}">
      </div>
    `;
  }

  async function fetchCategories() {
    if (!state.activeThesaurusId) {
      state.categories = [];
      renderCategories();
      return;
    }
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("thesaurus_id", state.activeThesaurusId)
      .order("name");

    if (error) {
      console.error("Error fetching categories:", error);
      return;
    }
    state.categories = data;
    renderCategories();
  }

  function renderCategories() {
    categoryList.innerHTML = state.categories
      .map(
        (cat) => `
      <li data-id="${cat.id}">
        <span class="category-color-dot" style="background-color: ${cat.color};"></span>
        <span class="category-name">${cat.name}</span>
        <div class="category-actions">
          <button class="edit-category-btn" data-id="${cat.id}">✏️</button>
          <button class="delete-category-btn" data-id="${cat.id}">🗑️</button>
        </div>
      </li>
    `
      )
      .join("");
  }

  function editCategory(category) {
    categoryIdInput.value = category.id;
    categoryNameInput.value = category.name;
    categoryDescriptionInput.value = category.description || "";
    categoryNotesInput.value = category.notes || "";

    const colors = [
      "#f44336",
      "#e91e63",
      "#9c27b0",
      "#673ab7",
      "#3f51b5",
      "#2196f3",
      "#009688",
      "#4caf50",
      "#cddc39",
      "#ffeb3b",
      "#ff9800",
      "#795548",
    ];
    const colorPickerContainer = document.getElementById(
      "category-color-picker"
    );
    colorPickerContainer.innerHTML = createColorPicker(
      colors,
      category.color || "#cccccc"
    );

    const colorPicker = colorPickerContainer.querySelector(
      ".custom-color-picker"
    );
    const customColorInput = colorPicker.querySelector(".custom-color-input");

    colorPicker.addEventListener("click", (e) => {
      if (e.target.classList.contains("color-swatch")) {
        customColorInput.value = e.target.dataset.color;
      }
    });
  }

  async function saveCategory(e) {
    e.preventDefault();
    const id = categoryIdInput.value || null;
    const categoryData = {
      thesaurus_id: state.activeThesaurusId,
      name: categoryNameInput.value.trim(),
      description: categoryDescriptionInput.value.trim(),
      notes: categoryNotesInput.value.trim(),
      color: document.querySelector(
        "#category-color-picker .custom-color-input"
      ).value,
    };

    if (!categoryData.name) {
      Swal.fire("Error", "El nombre de la categoría es obligatorio.", "error");
      return;
    }

    let query = supabase.from("categories");
    if (id) {
      query = query.update(categoryData).eq("id", id);
    } else {
      query = query.insert(categoryData);
    }

    const { error } = await query;

    if (error) {
      console.error("Error saving category:", error);
      Swal.fire("Error", "No se pudo guardar la categoría.", "error");
    } else {
      Swal.fire("Éxito", "Categoría guardada.", "success");
      clearCategoryForm();
      await fetchCategories();
      await fetchAllConceptData(); // To update node colors
    }
  }

  async function deleteCategory(id) {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Se eliminará la categoría y se desasignará de todos los conceptos.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Sí, ¡elimínala!",
    });

    if (result.isConfirmed) {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) {
        Swal.fire("Error", "No se pudo eliminar la categoría.", "error");
      } else {
        Swal.fire("Eliminada", "La categoría ha sido eliminada.", "success");
        await fetchCategories();
        await fetchAllConceptData(); // To update node colors
      }
    }
  }

  function clearCategoryForm() {
    categoryForm.reset();
    categoryIdInput.value = "";

    const colors = [
      "#f44336",
      "#e91e63",
      "#9c27b0",
      "#673ab7",
      "#3f51b5",
      "#2196f3",
      "#009688",
      "#4caf50",
      "#cddc39",
      "#ffeb3b",
      "#ff9800",
      "#795548",
    ];
    const colorPickerContainer = document.getElementById(
      "category-color-picker"
    );
    colorPickerContainer.innerHTML = createColorPicker(colors, "#cccccc");

    const colorPicker = colorPickerContainer.querySelector(
      ".custom-color-picker"
    );
    const customColorInput = colorPicker.querySelector(".custom-color-input");

    colorPicker.addEventListener("click", (e) => {
      if (e.target.classList.contains("color-swatch")) {
        customColorInput.value = e.target.dataset.color;
      }
    });
  }

  categoryForm.addEventListener("submit", saveCategory);
  clearCategoryFormBtn.addEventListener("click", clearCategoryForm);

  categoryList.addEventListener("click", (e) => {
    const target = e.target;
    const id = target.dataset.id;
    if (target.classList.contains("delete-category-btn")) {
      deleteCategory(id);
    } else if (target.classList.contains("edit-category-btn")) {
      const category = state.categories.find((c) => c.id === id);
      if (category) editCategory(category);
    } else if (target.closest("li")) {
      const li = target.closest("li");
      const category = state.categories.find((c) => c.id === li.dataset.id);
      if (category) editCategory(category);
    }
  });

  function generateThesaurusSummary(sortBy = "default") {
    let summaryHtml = "";
    const concepts = [...state.concepts]; // Copia para no mutar el estado original
    const relationships = state.relationships;
    const categories = state.categories;
    const thesaurus = state.thesauruses.find(
      (t) => t.id === state.activeThesaurusId
    );

    const getPrefLabel = (concept) =>
      concept.labels.find((l) => l.label_type === "prefLabel")?.label_text ||
      "Sin Etiqueta";

    // Ordenar conceptos si es necesario
    if (sortBy === "alphabetical") {
      concepts.sort((a, b) => getPrefLabel(a).localeCompare(getPrefLabel(b)));
    }

    const renderConcept = (concept) => {
      let conceptHtml = "";
      const prefLabel = getPrefLabel(concept);
      conceptHtml += `<div class="summary-concept">
`;
      conceptHtml += `<h3>${prefLabel}</h3>
`;
      conceptHtml += '<table class="summary-table">';

      const altLabels = concept.labels
        .filter((l) => l.label_type === "altLabel")
        .map((l) => l.label_text)
        .join(", ");
      if (altLabels) {
        conceptHtml += `<tr><td class="summary-label">Etiquetas Alternativas</td><td>${altLabels}</td></tr>`;
      }

      const definition = concept.notes.find(
        (n) => n.note_type === "definition"
      )?.note_text;
      if (definition) {
        conceptHtml += `<tr><td class="summary-label">Definición</td><td>${definition}</td></tr>`;
      }

      // Añadir más detalles si es necesario, siguiendo el patrón...

      conceptHtml += "</table>";
      conceptHtml += `</div>`;
      return conceptHtml;
    };

    if (sortBy === "category") {
      const conceptsByCategory = concepts.reduce((acc, concept) => {
        const categoryId = concept.category_id || "uncategorized";
        if (!acc[categoryId]) {
          acc[categoryId] = [];
        }
        acc[categoryId].push(concept);
        return acc;
      }, {});

      // Ordenar categorías por nombre
      const sortedCategories = [...categories].sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      // Renderizar conceptos por categoría
      sortedCategories.forEach((category) => {
        if (conceptsByCategory[category.id]) {
          summaryHtml += `<h2 class="summary-category-title">${category.name}</h2>`;
          conceptsByCategory[category.id]
            .sort((a, b) => getPrefLabel(a).localeCompare(getPrefLabel(b)))
            .forEach((concept) => {
              summaryHtml += renderConcept(concept);
              summaryHtml += '<hr class="summary-divider">';
            });
        }
      });

      // Renderizar conceptos sin categoría
      if (conceptsByCategory["uncategorized"]) {
        summaryHtml += `<h2 class="summary-category-title">Sin Categoría</h2>`;
        conceptsByCategory["uncategorized"]
          .sort((a, b) => getPrefLabel(a).localeCompare(getPrefLabel(b)))
          .forEach((concept) => {
            summaryHtml += renderConcept(concept);
            summaryHtml += '<hr class="summary-divider">';
          });
      }
    } else {
      // Renderizado por defecto o alfabético
      concepts.forEach((concept, index) => {
        summaryHtml += renderConcept(concept);
        if (index < concepts.length - 1) {
          summaryHtml += '<hr class="summary-divider">';
        }
      });
    }

    // Detalles del tesauro (se puede poner al principio)
    let thesaurusDetails = "";
    if (thesaurus) {
      thesaurusDetails += `<div class="summary-thesaurus-details">
`;
      thesaurusDetails += `<ul>
`;
      if (thesaurus.author)
        thesaurusDetails += `<li><strong>Autor:</strong> ${thesaurus.author}</li>
`;
      if (thesaurus.version)
        thesaurusDetails += `<li><strong>Versión:</strong> ${thesaurus.version}</li>
`;
      if (thesaurus.description)
        thesaurusDetails += `<li><strong>Descripción:</strong> ${thesaurus.description}</li>
`;
      thesaurusDetails += `</ul>
`;
      thesaurusDetails += `</div>
`;
    }

    return thesaurusDetails + summaryHtml;
  }

  function renderSummary() {
    const sortBy = document.querySelector(
      'input[name="summary-sort"]:checked'
    ).value;
    const summaryContent = document.getElementById("summary-content");
    summaryContent.innerHTML = generateThesaurusSummary(sortBy);
  }

  function showThesaurusSummary() {
    const thesaurus = state.thesauruses.find(
      (t) => t.id === state.activeThesaurusId
    );
    summaryModalTitle.textContent = thesaurus
      ? thesaurus.title
      : "Resumen del Tesauro";
    renderSummary(); // Llama a la nueva función de renderizado
    summaryModal.classList.remove("hidden");
  }

  summaryBtn.addEventListener("click", showThesaurusSummary);

  document
    .getElementById("summary-controls")
    .addEventListener("change", renderSummary);

  summaryModalCloseBtn.addEventListener("click", () =>
    summaryModal.classList.add("hidden")
  );
  summaryModal.addEventListener("click", (e) => {
    if (e.target === summaryModal) {
      summaryModal.classList.add("hidden");
    }
  });

  // Manejadores del modal de historicidad de relaciones
  relationshipHistoricityForm.addEventListener(
    "submit",
    saveRelationshipHistoricity
  );
  relationshipModalCloseBtn.addEventListener("click", closeRelationshipModal);
  clearRelationshipBtn.addEventListener("click", closeRelationshipModal);
  relationshipModal.addEventListener("click", (e) => {
    if (e.target === relationshipModal) {
      closeRelationshipModal();
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
      state.categories = [];
      renderCategories();
      updateAll();
      return;
    }
    loader.classList.remove("hidden");
    try {
      const [conceptsRes, categoriesRes] = await Promise.all([
        supabase
          .from("concepts")
          .select(
            "id, created_at, category_id, temporal_start, temporal_end, temporal_relevance"
          )
          .eq("thesaurus_id", state.activeThesaurusId),
        supabase
          .from("categories")
          .select("*")
          .eq("thesaurus_id", state.activeThesaurusId)
          .order("name"),
      ]);

      if (conceptsRes.error) throw conceptsRes.error;
      if (categoriesRes.error) throw categoriesRes.error;

      state.categories = categoriesRes.data;
      renderCategories();

      const concepts = conceptsRes.data;

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

    // Campos de historicidad
    const temporalStart = temporalStartInput.value
      ? parseInt(temporalStartInput.value)
      : null;
    const temporalEnd = temporalEndInput.value
      ? parseInt(temporalEndInput.value)
      : null;
    const temporalRelevance = temporalRelevanceInput.value
      ? parseFloat(temporalRelevanceInput.value)
      : null;

    try {
      let currentConceptId = conceptId;

      if (!currentConceptId) {
        const { data, error } = await supabase
          .from("concepts")
          .insert({
            thesaurus_id: thesaurusId,
            temporal_start: temporalStart,
            temporal_end: temporalEnd,
            temporal_relevance: temporalRelevance,
          })
          .select("id")
          .single();
        if (error) throw error;
        currentConceptId = data.id;
      } else {
        // Actualizar los campos temporales del concepto existente
        const { error } = await supabase
          .from("concepts")
          .update({
            temporal_start: temporalStart,
            temporal_end: temporalEnd,
            temporal_relevance: temporalRelevance,
          })
          .eq("id", currentConceptId);
        if (error) throw error;
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

    const linkEnter = link
      .enter()
      .append("line")
      .attr("class", (d) => `link ${d.relationship_type}`)
      .on("contextmenu", showRelationshipContextMenu)
      .on("mouseover", showLinkTooltip)
      .on("mousemove", moveTooltip)
      .on("mouseout", hideTooltip);

    link = linkEnter.merge(link);

    // Actualizar estilos visuales según historicidad
    link
      .attr("stroke-width", (d) => {
        // Grosor base según tipo de relación
        const baseWidth = 2;
        // Si tiene temporal_relevance, ajustar el grosor
        if (
          d.temporal_relevance !== null &&
          d.temporal_relevance !== undefined
        ) {
          return baseWidth * (0.5 + d.temporal_relevance);
        }
        return baseWidth;
      })
      .attr("opacity", (d) => {
        // Si tiene temporal_relevance, usarla para la opacidad
        if (
          d.temporal_relevance !== null &&
          d.temporal_relevance !== undefined
        ) {
          return 0.3 + d.temporal_relevance * 0.7; // Opacidad entre 0.3 y 1.0
        }
        return 0.8; // Opacidad por defecto
      })
      .attr("stroke-dasharray", (d) => {
        // Si tiene fechas definidas, usar línea sólida, si no, línea punteada
        if (d.temporal_start || d.temporal_end) {
          return "none";
        }
        return null;
      });

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
      )
      .on("contextmenu", showContextMenu);

    nodeEnter
      .append("circle")
      .attr("r", 10)
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
    node.select("circle").attr("fill", (d) => {
      const category = state.categories.find(
        (cat) => cat.id === d.fullConcept.category_id
      );
      return category ? category.color : "#2c5282";
    });
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

  function showContextMenu(event, d) {
    event.preventDefault();

    // Remove any existing context menus
    d3.select(".context-menu").remove();

    const menu = d3
      .select("body")
      .append("div")
      .attr("class", "context-menu")
      .style("left", `${event.pageX}px`)
      .style("top", `${event.pageY}px`);

    const list = menu.append("ul");

    list
      .selectAll("li")
      .data(state.categories)
      .enter()
      .append("li")
      .html(
        (cat) =>
          `<span class="category-color-dot" style="background-color: ${cat.color};"></span>${cat.name}`
      )
      .on("click", (e, cat) => {
        setNodeCategory(d.fullConcept.id, cat.id);
        menu.remove();
      });

    list
      .append("li")
      .text("Sin categoría")
      .on("click", () => {
        setNodeCategory(d.fullConcept.id, null);
        menu.remove();
      });

    list.append("hr");

    list
      .append("li")
      .text("Nueva categoría...")
      .on("click", () => {
        menu.remove();
        promptNewCategory(d.fullConcept.id);
      });

    // Close menu on outside click
    d3.select("body").on("click.context-menu", () => {
      menu.remove();
      d3.select("body").on("click.context-menu", null);
    });
  }

  function showRelationshipContextMenu(event, d) {
    event.preventDefault();
    showRelationshipHistoricityModal(d);
  }

  function showRelationshipHistoricityModal(relationship) {
    const sourceConcept = state.concepts.find(
      (c) => c.id === relationship.source_concept_id
    );
    const targetConcept = state.concepts.find(
      (c) => c.id === relationship.target_concept_id
    );

    const sourceLabel =
      sourceConcept?.labels.find((l) => l.label_type === "prefLabel")
        ?.label_text || "Concepto";
    const targetLabel =
      targetConcept?.labels.find((l) => l.label_type === "prefLabel")
        ?.label_text || "Concepto";

    relationshipModalTitle.textContent = `Historicidad: ${sourceLabel} → ${targetLabel}`;
    relationshipIdInput.value = relationship.id;
    relationshipTemporalStartInput.value = relationship.temporal_start || "";
    relationshipTemporalEndInput.value = relationship.temporal_end || "";
    relationshipTemporalRelevanceInput.value =
      relationship.temporal_relevance || "";

    relationshipModal.classList.remove("hidden");
  }

  async function saveRelationshipHistoricity(e) {
    e.preventDefault();

    const relationshipId = relationshipIdInput.value;
    if (!relationshipId) {
      Swal.fire("Error", "No se pudo identificar la relación.", "error");
      return;
    }

    const temporalStart = relationshipTemporalStartInput.value
      ? parseInt(relationshipTemporalStartInput.value)
      : null;
    const temporalEnd = relationshipTemporalEndInput.value
      ? parseInt(relationshipTemporalEndInput.value)
      : null;
    const temporalRelevance = relationshipTemporalRelevanceInput.value
      ? parseFloat(relationshipTemporalRelevanceInput.value)
      : null;

    try {
      const { error } = await supabase
        .from("relationships")
        .update({
          temporal_start: temporalStart,
          temporal_end: temporalEnd,
          temporal_relevance: temporalRelevance,
        })
        .eq("id", relationshipId);

      if (error) throw error;

      // Actualizar el estado local
      const relationshipIndex = state.relationships.findIndex(
        (r) => r.id === relationshipId
      );
      if (relationshipIndex !== -1) {
        state.relationships[relationshipIndex] = {
          ...state.relationships[relationshipIndex],
          temporal_start: temporalStart,
          temporal_end: temporalEnd,
          temporal_relevance: temporalRelevance,
        };
      }

      Swal.fire(
        "Éxito",
        "Historicidad de la relación guardada correctamente.",
        "success"
      );
      relationshipModal.classList.add("hidden");
      updateGraph(); // Actualizar la visualización
    } catch (error) {
      console.error("Error saving relationship historicity:", error);
      Swal.fire(
        "Error",
        `No se pudo guardar la historicidad: ${error.message}`,
        "error"
      );
    }
  }

  function closeRelationshipModal() {
    relationshipModal.classList.add("hidden");
    relationshipHistoricityForm.reset();
    relationshipIdInput.value = "";
  }

  async function setNodeCategory(conceptId, categoryId) {
    const { error } = await supabase
      .from("concepts")
      .update({ category_id: categoryId })
      .eq("id", conceptId);

    if (error) {
      console.error("Error updating concept category:", error);
      Swal.fire(
        "Error",
        "No se pudo actualizar la categoría del concepto.",
        "error"
      );
    } else {
      // Update local state
      const concept = state.concepts.find((c) => c.id === conceptId);
      if (concept) {
        concept.category_id = categoryId;
      }
      updateGraph();
    }
  }

  async function promptNewCategory(conceptId) {
    const colors = [
      "#f44336",
      "#e91e63",
      "#9c27b0",
      "#673ab7",
      "#3f51b5",
      "#2196f3",
      "#009688",
      "#4caf50",
      "#cddc39",
      "#ffeb3b",
      "#ff9800",
      "#795548",
    ];
    const { value: formValues } = await Swal.fire({
      title: "Crear Nueva Categoría",
      customClass: {
        popup: "new-category-alert",
      },
      html: `
        <div class="new-category-form">
          <div class="form-group">
            <label for="swal-input1">Nombre</label>
            <input id="swal-input1" class="swal2-input" placeholder="Nombre de la categoría">
          </div>
          <div class="form-group">
            <label for="swal-input2">Descripción</label>
            <textarea id="swal-input2" class="swal2-textarea" placeholder="Descripción..."></textarea>
          </div>
          <div class="form-group form-group-color">
            <label>Color</label>
            <div id="swal-color-picker"></div>
          </div>
        </div>
      `,
      didOpen: () => {
        const colorPickerContainer =
          document.getElementById("swal-color-picker");
        colorPickerContainer.innerHTML = createColorPicker(colors, "#cccccc");

        const colorPicker = colorPickerContainer.querySelector(
          ".custom-color-picker"
        );
        const customColorInput = colorPicker.querySelector(
          ".custom-color-input"
        );

        colorPicker.addEventListener("click", (e) => {
          if (e.target.classList.contains("color-swatch")) {
            customColorInput.value = e.target.dataset.color;
          }
        });
      },
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        return [
          document.getElementById("swal-input1").value,
          document.getElementById("swal-input2").value,
          document.querySelector("#swal-color-picker .custom-color-input")
            .value,
        ];
      },
    });

    if (formValues) {
      const [name, description, color] = formValues;

      if (!name) {
        Swal.fire(
          "Error",
          "El nombre de la categoría es obligatorio.",
          "error"
        );
        return;
      }

      const { data: newCategory, error } = await supabase
        .from("categories")
        .insert({
          thesaurus_id: state.activeThesaurusId,
          name,
          description,
          color,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating new category:", error);
        Swal.fire("Error", "No se pudo crear la nueva categoría.", "error");
        return;
      }

      // Add the new category to the state
      state.categories.push(newCategory);
      renderCategories(); // Update the category list in the editor

      // Assign the new category to the concept
      await setNodeCategory(conceptId, newCategory.id);

      Swal.fire("Éxito", `Categoría "${name}" creada y asignada.`, "success");
    }
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

  function showLinkTooltip(event, d) {
    let tooltipContent = `<strong>Relación:</strong> ${d.relationship_type}<br>`;

    if (d.temporal_start || d.temporal_end || d.temporal_relevance) {
      tooltipContent += `<strong>Historicidad:</strong><br>`;
      if (d.temporal_start) tooltipContent += `Inicio: ${d.temporal_start}<br>`;
      if (d.temporal_end) tooltipContent += `Fin: ${d.temporal_end}<br>`;
      if (d.temporal_relevance)
        tooltipContent += `Relevancia: ${d.temporal_relevance}`;
    } else {
      tooltipContent += `<em>Sin historicidad definida</em><br>`;
      tooltipContent += `<small>Clic derecho para editar</small>`;
    }

    tooltip.classList.remove("hidden");
    tooltip.innerHTML = tooltipContent;
    moveTooltip(event);
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
        return `<option value="${c.id}">${
          prefLabel || "Sin etiqueta"
        }</option>`;
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

    // Cargar campos de historicidad
    temporalStartInput.value = concept.temporal_start || "";
    temporalEndInput.value = concept.temporal_end || "";
    temporalRelevanceInput.value = concept.temporal_relevance || "";

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
    // Actualizar sistema temporal si está inicializado
    if (typeof temporalState !== "undefined" && temporalState.currentYear) {
      calculateTemporalRange();
      updateGraphByYear(temporalState.currentYear, false);
    }
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

        // Validar que todos los conceptos tengan prefLabel
        for (const concept of data.concepts) {
          const hasPrefLabel =
            concept.labels &&
            concept.labels.some((l) => l.label_type === "prefLabel");
          if (!hasPrefLabel) {
            throw new Error(
              `El concepto con ID ${concept.id} no tiene una etiqueta preferida (prefLabel).`
            );
          }
        }
        // Elegir destino de importación
        let importOptions = {};
        if (state.activeThesaurusId) {
          importOptions.current = "Importar en tesauro actual";
        }
        importOptions.new = "Crear nuevo tesauro";

        const { value: choice } = await Swal.fire({
          title: "Elegir destino de importación",
          input: "select",
          inputOptions: importOptions,
          inputPlaceholder: "Selecciona una opción",
          showCancelButton: true,
          inputValidator: (value) => {
            if (!value) {
              return "Debes seleccionar una opción";
            }
          },
        });

        if (!choice) return; // Cancelado

        let targetThesaurusId = state.activeThesaurusId;
        if (choice === "new") {
          const { value: newTitle } = await Swal.fire({
            title: "Nombre del nuevo tesauro",
            input: "text",
            inputPlaceholder: "Ingresa el título del tesauro",
            showCancelButton: true,
            inputValidator: (value) => {
              if (!value) {
                return "El título es obligatorio";
              }
            },
          });

          if (!newTitle) return;

          const { data: newThesaurus, error } = await supabase
            .from("thesauruses")
            .insert({ title: newTitle, user_id: state.user.id })
            .select()
            .single();

          if (error) throw error;

          state.thesauruses.push(newThesaurus);
          renderThesaurusSelector();
          thesaurusSelect.value = newThesaurus.id;
          state.activeThesaurusId = newThesaurus.id;
          renderThesaurusDetails(newThesaurus);
          targetThesaurusId = newThesaurus.id;
        }

        const result = await Swal.fire({
          title: "¿Estás seguro?",
          text: `Vas a importar ${data.concepts.length} conceptos y ${data.relationships.length} relaciones. Esto puede crear duplicados si ya existen.`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Sí, ¡importar!",
        });

        if (!result.isConfirmed) return;

        loader.classList.remove("hidden");

        const colors = [
          "#f44336",
          "#e91e63",
          "#9c27b0",
          "#673ab7",
          "#3f51b5",
          "#2196f3",
          "#009688",
          "#4caf50",
          "#cddc39",
          "#ffeb3b",
          "#ff9800",
          "#795548",
        ];

        const categories = data.concepts.filter((c) => !c.category_id);
        const normalConcepts = data.concepts.filter((c) => c.category_id);

        const conceptIdMap = new Map();
        const categoryIdMap = new Map();

        // Procesar categorías primero
        for (const cat of categories) {
          const oldId = cat.id;
          const { data: newConcept, error: conceptError } = await supabase
            .from("concepts")
            .insert({ thesaurus_id: targetThesaurusId })
            .select("id")
            .single();
          if (conceptError) throw conceptError;
          conceptIdMap.set(oldId, newConcept.id);

          if (cat.labels) {
            const labelsToInsert = cat.labels.map((l) => ({
              label_type: l.label_type,
              label_text: l.label_text,
              concept_id: newConcept.id,
            }));
            await supabase.from("labels").insert(labelsToInsert);
          }
          if (cat.notes) {
            const notesToInsert = cat.notes.map((n) => ({
              note_type: n.note_type,
              note_text: n.note_text,
              concept_id: newConcept.id,
            }));
            await supabase.from("notes").insert(notesToInsert);
          }

          // Crear categoría
          const prefLabel =
            cat.labels.find((l) => l.label_type === "prefLabel")?.label_text ||
            "Sin Nombre";
          const randomColor = colors[Math.floor(Math.random() * colors.length)];
          const { data: newCategory, error: categoryError } = await supabase
            .from("categories")
            .insert({
              thesaurus_id: targetThesaurusId,
              name: prefLabel,
              description:
                cat.notes.find((n) => n.note_type === "definition")
                  ?.note_text || "",
              color: randomColor,
            })
            .select("id")
            .single();
          if (categoryError) throw categoryError;
          categoryIdMap.set(oldId, newCategory.id);
        }

        // Procesar conceptos normales
        for (const concept of normalConcepts) {
          const oldId = concept.id;
          const categoryId = categoryIdMap.get(concept.category_id);
          const { data: newConcept, error } = await supabase
            .from("concepts")
            .insert({
              thesaurus_id: targetThesaurusId,
              category_id: categoryId,
            })
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

  // --- 11. SISTEMA TEMPORAL (4ª DIMENSIÓN) ---

  // Estado del sistema temporal
  let temporalState = {
    currentYear: 2030,
    minYear: 1950,
    maxYear: 2030,
    isPlaying: false,
    animationInterval: null,
    showFutureConcepts: true,
    animationSpeed: 200, // milisegundos por año
    isActive: true, // Nueva: indica si el filtro temporal está activo
  };

  // Elementos del DOM para el sistema temporal
  const timelineSlider = document.getElementById("timeline-slider");
  const currentYearDisplay = document.getElementById("current-year-display");
  const playBtn = document.getElementById("play-btn");
  const pauseBtn = document.getElementById("pause-btn");
  const resetBtn = document.getElementById("reset-btn");
  const showFutureCheckbox = document.getElementById("show-future-checkbox");
  const toggleTimelineBtn = document.getElementById("toggle-timeline-btn");
  const closeTimelineBtn = document.getElementById("close-timeline-btn");
  const timelineContainer = document.getElementById("timeline-container");
  const speedSlider = document.getElementById("speed-slider");
  const speedDisplay = document.getElementById("speed-display");
  const configBtn = document.getElementById("config-btn");

  // Elementos del modal de configuración
  const timelineConfigModal = document.getElementById("timeline-config-modal");
  const timelineConfigCloseBtn = document.getElementById(
    "timeline-config-close-btn"
  );
  const timelineConfigForm = document.getElementById("timeline-config-form");
  const timelineMinYearInput = document.getElementById("timeline-min-year");
  const timelineMaxYearInput = document.getElementById("timeline-max-year");
  const timelineConfigAutoBtn = document.getElementById(
    "timeline-config-auto-btn"
  );
  const timelineConfigCancelBtn = document.getElementById(
    "timeline-config-cancel-btn"
  );

  /**
   * Determina si un concepto debe ser visible en el año actual
   */
  function isConceptVisibleInYear(concept, year, showFuture) {
    const start = concept.temporal_start;
    const end = concept.temporal_end;

    // Si no tiene información temporal, siempre es visible
    if (!start && !end) {
      return true;
    }

    // Si solo tiene inicio
    if (start && !end) {
      if (showFuture) {
        return year >= start;
      } else {
        return year >= start && year <= temporalState.maxYear;
      }
    }

    // Si solo tiene fin
    if (!start && end) {
      return year <= end;
    }

    // Si tiene ambos
    return year >= start && year <= end;
  }

  /**
   * Determina si una relación debe ser visible en el año actual
   */
  function isRelationshipVisibleInYear(relationship, year, showFuture) {
    const start = relationship.temporal_start;
    const end = relationship.temporal_end;

    // Si no tiene información temporal, siempre es visible
    if (!start && !end) {
      return true;
    }

    // Si solo tiene inicio
    if (start && !end) {
      if (showFuture) {
        return year >= start;
      } else {
        return year >= start && year <= temporalState.maxYear;
      }
    }

    // Si solo tiene fin
    if (!start && end) {
      return year <= end;
    }

    // Si tiene ambos
    return year >= start && year <= end;
  }

  /**
   * Calcula la opacidad basada en la relevancia temporal
   */
  function getTemporalOpacity(item) {
    if (
      item.temporal_relevance !== null &&
      item.temporal_relevance !== undefined
    ) {
      return 0.3 + item.temporal_relevance * 0.7;
    }
    return 1.0;
  }

  /**
   * Actualiza la visualización del grafo basándose en el año actual
   */
  function updateGraphByYear(year, animate = true) {
    if (!node || !link) return;

    // Si el filtro temporal no está activo, mostrar todo con opacidad completa
    if (!temporalState.isActive) {
      node
        .transition()
        .duration(animate ? 500 : 0)
        .style("opacity", 1)
        .attr("pointer-events", "all");

      link
        .transition()
        .duration(animate ? 500 : 0)
        .style("opacity", function (d) {
          return getTemporalOpacity(d);
        })
        .attr("pointer-events", "all");

      return;
    }

    const showFuture = temporalState.showFutureConcepts;

    // Filtrar y actualizar nodos
    node
      .transition()
      .duration(animate ? 500 : 0)
      .style("opacity", function (d) {
        const visible = isConceptVisibleInYear(d.fullConcept, year, showFuture);
        if (!visible) return 0;
        return getTemporalOpacity(d.fullConcept);
      })
      .attr("pointer-events", function (d) {
        const visible = isConceptVisibleInYear(d.fullConcept, year, showFuture);
        return visible ? "all" : "none";
      });

    // Efecto de "aparición" para nodos nuevos
    node.each(function (d) {
      const isVisible = isConceptVisibleInYear(d.fullConcept, year, showFuture);
      const startYear = d.fullConcept.temporal_start;

      if (isVisible && startYear === year && animate) {
        d3.select(this)
          .select("circle")
          .transition()
          .duration(800)
          .attr("r", 10)
          .ease(d3.easeBounceOut)
          .on("start", function () {
            d3.select(this).attr("r", 0);
          });
      }
    });

    // Filtrar y actualizar relaciones
    link
      .transition()
      .duration(animate ? 500 : 0)
      .style("opacity", function (d) {
        // Verificar que ambos nodos de la relación sean visibles
        const sourceConcept = state.concepts.find(
          (c) => c.id === d.source_concept_id || c.id === d.source.id
        );
        const targetConcept = state.concepts.find(
          (c) => c.id === d.target_concept_id || c.id === d.target.id
        );

        if (!sourceConcept || !targetConcept) return 0;

        const sourceVisible = isConceptVisibleInYear(
          sourceConcept,
          year,
          showFuture
        );
        const targetVisible = isConceptVisibleInYear(
          targetConcept,
          year,
          showFuture
        );
        const relationVisible = isRelationshipVisibleInYear(
          d,
          year,
          showFuture
        );

        if (!sourceVisible || !targetVisible || !relationVisible) return 0;

        return getTemporalOpacity(d);
      })
      .attr("pointer-events", function (d) {
        const sourceConcept = state.concepts.find(
          (c) => c.id === d.source_concept_id || c.id === d.source.id
        );
        const targetConcept = state.concepts.find(
          (c) => c.id === d.target_concept_id || c.id === d.target.id
        );

        if (!sourceConcept || !targetConcept) return "none";

        const sourceVisible = isConceptVisibleInYear(
          sourceConcept,
          year,
          showFuture
        );
        const targetVisible = isConceptVisibleInYear(
          targetConcept,
          year,
          showFuture
        );
        const relationVisible = isRelationshipVisibleInYear(
          d,
          year,
          showFuture
        );

        return sourceVisible && targetVisible && relationVisible
          ? "all"
          : "none";
      });
  }

  /**
   * Actualiza el display del año actual
   */
  function updateYearDisplay(year) {
    if (!currentYearDisplay) return;
    currentYearDisplay.textContent = year;
    temporalState.currentYear = year;
  }

  /**
   * Maneja el cambio del slider temporal
   */
  function handleTimelineChange(event) {
    const year = parseInt(event.target.value);
    updateYearDisplay(year);
    updateGraphByYear(year, false);
  }

  /**
   * Inicia la animación temporal
   */
  function startTemporalAnimation() {
    if (temporalState.isPlaying) return;

    temporalState.isPlaying = true;
    playBtn.classList.add("hidden");
    pauseBtn.classList.remove("hidden");

    // Si ya está al final, reiniciar
    if (temporalState.currentYear >= temporalState.maxYear) {
      temporalState.currentYear = temporalState.minYear;
      timelineSlider.value = temporalState.currentYear;
    }

    temporalState.animationInterval = setInterval(() => {
      temporalState.currentYear++;

      if (temporalState.currentYear > temporalState.maxYear) {
        stopTemporalAnimation();
        return;
      }

      timelineSlider.value = temporalState.currentYear;
      updateYearDisplay(temporalState.currentYear);
      updateGraphByYear(temporalState.currentYear, true);
    }, temporalState.animationSpeed);
  }

  /**
   * Detiene la animación temporal
   */
  function stopTemporalAnimation() {
    temporalState.isPlaying = false;
    playBtn.classList.remove("hidden");
    pauseBtn.classList.add("hidden");

    if (temporalState.animationInterval) {
      clearInterval(temporalState.animationInterval);
      temporalState.animationInterval = null;
    }
  }

  /**
   * Resetea la línea temporal
   */
  function resetTimeline() {
    stopTemporalAnimation();
    temporalState.currentYear = temporalState.maxYear;
    timelineSlider.value = temporalState.maxYear;
    updateYearDisplay(temporalState.maxYear);
    updateGraphByYear(temporalState.maxYear, true);
  }

  /**
   * Toggle para mostrar/ocultar conceptos futuros
   */
  function handleShowFutureToggle(event) {
    temporalState.showFutureConcepts = event.target.checked;
    updateGraphByYear(temporalState.currentYear, true);
  }

  /**
   * Toggle para expandir/colapsar el timeline
   */
  function toggleTimelinePanel() {
    if (!timelineContainer || !toggleTimelineBtn) return;

    timelineContainer.classList.toggle("timeline-expanded");
    timelineContainer.classList.toggle("timeline-collapsed");

    if (timelineContainer.classList.contains("timeline-collapsed")) {
      toggleTimelineBtn.textContent = "▲";
    } else {
      toggleTimelineBtn.textContent = "▼";
    }
  }

  /**
   * Cierra el filtro temporal y muestra todos los conceptos
   */
  function closeTemporalFilter() {
    // Detener animación si está en curso
    stopTemporalAnimation();

    // Desactivar el filtro temporal
    temporalState.isActive = false;

    // Mostrar todos los nodos y relaciones
    updateGraphByYear(temporalState.currentYear, true);

    // Ocultar el panel temporal
    const temporalControls = document.getElementById("temporal-controls");
    const reactivateBtn = document.getElementById("reactivate-timeline-btn");
    if (temporalControls) {
      temporalControls.style.display = "none";
    }
    if (reactivateBtn) {
      reactivateBtn.classList.add("show");
    }

    Swal.fire({
      title: "Filtro Temporal Desactivado",
      text: "Se muestran todos los conceptos y relaciones sin restricción temporal.",
      icon: "info",
      timer: 2000,
      showConfirmButton: false,
    });
  }

  /**
   * Reactiva el filtro temporal
   */
  function activateTemporalFilter() {
    temporalState.isActive = true;
    const temporalControls = document.getElementById("temporal-controls");
    const reactivateBtn = document.getElementById("reactivate-timeline-btn");
    if (temporalControls) {
      temporalControls.style.display = "block";
    }
    if (reactivateBtn) {
      reactivateBtn.classList.remove("show");
    }
    updateGraphByYear(temporalState.currentYear, true);

    Swal.fire({
      title: "Filtro Temporal Activado",
      text: "El grafo ahora muestra conceptos según el año seleccionado.",
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
    });
  }

  /**
   * Maneja el cambio de velocidad de animación
   */
  function handleSpeedChange(event) {
    const speed = parseInt(event.target.value);
    temporalState.animationSpeed = speed;
    if (speedDisplay) {
      speedDisplay.textContent = `${speed}ms`;
    }

    // Si está reproduciendo, reiniciar con nueva velocidad
    if (temporalState.isPlaying) {
      stopTemporalAnimation();
      startTemporalAnimation();
    }
  }

  /**
   * Abre el modal de configuración de rango temporal
   */
  function openTimelineConfig() {
    if (!timelineConfigModal || !timelineMinYearInput || !timelineMaxYearInput)
      return;

    // Llenar con valores actuales
    timelineMinYearInput.value = temporalState.minYear;
    timelineMaxYearInput.value = temporalState.maxYear;

    timelineConfigModal.classList.remove("hidden");
  }

  /**
   * Cierra el modal de configuración de rango temporal
   */
  function closeTimelineConfig() {
    if (!timelineConfigModal) return;
    timelineConfigModal.classList.add("hidden");
  }

  /**
   * Aplica el nuevo rango temporal
   */
  function applyTimelineRange(e) {
    e.preventDefault();

    const minYear = parseInt(timelineMinYearInput.value);
    const maxYear = parseInt(timelineMaxYearInput.value);

    // Validación
    if (isNaN(minYear) || isNaN(maxYear)) {
      Swal.fire("Error", "Por favor ingresa años válidos.", "error");
      return;
    }

    if (minYear >= maxYear) {
      Swal.fire(
        "Error",
        "El año mínimo debe ser menor que el año máximo.",
        "error"
      );
      return;
    }

    // Aplicar nuevo rango
    temporalState.minYear = minYear;
    temporalState.maxYear = maxYear;
    temporalState.currentYear = maxYear;

    // Actualizar slider
    if (timelineSlider) {
      timelineSlider.min = minYear;
      timelineSlider.max = maxYear;
      timelineSlider.value = maxYear;
    }

    // Actualizar etiquetas y display
    updateTimelineLabels();
    updateYearDisplay(maxYear);
    updateGraphByYear(maxYear, true);

    closeTimelineConfig();

    Swal.fire({
      title: "¡Rango Actualizado!",
      text: `Nuevo rango: ${minYear} - ${maxYear}`,
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
    });
  }

  /**
   * Calcula automáticamente el rango basado en los datos
   */
  function autoCalculateRange() {
    calculateTemporalRange();

    // Actualizar inputs del modal
    if (timelineMinYearInput && timelineMaxYearInput) {
      timelineMinYearInput.value = temporalState.minYear;
      timelineMaxYearInput.value = temporalState.maxYear;
    }

    Swal.fire({
      title: "Rango Calculado",
      text: `Rango automático: ${temporalState.minYear} - ${temporalState.maxYear}`,
      icon: "info",
      timer: 2000,
      showConfirmButton: false,
    });
  }

  /**
   * Calcula el rango temporal de los datos actuales
   */
  function calculateTemporalRange() {
    // Verificar que los elementos del DOM existan
    if (!timelineSlider || !currentYearDisplay) return;

    let minYear = 1950;
    let maxYear = 2030;

    state.concepts.forEach((concept) => {
      if (concept.temporal_start && concept.temporal_start < minYear) {
        minYear = concept.temporal_start;
      }
      if (concept.temporal_end && concept.temporal_end > maxYear) {
        maxYear = concept.temporal_end;
      }
    });

    state.relationships.forEach((rel) => {
      if (rel.temporal_start && rel.temporal_start < minYear) {
        minYear = rel.temporal_start;
      }
      if (rel.temporal_end && rel.temporal_end > maxYear) {
        maxYear = rel.temporal_end;
      }
    });

    // Redondear a décadas
    minYear = Math.floor(minYear / 10) * 10;
    maxYear = Math.ceil(maxYear / 10) * 10;

    temporalState.minYear = minYear;
    temporalState.maxYear = maxYear;
    temporalState.currentYear = maxYear;

    // Actualizar el slider
    timelineSlider.min = minYear;
    timelineSlider.max = maxYear;
    timelineSlider.value = maxYear;

    // Actualizar las etiquetas
    updateTimelineLabels();
    updateYearDisplay(maxYear);
  }

  /**
   * Actualiza las etiquetas de la línea temporal
   */
  function updateTimelineLabels() {
    const labelsContainer = document.getElementById("timeline-labels");
    if (!labelsContainer) return;

    const range = temporalState.maxYear - temporalState.minYear;
    const step = Math.ceil(range / 4);

    labelsContainer.innerHTML = "";
    for (let i = 0; i < 5; i++) {
      const year = temporalState.minYear + step * i;
      const span = document.createElement("span");
      span.textContent = year;
      labelsContainer.appendChild(span);
    }
  }

  /**
   * Inicializa el sistema temporal
   */
  function initializeTemporalSystem() {
    // Verificar que los elementos esenciales existan
    if (
      !timelineSlider ||
      !playBtn ||
      !pauseBtn ||
      !resetBtn ||
      !showFutureCheckbox ||
      !toggleTimelineBtn ||
      !currentYearDisplay
    ) {
      console.warn(
        "Elementos del timeline no encontrados, sistema temporal no inicializado"
      );
      return;
    }

    // Event listeners principales
    timelineSlider.addEventListener("input", handleTimelineChange);
    playBtn.addEventListener("click", startTemporalAnimation);
    pauseBtn.addEventListener("click", stopTemporalAnimation);
    resetBtn.addEventListener("click", resetTimeline);
    showFutureCheckbox.addEventListener("change", handleShowFutureToggle);
    toggleTimelineBtn.addEventListener("click", toggleTimelinePanel);

    // Event listeners nuevos
    if (closeTimelineBtn) {
      closeTimelineBtn.addEventListener("click", closeTemporalFilter);
    }

    // Botón flotante de reactivación
    const reactivateBtn = document.getElementById("reactivate-timeline-btn");
    if (reactivateBtn) {
      reactivateBtn.addEventListener("click", activateTemporalFilter);
    }

    if (speedSlider) {
      speedSlider.addEventListener("input", handleSpeedChange);
      // Inicializar display de velocidad
      if (speedDisplay) {
        speedDisplay.textContent = `${temporalState.animationSpeed}ms`;
      }
    }

    if (configBtn) {
      configBtn.addEventListener("click", openTimelineConfig);
    }

    // Event listeners del modal de configuración
    if (timelineConfigModal) {
      if (timelineConfigCloseBtn) {
        timelineConfigCloseBtn.addEventListener("click", closeTimelineConfig);
      }

      if (timelineConfigForm) {
        timelineConfigForm.addEventListener("submit", applyTimelineRange);
      }

      if (timelineConfigAutoBtn) {
        timelineConfigAutoBtn.addEventListener("click", autoCalculateRange);
      }

      if (timelineConfigCancelBtn) {
        timelineConfigCancelBtn.addEventListener("click", closeTimelineConfig);
      }

      // Cerrar modal al hacer clic fuera
      timelineConfigModal.addEventListener("click", (e) => {
        if (e.target === timelineConfigModal) {
          closeTimelineConfig();
        }
      });
    }

    // Calcular rango temporal inicial
    calculateTemporalRange();
  }

  // --- 12. INICIALIZACIÓN ---
  async function initialize() {
    await fetchUserThesauruses();
    clearCategoryForm();
    initializeTemporalSystem();
  }

  checkUserSession();
});
