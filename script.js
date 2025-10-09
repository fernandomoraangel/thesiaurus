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
  const citationsInput = document.getElementById("citations");
  const worksInput = document.getElementById("works");
  const mediaInput = document.getElementById("media");

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

  // Elementos de Zotero
  const zoteroConfigForm = document.getElementById("zotero-config-form");
  const zoteroApiKeyInput = document.getElementById("zotero-api-key");
  const zoteroTypeSelect = document.getElementById("zotero-type");
  const zoteroIdInput = document.getElementById("zotero-id");
  const zoteroStyleSelect = document.getElementById("zotero-style");
  const testZoteroBtn = document.getElementById("test-zotero-btn");
  const zoteroStatus = document.getElementById("zotero-status");
  const importZoteroBtn = document.getElementById("import-zotero-btn");
  const zoteroModal = document.getElementById("zotero-modal");
  const zoteroModalCloseBtn = document.getElementById("zotero-modal-close-btn");
  const zoteroSearchInput = document.getElementById("zotero-search-input");
  const zoteroSearchBtn = document.getElementById("zotero-search-btn");
  const zoteroResults = document.getElementById("zotero-results");
  const zoteroLoader = document.getElementById("zotero-loader");
  const zoteroAddSelectedBtn = document.getElementById(
    "zotero-add-selected-btn"
  );
  const zoteroCancelBtn = document.getElementById("zotero-cancel-btn");

  // Inicializar Zotero Integration
  let zotero = null;
  if (typeof ZoteroIntegration !== "undefined") {
    zotero = new ZoteroIntegration();
    // Cargar configuración guardada en el formulario
    if (zotero.isConfigured()) {
      zoteroApiKeyInput.value = zotero.apiKey || "";
      zoteroTypeSelect.value = zotero.libraryType || "user";
      zoteroIdInput.value = zotero.libraryId || "";
      zoteroStyleSelect.value = zotero.citationStyle || "apa";

      // Ocultar la ayuda de API Key si ya está configurado
      const apiHelp = document.getElementById("zotero-api-help");
      if (apiHelp) {
        apiHelp.classList.add("hidden");
      }
    }
  }

  // --- 3. ESTADO DE LA APLICACIÓN Y CONFIGURACIÓN DE D3 ---
  let state = {
    concepts: [],
    relationships: [], // Fuente de verdad única para las relaciones
    thesauruses: [],
    categories: [],
    activeThesaurusId: null,
    user: null,
    positioningMode: {
      active: false,
      conceptId: null,
      conceptName: null,
    },
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
      return;
    }
    // No modificar el estado de colapso - dejar que el usuario lo controle
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
            "id, created_at, category_id, temporal_start, temporal_end, temporal_relevance, fixed_x, fixed_y, citations, works, media, shape, size"
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

    // Procesar los arrays de citations, works y media
    const citations = citationsInput.value
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);
    const works = worksInput.value
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);
    const media = mediaInput.value
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);

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
            citations: citations,
            works: works,
            media: media,
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
            citations: citations,
            works: works,
            media: media,
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

      // Si es un concepto nuevo, activar modo de posicionamiento
      const isNewConcept = !conceptId;

      if (isNewConcept) {
        Swal.fire({
          title: "Concepto Guardado",
          text: "Haz clic en el grafo para posicionar el nuevo nodo",
          icon: "success",
          timer: 2500,
          showConfirmButton: false,
        });

        // Activar modo de posicionamiento
        state.positioningMode.active = true;
        state.positioningMode.conceptId = currentConceptId;
        state.positioningMode.conceptName = prefLabel.text;

        // Actualizar datos y activar modo visual
        await fetchAllConceptData();
        clearForm();
        activatePositioningMode();
      } else {
        Swal.fire("Éxito", "Concepto actualizado correctamente.", "success");
        await fetchAllConceptData();
        clearForm();
      }
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

        // La posición fija se elimina automáticamente con el concepto

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

    // Cargar posiciones fijas desde localStorage
    loadFixedPositions(nodes);

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

    // Remover nodos que ya no existen
    node.exit().remove();

    // Para los nodos que necesitan actualización de forma/tamaño, los removemos y recreamos
    node.each(function (d) {
      const currentNode = d3.select(this);
      const currentShape = currentNode.select(".node-shape");
      const storedShape = d.fullConcept.shape || "circle";
      const storedSize =
        d.fullConcept.size !== undefined ? d.fullConcept.size : 0.5;

      // Verificar si el nodo fue actualizado recientemente
      const lastUpdated = d.fullConcept._lastUpdated;
      const nodeLastUpdate =
        parseFloat(currentNode.attr("data-last-update")) || 0;

      // Obtener la forma y tamaño actuales del nodo
      let currentShapeType = "circle";
      let currentNodeSize =
        parseFloat(currentNode.attr("data-node-size")) || 0.5;

      if (currentShape.node()) {
        if (currentShape.node().tagName === "circle")
          currentShapeType = "circle";
        else if (currentShape.node().tagName === "rect")
          currentShapeType = "square";
        else if (currentShape.node().tagName === "path") {
          const d = currentShape.attr("d");
          if (d && d.includes("M 0,")) {
            if (d.split("L").length === 4) currentShapeType = "triangle";
            else if (d.split("L").length === 5) currentShapeType = "diamond";
            else currentShapeType = "star";
          }
        }
      }

      // Si cambió la forma, el tamaño, o fue actualizado recientemente, remover el nodo para recrearlo
      if (
        currentShapeType !== storedShape ||
        Math.abs(currentNodeSize - storedSize) > 0.001 ||
        (lastUpdated && lastUpdated > nodeLastUpdate) ||
        !currentShape.node()
      ) {
        currentNode.remove();
      }
    });

    // Volver a seleccionar después de las posibles remociones
    node = nodeGroup.selectAll(".node").data(nodes, (d) => d.id);

    const nodeEnter = node
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("data-node-size", (d) =>
        d.fullConcept.size !== undefined ? d.fullConcept.size : 0.5
      )
      .attr("data-last-update", (d) => d.fullConcept._lastUpdated || 0)
      .call(
        d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      )
      .on("contextmenu", showContextMenu);

    nodeEnter.each(function (d) {
      const nodeGroup = d3.select(this);
      const shape = d.fullConcept.shape || "circle";
      const baseSize = 10;
      const sizeMultiplier =
        d.fullConcept.size !== undefined ? d.fullConcept.size : 0.5;
      const size = baseSize * (0.5 + sizeMultiplier * 1.5); // Escala de 0.5x a 2x

      // Crear la forma apropiada
      let shapeElement;
      switch (shape) {
        case "square":
          shapeElement = nodeGroup
            .append("rect")
            .attr("x", -size)
            .attr("y", -size)
            .attr("width", size * 2)
            .attr("height", size * 2);
          break;
        case "triangle":
          const trianglePath = `M 0,${-size} L ${size},${size} L ${-size},${size} Z`;
          shapeElement = nodeGroup.append("path").attr("d", trianglePath);
          break;
        case "diamond":
          const diamondPath = `M 0,${-size} L ${size},0 L 0,${size} L ${-size},0 Z`;
          shapeElement = nodeGroup.append("path").attr("d", diamondPath);
          break;
        case "star":
          const starPoints = 5;
          const outerRadius = size;
          const innerRadius = size * 0.4;
          let starPath = "";
          for (let i = 0; i < starPoints * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / starPoints - Math.PI / 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            starPath += (i === 0 ? "M" : "L") + ` ${x},${y}`;
          }
          starPath += " Z";
          shapeElement = nodeGroup.append("path").attr("d", starPath);
          break;
        case "circle":
        default:
          shapeElement = nodeGroup.append("circle").attr("r", size);
          break;
      }

      // Aplicar atributos comunes a todas las formas
      shapeElement
        .attr("class", "node-shape")
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
        .on("click", (event, d) => {
          if (event.shiftKey) {
            showConceptModal(d.fullConcept);
          } else {
            showConceptDetails(d.fullConcept);
          }
        })
        .on("dblclick", (event, d) => {
          // Doble clic libera el nodo fijo
          d.fx = null;
          d.fy = null;
          // Actualizar indicador visual
          d3.select(event.target)
            .attr("stroke", "#fff")
            .attr("stroke-width", 2);
          // Remover de base de datos
          removeFixedNodePosition(d.id);
          simulation.alpha(0.3).restart();
        })
        .on("mouseover", showTooltip)
        .on("mousemove", moveTooltip)
        .on("mouseout", hideTooltip);
    });

    nodeEnter.append("text").attr("dy", -12);

    node = nodeEnter.merge(node);

    // Actualizar los atributos data en todos los nodos (nuevos y existentes)
    node.attr("data-node-size", (d) =>
      d.fullConcept.size !== undefined ? d.fullConcept.size : 0.5
    );
    node.attr("data-last-update", (d) => d.fullConcept._lastUpdated || 0);

    node.select(".node-shape").attr("fill", (d) => {
      const category = state.categories.find(
        (cat) => cat.id === d.fullConcept.category_id
      );
      return category ? category.color : "#2c5282";
    });

    // Indicador visual para nodos fijos (anclados)
    node
      .select(".node-shape")
      .attr("stroke", (d) =>
        d.fx !== null && d.fx !== undefined ? "#ff6b6b" : "#fff"
      )
      .attr("stroke-width", (d) =>
        d.fx !== null && d.fx !== undefined ? 5 : 2
      );

    node.select("text").text((d) => d.name);

    simulation.alpha(1).restart();
  }

  // --- GESTIÓN DE POSICIONES FIJAS EN BASE DE DATOS ---
  async function saveFixedNodePosition(nodeId, x, y) {
    try {
      console.log(`💾 Saving fixed position for node ${nodeId}:`, { x, y });
      const { error } = await supabase
        .from("concepts")
        .update({
          fixed_x: x,
          fixed_y: y,
        })
        .eq("id", nodeId);

      if (error) {
        console.error("❌ Error saving fixed position:", error);
      } else {
        console.log("✅ Position saved successfully");
      }
    } catch (err) {
      console.error("❌ Error in saveFixedNodePosition:", err);
    }
  }

  async function removeFixedNodePosition(nodeId) {
    try {
      const { error } = await supabase
        .from("concepts")
        .update({
          fixed_x: null,
          fixed_y: null,
        })
        .eq("id", nodeId);

      if (error) {
        console.error("Error removing fixed position:", error);
      }
    } catch (err) {
      console.error("Error in removeFixedNodePosition:", err);
    }
  }

  function loadFixedPositions(nodes) {
    // Las posiciones fijas ahora vienen directamente de la base de datos
    // a través de fullConcept.fixed_x y fullConcept.fixed_y
    let fixedCount = 0;
    nodes.forEach((node) => {
      if (
        node.fullConcept.fixed_x !== null &&
        node.fullConcept.fixed_x !== undefined &&
        node.fullConcept.fixed_y !== null &&
        node.fullConcept.fixed_y !== undefined
      ) {
        // Establecer tanto posición fija (fx, fy) como posición inicial (x, y)
        node.fx = node.fullConcept.fixed_x;
        node.fy = node.fullConcept.fixed_y;
        node.x = node.fullConcept.fixed_x;
        node.y = node.fullConcept.fixed_y;
        fixedCount++;
      }
    });
    if (fixedCount > 0) {
      console.log(`✅ Loaded ${fixedCount} fixed node positions from database`);
    }
  }

  // --- MODO DE POSICIONAMIENTO MANUAL PARA NUEVOS NODOS ---
  function activatePositioningMode() {
    // Mostrar botón de cancelar
    const cancelBtn = document.getElementById("cancel-positioning-btn");
    if (cancelBtn) {
      cancelBtn.classList.remove("hidden");
    }

    // Cambiar cursor del SVG
    svg.style("cursor", "crosshair");

    // Añadir overlay semi-transparente
    const overlay = svg
      .append("rect")
      .attr("class", "positioning-overlay")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "rgba(52, 152, 219, 0.1)")
      .attr("stroke", "#3498db")
      .attr("stroke-width", 3)
      .attr("stroke-dasharray", "10,5")
      .style("pointer-events", "all");

    // Añadir texto de instrucción
    const instruction = svg
      .append("text")
      .attr("class", "positioning-instruction")
      .attr("x", width / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .attr("font-size", "18px")
      .attr("font-weight", "bold")
      .attr("fill", "#2c3e50")
      .attr("stroke", "white")
      .attr("stroke-width", 3)
      .attr("paint-order", "stroke")
      .text(
        `📍 Haz clic para posicionar: ${state.positioningMode.conceptName}`
      );

    // Handler de clic en el SVG
    overlay.on("click", handlePositioningClick);

    console.log("🎯 Modo de posicionamiento activado");
  }

  async function handlePositioningClick(event) {
    // Obtener coordenadas del clic relativas al SVG
    const pointer = d3.pointer(event, svg.node());

    // Obtener la transformación actual del zoom aplicada a nodeGroup
    const currentTransform = d3.zoomTransform(nodeGroup.node());

    // Invertir la transformación para obtener coordenadas en el espacio del grafo
    const [x, y] = currentTransform.invert(pointer);

    console.log(
      `📍 Clic en SVG: (${pointer[0].toFixed(2)}, ${pointer[1].toFixed(2)})`
    );
    console.log(`📍 Posición en grafo: (${x.toFixed(2)}, ${y.toFixed(2)})`);
    console.log(
      `📍 Transform: scale=${currentTransform.k.toFixed(
        2
      )}, tx=${currentTransform.x.toFixed(2)}, ty=${currentTransform.y.toFixed(
        2
      )}`
    );

    // Guardar la posición en la base de datos
    await saveFixedNodePosition(state.positioningMode.conceptId, x, y);

    // Desactivar modo de posicionamiento
    deactivatePositioningMode();

    // Recargar datos para mostrar el nodo en su nueva posición
    await fetchAllConceptData();

    Swal.fire({
      title: "¡Posición Guardada!",
      text: "El nodo ha sido posicionado correctamente",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
    });
  }

  function deactivatePositioningMode() {
    // Ocultar botón de cancelar
    const cancelBtn = document.getElementById("cancel-positioning-btn");
    if (cancelBtn) {
      cancelBtn.classList.add("hidden");
    }

    // Restaurar cursor
    svg.style("cursor", "default");

    // Remover overlay e instrucciones
    svg.select(".positioning-overlay").remove();
    svg.select(".positioning-instruction").remove();

    // Limpiar estado
    state.positioningMode.active = false;
    state.positioningMode.conceptId = null;
    state.positioningMode.conceptName = null;

    console.log("🎯 Modo de posicionamiento desactivado");
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
    // Mantener la posición fija (no liberar el nodo)
    // El nodo conservará su posición después de arrastrarlo
    // d.fx y d.fy ya están establecidos en dragged(), no los ponemos en null

    // Guardar posición en base de datos
    saveFixedNodePosition(d.id, d.fx, d.fy);

    // Actualizar indicador visual de nodo fijo
    // Buscar el nodo por su data y actualizar la forma
    d3.selectAll(".node")
      .filter((nodeData) => nodeData.id === d.id)
      .select(".node-shape")
      .attr("stroke", "#ff6b6b")
      .attr("stroke-width", 5);
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

    // --- SECCIÓN: CATEGORÍAS ---
    const categorySection = menu.append("div").attr("class", "menu-section");
    categorySection
      .append("div")
      .attr("class", "menu-section-title")
      .text("Categorías");

    const categoryList = categorySection.append("ul");

    categoryList
      .selectAll("li")
      .data(state.categories)
      .enter()
      .append("li")
      .attr("class", "menu-item")
      .html(
        (cat) =>
          `<span class="category-color-dot" style="background-color: ${cat.color};"></span><span>${cat.name}</span>`
      )
      .on("click", (e, cat) => {
        setNodeCategory(d.fullConcept.id, cat.id);
        menu.remove();
      });

    categoryList
      .append("li")
      .attr("class", "menu-item")
      .text("Sin categoría")
      .on("click", () => {
        setNodeCategory(d.fullConcept.id, null);
        menu.remove();
      });

    categoryList
      .append("li")
      .attr("class", "menu-item")
      .text("Nueva categoría...")
      .on("click", () => {
        menu.remove();
        promptNewCategory(d.fullConcept.id);
      });

    // --- SECCIÓN: FORMA ---
    const shapeSection = menu.append("div").attr("class", "menu-section");
    shapeSection
      .append("div")
      .attr("class", "menu-section-title")
      .text("Forma del Nodo");

    const shapes = [
      { name: "Círculo", value: "circle", icon: "●" },
      { name: "Cuadrado", value: "square", icon: "■" },
      { name: "Triángulo", value: "triangle", icon: "▲" },
      { name: "Rombo", value: "diamond", icon: "◆" },
      { name: "Estrella", value: "star", icon: "★" },
    ];

    const shapeList = shapeSection.append("ul");
    const currentShape = d.fullConcept.shape || "circle";

    shapes.forEach((shape) => {
      shapeList
        .append("li")
        .attr("class", () => {
          return currentShape === shape.value
            ? "menu-item selected"
            : "menu-item";
        })
        .html(
          `<span style="font-size: 16px; margin-right: 8px;">${shape.icon}</span><span>${shape.name}</span>`
        )
        .on("click", async () => {
          await updateNodeShape(d.fullConcept.id, shape.value);
          menu.remove();
        });
    });

    // Botón de reset para forma
    shapeList
      .append("li")
      .attr("class", "menu-item reset-item")
      .html(
        '<span style="font-size: 16px; margin-right: 8px;">↺</span><span>Restablecer (Círculo)</span>'
      )
      .style("border-top", "1px solid #e2e8f0")
      .style("margin-top", "4px")
      .style("font-style", "italic")
      .style("color", "#718096")
      .on("click", async () => {
        await updateNodeShape(d.fullConcept.id, "circle");
        menu.remove();
      });

    // --- SECCIÓN: TAMAÑO ---
    const sizeSection = menu.append("div").attr("class", "menu-section");
    sizeSection
      .append("div")
      .attr("class", "menu-section-title")
      .text("Tamaño del Nodo");

    const currentSize =
      d.fullConcept.size !== undefined ? d.fullConcept.size : 0.5;

    const sizeControl = sizeSection
      .append("div")
      .attr("class", "menu-item size-control")
      .style("display", "block")
      .style("padding", "12px");

    const sizeSlider = sizeControl
      .append("input")
      .attr("type", "range")
      .attr("min", "0")
      .attr("max", "1")
      .attr("step", "0.1")
      .attr("value", currentSize)
      .style("width", "100%")
      .style("margin-bottom", "8px");

    const sizeDisplay = sizeControl
      .append("div")
      .attr("class", "size-display")
      .style("text-align", "center")
      .style("font-size", "14px")
      .style("color", "#2c5282")
      .style("font-weight", "600")
      .text(`${Math.round(currentSize * 100)}%`);

    sizeSlider.on("input", function () {
      const value = this.value;
      sizeDisplay.text(`${Math.round(value * 100)}%`);
    });

    sizeSlider.on("change", async function () {
      const value = parseFloat(this.value);
      await updateNodeSize(d.fullConcept.id, value);
    });

    // Botón de reset para tamaño
    const sizeResetBtn = sizeSection
      .append("div")
      .attr("class", "menu-item reset-item")
      .html(
        '<span style="font-size: 14px; margin-right: 8px;">↺</span><span>Restablecer (50%)</span>'
      )
      .style("text-align", "center")
      .style("border-top", "1px solid #e2e8f0")
      .style("margin-top", "4px")
      .style("padding", "8px")
      .style("font-style", "italic")
      .style("color", "#718096")
      .style("cursor", "pointer")
      .on("click", async () => {
        await updateNodeSize(d.fullConcept.id, 0.5);
        menu.remove();
      });

    // Ajustar posición del menú si se sale de la pantalla
    // Esperar un frame para que el navegador calcule el tamaño del menú
    setTimeout(() => {
      const menuNode = menu.node();
      const menuRect = menuNode.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;

      let finalX = event.pageX;
      let finalY = event.pageY;

      // Ajustar verticalmente si se sale por abajo
      if (menuRect.bottom > windowHeight) {
        // Intentar posicionar hacia arriba
        finalY = event.pageY - menuRect.height;

        // Si aún así se sale por arriba, posicionar en el límite superior
        if (finalY < 0) {
          finalY = 10; // Pequeño margen desde arriba
        }
      }

      // Ajustar horizontalmente si se sale por la derecha
      if (menuRect.right > windowWidth) {
        finalX = event.pageX - menuRect.width;

        // Si se sale por la izquierda, posicionar en el límite izquierdo
        if (finalX < 0) {
          finalX = 10;
        }
      }

      // Aplicar posición ajustada
      menu.style("left", `${finalX}px`).style("top", `${finalY}px`);
    }, 0);

    // Close menu on outside click
    setTimeout(() => {
      d3.select("body").on("click.context-menu", () => {
        menu.remove();
        d3.select("body").on("click.context-menu", null);
      });
    }, 100);
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

  async function updateNodeShape(conceptId, shape) {
    const { error } = await supabase
      .from("concepts")
      .update({ shape: shape })
      .eq("id", conceptId);

    if (error) {
      console.error("Error updating node shape:", error);
      Swal.fire("Error", "No se pudo actualizar la forma del nodo.", "error");
    } else {
      // Update local state
      const concept = state.concepts.find((c) => c.id === conceptId);
      if (concept) {
        concept.shape = shape;
        // Agregar marca de tiempo para forzar actualización
        concept._lastUpdated = Date.now();
      }
      updateGraph();
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Forma actualizada",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  }

  async function updateNodeSize(conceptId, size) {
    const { error } = await supabase
      .from("concepts")
      .update({ size: size })
      .eq("id", conceptId);

    if (error) {
      console.error("Error updating node size:", error);
      Swal.fire("Error", "No se pudo actualizar el tamaño del nodo.", "error");
    } else {
      // Update local state
      const concept = state.concepts.find((c) => c.id === conceptId);
      if (concept) {
        concept.size = size;
        // Agregar marca de tiempo para forzar actualización
        concept._lastUpdated = Date.now();
      }
      updateGraph();
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Tamaño actualizado",
        showConfirmButton: false,
        timer: 1500,
      });
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

    // Cargar campos de citations, works y media
    citationsInput.value = concept.citations
      ? concept.citations.join("\n")
      : "";
    worksInput.value = concept.works ? concept.works.join("\n") : "";
    mediaInput.value = concept.media ? concept.media.join("\n") : "";

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

    // Funciones auxiliares para obtener arrays
    const getCitations = () => {
      if (concept.citations && concept.citations.length > 0) {
        return concept.citations.map((c) => `<li>${c}</li>`).join("");
      }
      return "<li>Ninguna</li>";
    };

    const getWorks = () => {
      if (concept.works && concept.works.length > 0) {
        return concept.works.map((w) => `<li>${w}</li>`).join("");
      }
      return "<li>Ninguna</li>";
    };

    const getMedia = () => {
      if (concept.media && concept.media.length > 0) {
        const mediaElements = concept.media
          .map((m) => {
            const mediaType = detectMediaType(m);
            return renderMediaElement(m, mediaType);
          })
          .join("");

        // Si no hay elementos de medios embebidos, mostrar mensaje
        if (!mediaElements || mediaElements.trim() === "") {
          return "<p>No hay recursos multimedia disponibles</p>";
        }

        return mediaElements;
      }
      return "<p>No hay recursos multimedia disponibles</p>";
    };

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
            <div class="modal-section">
                <h4>Citas</h4>
                <ul>${getCitations()}</ul>
            </div>
            <div class="modal-section">
                <h4>Obras Relacionadas</h4>
                <ul>${getWorks()}</ul>
            </div>
            <div class="modal-section">
                <h4>Recursos Multimedia</h4>
                ${getMedia()}
            </div>
        `;

    conceptModal.classList.remove("hidden");
  }

  // --- FUNCIONES AUXILIARES PARA MEDIOS EMBEBIDOS ---
  function detectMediaType(url) {
    const urlLower = url.toLowerCase();

    // Videos de YouTube
    if (urlLower.includes("youtube.com") || urlLower.includes("youtu.be")) {
      return "youtube";
    }

    // Videos de Vimeo
    if (urlLower.includes("vimeo.com")) {
      return "vimeo";
    }

    // Audio de SoundCloud
    if (urlLower.includes("soundcloud.com")) {
      return "soundcloud";
    }

    // Audio de Spotify
    if (urlLower.includes("spotify.com")) {
      return "spotify";
    }

    // Imágenes
    if (urlLower.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/)) {
      return "image";
    }

    // Videos
    if (urlLower.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/)) {
      return "video";
    }

    // Audio
    if (urlLower.match(/\.(mp3|wav|ogg|m4a|aac|flac|wma)$/)) {
      return "audio";
    }

    // URLs genéricas
    if (urlLower.startsWith("http://") || urlLower.startsWith("https://")) {
      return "link";
    }

    return "text";
  }

  function getYouTubeVideoId(url) {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  }

  function getVimeoVideoId(url) {
    const regExp = /vimeo.com\/(\d+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  }

  function getSpotifyEmbedUrl(url) {
    // Convertir URL de Spotify a formato embed
    // Ejemplo: https://open.spotify.com/track/... -> https://open.spotify.com/embed/track/...
    const trackMatch = url.match(
      /spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/
    );
    if (trackMatch) {
      return `https://open.spotify.com/embed/${trackMatch[1]}/${trackMatch[2]}`;
    }
    return null;
  }

  function renderMediaElement(url, mediaType) {
    switch (mediaType) {
      case "youtube":
        const youtubeId = getYouTubeVideoId(url);
        if (youtubeId) {
          return `
            <div class="media-container media-video">
              <iframe 
                src="https://www.youtube.com/embed/${youtubeId}" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen
                loading="lazy">
              </iframe>
              <div class="media-caption">
                <a href="${url}" target="_blank" title="Ver en YouTube">🎥 Ver en YouTube</a>
              </div>
            </div>`;
        }
        break;

      case "vimeo":
        const vimeoId = getVimeoVideoId(url);
        if (vimeoId) {
          return `
            <div class="media-container media-video">
              <iframe 
                src="https://player.vimeo.com/video/${vimeoId}" 
                frameborder="0" 
                allow="autoplay; fullscreen; picture-in-picture" 
                allowfullscreen
                loading="lazy">
              </iframe>
              <div class="media-caption">
                <a href="${url}" target="_blank" title="Ver en Vimeo">🎥 Ver en Vimeo</a>
              </div>
            </div>`;
        }
        break;

      case "soundcloud":
        return `
          <div class="media-container media-audio">
            <iframe 
              width="100%" 
              height="166" 
              scrolling="no" 
              frameborder="no" 
              allow="autoplay"
              src="https://w.soundcloud.com/player/?url=${encodeURIComponent(
                url
              )}&color=%232c5282&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true">
            </iframe>
            <div class="media-caption">
              <a href="${url}" target="_blank" title="Escuchar en SoundCloud">🎵 Escuchar en SoundCloud</a>
            </div>
          </div>`;

      case "spotify":
        const spotifyEmbedUrl = getSpotifyEmbedUrl(url);
        if (spotifyEmbedUrl) {
          return `
            <div class="media-container media-audio">
              <iframe 
                src="${spotifyEmbedUrl}" 
                width="100%" 
                height="152" 
                frameborder="0" 
                allowtransparency="true" 
                allow="encrypted-media">
              </iframe>
              <div class="media-caption">
                <a href="${url}" target="_blank" title="Escuchar en Spotify">🎵 Escuchar en Spotify</a>
              </div>
            </div>`;
        }
        break;

      case "image":
        return `
          <div class="media-container media-image">
            <img src="${url}" alt="Imagen relacionada" loading="lazy" onclick="window.open('${url}', '_blank')" onerror="this.parentElement.innerHTML='<div class=&quot;media-error&quot;>⚠️ No se pudo cargar la imagen</div>'">
            <div class="media-caption">
              <a href="${url}" target="_blank" title="Abrir en nueva pestaña">�️ Ver imagen completa</a>
            </div>
          </div>`;

      case "video":
        return `
          <div class="media-container media-video">
            <video controls preload="metadata">
              <source src="${url}">
              Tu navegador no soporta el elemento de video.
            </video>
            <div class="media-caption">
              <a href="${url}" target="_blank">� Descargar video</a>
            </div>
          </div>`;

      case "audio":
        return `
          <div class="media-container media-audio">
            <audio controls preload="metadata">
              <source src="${url}">
              Tu navegador no soporta el elemento de audio.
            </audio>
            <div class="media-caption">
              <a href="${url}" target="_blank">🎧 Descargar audio</a>
            </div>
          </div>`;

      case "link":
        return `
          <div class="media-container media-link-container">
            <a href="${url}" target="_blank" class="media-link">
              🔗 ${url}
            </a>
          </div>`;

      default:
        return `
          <div class="media-container media-text">
            <p>${url}</p>
          </div>`;
    }
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
        const nodeShape = d3.select(this).select(".node-shape");
        nodeShape
          .transition()
          .duration(800)
          .attr("transform", "scale(1)")
          .ease(d3.easeBounceOut)
          .on("start", function () {
            d3.select(this).attr("transform", "scale(0)");
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

    // Botón de cancelar posicionamiento
    const cancelPositioningBtn = document.getElementById(
      "cancel-positioning-btn"
    );
    if (cancelPositioningBtn) {
      cancelPositioningBtn.addEventListener("click", () => {
        deactivatePositioningMode();
        Swal.fire({
          title: "Posicionamiento Cancelado",
          text: "El nodo se posicionará automáticamente",
          icon: "info",
          timer: 1500,
          showConfirmButton: false,
        });
      });
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

  // --- 11. FUNCIONES DE INTEGRACIÓN CON ZOTERO ---

  /**
   * Guardar configuración de Zotero
   */
  if (zoteroConfigForm) {
    zoteroConfigForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!zotero) {
        Swal.fire("Error", "Módulo de Zotero no disponible", "error");
        return;
      }

      const apiKey = zoteroApiKeyInput.value.trim();
      const libraryType = zoteroTypeSelect.value;
      const libraryId = zoteroIdInput.value.trim();
      const citationStyle = zoteroStyleSelect.value;

      if (!apiKey || !libraryId) {
        Swal.fire(
          "Error",
          "Por favor completa todos los campos requeridos",
          "error"
        );
        return;
      }

      zotero.updateConfig(apiKey, libraryType, libraryId, citationStyle);

      zoteroStatus.textContent = "✓ Configuración guardada correctamente";
      zoteroStatus.className = "success";
      zoteroStatus.classList.remove("hidden");

      setTimeout(() => {
        zoteroStatus.classList.add("hidden");
      }, 3000);
    });
  }

  /**
   * Probar conexión con Zotero
   */
  if (testZoteroBtn) {
    testZoteroBtn.addEventListener("click", async (e) => {
      e.preventDefault();

      if (!zotero) {
        Swal.fire("Error", "Módulo de Zotero no disponible", "error");
        return;
      }

      // Actualizar configuración primero
      const apiKey = zoteroApiKeyInput.value.trim();
      const libraryType = zoteroTypeSelect.value;
      const libraryId = zoteroIdInput.value.trim();
      const citationStyle = zoteroStyleSelect.value;

      if (!apiKey || !libraryId) {
        Swal.fire("Error", "Por favor completa API Key y Library ID", "error");
        return;
      }

      zotero.updateConfig(apiKey, libraryType, libraryId, citationStyle);

      try {
        zoteroStatus.textContent = "Probando conexión...";
        zoteroStatus.className = "";
        zoteroStatus.classList.remove("hidden");

        const result = await zotero.testConnection();

        zoteroStatus.textContent = "✓ " + result.message;
        zoteroStatus.className = "success";

        // Ocultar la ayuda de API Key cuando la conexión es exitosa
        const apiHelp = document.getElementById("zotero-api-help");
        if (apiHelp) {
          apiHelp.classList.add("hidden");
        }

        Swal.fire("Éxito", result.message, "success");
      } catch (error) {
        zoteroStatus.textContent = "✗ " + error.message;
        zoteroStatus.className = "error";

        Swal.fire("Error", error.message, "error");
      }
    });
  }

  /**
   * Abrir modal de búsqueda de Zotero
   */
  if (importZoteroBtn) {
    importZoteroBtn.addEventListener("click", () => {
      if (!zotero) {
        Swal.fire("Error", "Módulo de Zotero no disponible", "error");
        return;
      }

      if (!zotero.isConfigured()) {
        Swal.fire({
          title: "Configuración Requerida",
          text: "Por favor configura tu API Key y Library ID de Zotero primero.",
          icon: "warning",
          confirmButtonText: "Ir a Configuración",
        });
        return;
      }

      zotero.clearSelection();
      zoteroResults.innerHTML = "";
      zoteroSearchInput.value = "";
      zoteroAddSelectedBtn.disabled = true;
      zoteroModal.classList.remove("hidden");
    });
  }

  /**
   * Buscar en Zotero
   */
  if (zoteroSearchBtn) {
    zoteroSearchBtn.addEventListener("click", async () => {
      await performZoteroSearch();
    });
  }

  if (zoteroSearchInput) {
    zoteroSearchInput.addEventListener("keypress", async (e) => {
      if (e.key === "Enter") {
        await performZoteroSearch();
      }
    });
  }

  async function performZoteroSearch() {
    if (!zotero) return;

    const query = zoteroSearchInput.value.trim();

    try {
      zoteroLoader.classList.remove("hidden");
      zoteroResults.innerHTML = "";
      zotero.clearSelection();
      zoteroAddSelectedBtn.disabled = true;

      const items = await zotero.searchItems(query, 50);

      zoteroLoader.classList.add("hidden");

      if (items.length === 0) {
        zoteroResults.innerHTML =
          '<div class="zotero-empty">No se encontraron resultados</div>';
        return;
      }

      renderZoteroResults(items);
    } catch (error) {
      zoteroLoader.classList.add("hidden");
      zoteroResults.innerHTML = `<div class="zotero-empty">Error: ${error.message}</div>`;
      Swal.fire("Error", error.message, "error");
    }
  }

  /**
   * Renderizar resultados de búsqueda
   */
  function renderZoteroResults(items) {
    zoteroResults.innerHTML = "";

    items.forEach((item) => {
      const info = zotero.extractItemInfo(item);
      const itemDiv = document.createElement("div");
      itemDiv.className = "zotero-item";
      itemDiv.dataset.key = info.key;

      // Formatear manualmente para preview
      const citation = zotero.formatItemManually(item);

      itemDiv.innerHTML = `
        <div class="zotero-item-title">${info.title}</div>
        <div class="zotero-item-meta">
          <strong>Autores:</strong> ${info.authors} | 
          <strong>Año:</strong> ${info.year} | 
          <strong>Tipo:</strong> ${info.type}
        </div>
        <div class="zotero-item-citation">${citation}</div>
      `;

      itemDiv.addEventListener("click", () => {
        toggleZoteroItemSelection(itemDiv, info.key);
      });

      zoteroResults.appendChild(itemDiv);
    });
  }

  /**
   * Seleccionar/deseleccionar item de Zotero
   */
  function toggleZoteroItemSelection(itemDiv, itemKey) {
    if (!zotero) return;

    zotero.toggleSelection(itemKey);
    itemDiv.classList.toggle("selected");

    // Actualizar botón de agregar
    const selectedCount = zotero.getSelectedItems().length;
    zoteroAddSelectedBtn.disabled = selectedCount === 0;
    zoteroAddSelectedBtn.textContent =
      selectedCount > 0
        ? `Agregar Seleccionadas (${selectedCount})`
        : "Agregar Seleccionadas";
  }

  /**
   * Agregar citas seleccionadas al campo
   */
  if (zoteroAddSelectedBtn) {
    zoteroAddSelectedBtn.addEventListener("click", async () => {
      if (!zotero) return;

      const selectedKeys = zotero.getSelectedItems();
      if (selectedKeys.length === 0) return;

      try {
        zoteroLoader.classList.remove("hidden");
        zoteroAddSelectedBtn.disabled = true;

        const citations = await zotero.getFormattedCitations(selectedKeys);

        // Si algunas citas no se pudieron formatear, usar el formato manual
        const allItems = Array.from(
          zoteroResults.querySelectorAll(".zotero-item")
        ).filter((item) => selectedKeys.includes(item.dataset.key));

        const finalCitations = [];
        for (let i = 0; i < selectedKeys.length; i++) {
          if (citations[i]) {
            finalCitations.push(citations[i]);
          } else {
            // Usar el formato manual visible en el preview
            const itemDiv = allItems.find(
              (div) => div.dataset.key === selectedKeys[i]
            );
            if (itemDiv) {
              const citation = itemDiv.querySelector(
                ".zotero-item-citation"
              ).textContent;
              finalCitations.push(citation);
            }
          }
        }

        // Agregar al campo de citas
        const currentCitations = citationsInput.value.trim();
        const newCitations = currentCitations
          ? currentCitations + "\n" + finalCitations.join("\n")
          : finalCitations.join("\n");

        citationsInput.value = newCitations;

        zoteroLoader.classList.add("hidden");
        zoteroModal.classList.add("hidden");

        Swal.fire(
          "Éxito",
          `${finalCitations.length} cita(s) agregada(s)`,
          "success"
        );
      } catch (error) {
        zoteroLoader.classList.add("hidden");
        Swal.fire("Error", error.message, "error");
      }
    });
  }

  /**
   * Cerrar modal de Zotero
   */
  if (zoteroModalCloseBtn) {
    zoteroModalCloseBtn.addEventListener("click", () => {
      zoteroModal.classList.add("hidden");
    });
  }

  if (zoteroCancelBtn) {
    zoteroCancelBtn.addEventListener("click", () => {
      zoteroModal.classList.add("hidden");
    });
  }

  if (zoteroModal) {
    zoteroModal.addEventListener("click", (e) => {
      if (e.target === zoteroModal) {
        zoteroModal.classList.add("hidden");
      }
    });
  }

  // --- 12. INICIALIZACIÓN ---
  async function initialize() {
    await fetchUserThesauruses();
    clearCategoryForm();
    initializeTemporalSystem();
    initializeAnalyticalViews();
  }

  // --- 13. SISTEMA DE VISTAS ANALÍTICAS ---

  // Elementos del DOM
  const activeViewsList = document.getElementById("active-views-list");
  const availableViewsList = document.getElementById("available-views-list");
  const activeViewsEmpty = document.getElementById("active-views-empty");
  const createViewBtn = document.getElementById("create-view-btn");
  const manageViewsBtn = document.getElementById("manage-views-btn");
  const viewStatsDiv = document.getElementById("view-stats");
  const visibleConceptsCount = document.getElementById(
    "visible-concepts-count"
  );
  const totalConceptsCount = document.getElementById("total-concepts-count");

  // Modal de crear/editar vista
  const analyticalViewModal = document.getElementById("analytical-view-modal");
  const analyticalViewModalTitle = document.getElementById(
    "analytical-view-modal-title"
  );
  const analyticalViewModalCloseBtn = document.getElementById(
    "analytical-view-modal-close-btn"
  );
  const analyticalViewForm = document.getElementById("analytical-view-form");
  const viewIdInput = document.getElementById("view-id");
  const viewNameInput = document.getElementById("view-name");
  const viewDescriptionInput = document.getElementById("view-description");
  const viewColorInput = document.getElementById("view-color");
  const viewCategoriesFilter = document.getElementById(
    "view-categories-filter"
  );
  const viewAllCategoriesCheckbox = document.getElementById(
    "view-all-categories"
  );
  const viewUseTemporalFilter = document.getElementById(
    "view-use-temporal-filter"
  );
  const viewTemporalRange = document.getElementById("view-temporal-range");
  const viewTemporalStart = document.getElementById("view-temporal-start");
  const viewTemporalEnd = document.getElementById("view-temporal-end");
  const viewUseConnectionFilter = document.getElementById(
    "view-use-connection-filter"
  );
  const viewConnectionRange = document.getElementById("view-connection-range");
  const viewMinConnections = document.getElementById("view-min-connections");
  const viewMaxConnections = document.getElementById("view-max-connections");
  const viewFilterBroader = document.getElementById("view-filter-broader");
  const viewFilterRelated = document.getElementById("view-filter-related");
  const cancelViewBtn = document.getElementById("cancel-view-btn");

  // Modal de gestionar vistas
  const manageViewsModal = document.getElementById("manage-views-modal");
  const manageViewsModalCloseBtn = document.getElementById(
    "manage-views-modal-close-btn"
  );
  const viewsManagementList = document.getElementById("views-management-list");

  // Estado de vistas analíticas
  let analyticalViews = {
    available: [],
    active: [],
  };

  /**
   * Inicializar el sistema de vistas analíticas
   */
  async function initializeAnalyticalViews() {
    if (!state.activeThesaurusId) return;

    await fetchAnalyticalViews();
    await fetchActiveViews();
    createDefaultViewsIfNeeded();
    renderAnalyticalViews();

    // Event listeners
    if (createViewBtn) {
      createViewBtn.addEventListener("click", openCreateViewModal);
    }

    if (manageViewsBtn) {
      manageViewsBtn.addEventListener("click", openManageViewsModal);
    }

    if (analyticalViewForm) {
      analyticalViewForm.addEventListener("submit", saveAnalyticalView);
    }

    if (cancelViewBtn) {
      cancelViewBtn.addEventListener("click", closeAnalyticalViewModal);
    }

    if (analyticalViewModalCloseBtn) {
      analyticalViewModalCloseBtn.addEventListener(
        "click",
        closeAnalyticalViewModal
      );
    }

    if (analyticalViewModal) {
      analyticalViewModal.addEventListener("click", (e) => {
        if (e.target === analyticalViewModal) {
          closeAnalyticalViewModal();
        }
      });
    }

    if (manageViewsModalCloseBtn) {
      manageViewsModalCloseBtn.addEventListener("click", closeManageViewsModal);
    }

    if (manageViewsModal) {
      manageViewsModal.addEventListener("click", (e) => {
        if (e.target === manageViewsModal) {
          closeManageViewsModal();
        }
      });
    }

    // Toggle de filtros
    if (viewUseTemporalFilter) {
      viewUseTemporalFilter.addEventListener("change", (e) => {
        viewTemporalRange.classList.toggle("hidden", !e.target.checked);
      });
    }

    if (viewUseConnectionFilter) {
      viewUseConnectionFilter.addEventListener("change", (e) => {
        viewConnectionRange.classList.toggle("hidden", !e.target.checked);
      });
    }

    if (viewAllCategoriesCheckbox) {
      viewAllCategoriesCheckbox.addEventListener("change", (e) => {
        const checkboxes = viewCategoriesFilter.querySelectorAll(
          'input[type="checkbox"]'
        );
        checkboxes.forEach((cb) => (cb.disabled = e.target.checked));
      });
    }
  }

  /**
   * Obtener vistas analíticas disponibles
   */
  async function fetchAnalyticalViews() {
    if (!state.activeThesaurusId) return;

    const { data, error } = await supabase
      .from("analytical_views")
      .select("*")
      .eq("thesaurus_id", state.activeThesaurusId)
      .eq("user_id", state.user.id);

    if (error) {
      console.error("Error fetching analytical views:", error);
      return;
    }

    analyticalViews.available = data || [];
  }

  /**
   * Obtener vistas activas
   */
  async function fetchActiveViews() {
    if (!state.activeThesaurusId) return;

    const { data, error } = await supabase
      .from("active_analytical_views")
      .select("view_id")
      .eq("thesaurus_id", state.activeThesaurusId)
      .eq("user_id", state.user.id);

    if (error) {
      console.error("Error fetching active views:", error);
      return;
    }

    analyticalViews.active = (data || []).map((item) => item.view_id);
  }

  /**
   * Crear vistas por defecto si no existen
   */
  async function createDefaultViewsIfNeeded() {
    const defaultViews = [
      {
        name: "Vista Tecnológica",
        description: "Conceptos y relaciones ligados a hitos tecnológicos",
        color: "#3498db",
        filters: {
          keywords: [
            "tecnología",
            "digital",
            "software",
            "hardware",
            "internet",
            "web",
          ],
        },
      },
      {
        name: "Vista Teórico-Crítica",
        description: "Enfoque en teóricos, conceptos y debates",
        color: "#9b59b6",
        filters: {
          keywords: ["teoría", "crítica", "filosofía", "pensamiento", "autor"],
        },
      },
      {
        name: "Vista Estética",
        description: "Movimientos artísticos, obras y características formales",
        color: "#e74c3c",
        filters: {
          keywords: [
            "arte",
            "estética",
            "diseño",
            "visual",
            "movimiento",
            "obra",
          ],
        },
      },
      {
        name: "Vista Temporal",
        description: "Enfoque en evolución histórica de conceptos",
        color: "#f39c12",
        filters: {
          use_temporal: true,
          temporal_range: [1950, new Date().getFullYear()],
        },
      },
      {
        name: "Vista Relacional",
        description: "Análisis de densidad de conexiones",
        color: "#1abc9c",
        filters: {
          min_connections: 3,
        },
      },
    ];

    for (const defaultView of defaultViews) {
      const exists = analyticalViews.available.find(
        (v) => v.name === defaultView.name
      );
      if (!exists) {
        const { error } = await supabase.from("analytical_views").insert({
          user_id: state.user.id,
          thesaurus_id: state.activeThesaurusId,
          name: defaultView.name,
          description: defaultView.description,
          color: defaultView.color,
          filters: defaultView.filters,
          is_default: true,
        });

        if (error) {
          console.error("Error creating default view:", error);
        }
      }
    }

    // Recargar vistas después de crear las predeterminadas
    await fetchAnalyticalViews();
  }

  /**
   * Renderizar las vistas analíticas
   */
  function renderAnalyticalViews() {
    renderActiveViews();
    renderAvailableViews();
    updateViewStats();
  }

  /**
   * Renderizar vistas activas
   */
  function renderActiveViews() {
    if (!activeViewsList) return;

    const activeViews = analyticalViews.available.filter((v) =>
      analyticalViews.active.includes(v.id)
    );

    if (activeViews.length === 0) {
      activeViewsList.innerHTML = "";
      if (activeViewsEmpty) activeViewsEmpty.classList.remove("hidden");
      return;
    }

    if (activeViewsEmpty) activeViewsEmpty.classList.add("hidden");

    activeViewsList.innerHTML = activeViews
      .map(
        (view) => `
      <div class="view-item active clickable" data-view-id="${
        view.id
      }" title="Click para desactivar">
        <div class="view-item-left">
          <div class="view-color-indicator" style="background-color: ${
            view.color
          };"></div>
          <div class="view-item-info">
            <div class="view-item-name">${view.name}</div>
            <div class="view-item-description">${view.description || ""}</div>
          </div>
        </div>
        <div class="view-item-actions">
          ${
            view.is_default
              ? '<span class="view-badge default" title="Vista predefinida del sistema">P</span>'
              : ""
          }
        </div>
      </div>
    `
      )
      .join("");

    // Agregar event listeners - toda la vista es clickeable
    activeViewsList.querySelectorAll(".view-item").forEach((item) => {
      item.addEventListener("click", async (e) => {
        const viewId = item.dataset.viewId;
        await deactivateView(viewId);
      });
    });
  }

  /**
   * Renderizar vistas disponibles
   */
  function renderAvailableViews() {
    if (!availableViewsList) {
      console.error("❌ availableViewsList element not found!");
      return;
    }

    const inactiveViews = analyticalViews.available.filter(
      (v) => !analyticalViews.active.includes(v.id)
    );

    if (inactiveViews.length === 0) {
      availableViewsList.innerHTML =
        '<div class="empty-state"><p>No hay vistas disponibles</p></div>';
      return;
    }

    availableViewsList.innerHTML = inactiveViews
      .map(
        (view) => `
      <div class="view-item clickable" data-view-id="${
        view.id
      }" title="Click para activar">
        <div class="view-item-left">
          <div class="view-color-indicator" style="background-color: ${
            view.color
          };"></div>
          <div class="view-item-info">
            <div class="view-item-name">${view.name}</div>
            <div class="view-item-description">${view.description || ""}</div>
          </div>
        </div>
        <div class="view-item-actions">
          ${
            view.is_default
              ? '<span class="view-badge default" title="Vista predefinida del sistema">P</span>'
              : ""
          }
          ${
            !view.is_default
              ? '<button class="view-action-btn edit-view" title="Editar vista" onclick="event.stopPropagation()">✏️</button>'
              : ""
          }
          ${
            !view.is_default
              ? '<button class="view-action-btn delete delete-view" title="Eliminar vista" onclick="event.stopPropagation()">🗑️</button>'
              : ""
          }
        </div>
      </div>
    `
      )
      .join("");

    // Agregar event listeners - toda la vista es clickeable para activar
    availableViewsList.querySelectorAll(".view-item").forEach((item) => {
      item.addEventListener("click", async (e) => {
        // Solo activar si no se hizo click en un botón de acción
        if (e.target.closest(".view-action-btn")) return;

        const viewId = item.dataset.viewId;
        await activateView(viewId);
      });
    });

    // Event listeners para editar
    availableViewsList.querySelectorAll(".edit-view").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const viewId = btn.closest(".view-item").dataset.viewId;
        editView(viewId);
      });
    });

    // Event listeners para eliminar
    availableViewsList.querySelectorAll(".delete-view").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const viewId = btn.closest(".view-item").dataset.viewId;
        await deleteView(viewId);
      });
    });
  }

  /**
   * Activar una vista
   */
  async function activateView(viewId) {
    const { error } = await supabase.from("active_analytical_views").insert({
      user_id: state.user.id,
      thesaurus_id: state.activeThesaurusId,
      view_id: viewId,
    });

    if (error) {
      console.error("Error activating view:", error);
      Swal.fire("Error", "No se pudo activar la vista", "error");
      return;
    }

    await fetchActiveViews();
    renderAnalyticalViews();
    applyAnalyticalFilters();
  }

  /**
   * Desactivar una vista
   */
  async function deactivateView(viewId) {
    const { error } = await supabase
      .from("active_analytical_views")
      .delete()
      .eq("user_id", state.user.id)
      .eq("thesaurus_id", state.activeThesaurusId)
      .eq("view_id", viewId);

    if (error) {
      console.error("Error deactivating view:", error);
      Swal.fire("Error", "No se pudo desactivar la vista", "error");
      return;
    }

    await fetchActiveViews();
    renderAnalyticalViews();
    applyAnalyticalFilters();
  }

  /**
   * Aplicar filtros de las vistas activas al grafo
   */
  function applyAnalyticalFilters() {
    if (analyticalViews.active.length === 0) {
      // Si no hay vistas activas, mostrar todos los nodos
      d3.selectAll(".node")
        .classed("view-filtered", false)
        .classed("view-highlighted", false);
      d3.selectAll(".link").classed("view-filtered", false);

      updateViewStats();
      return;
    }

    const activeViewsData = analyticalViews.available.filter((v) =>
      analyticalViews.active.includes(v.id)
    );

    // Combinar todos los filtros de las vistas activas
    const visibleConceptIds = new Set();

    state.concepts.forEach((concept) => {
      const shouldShow = activeViewsData.some((view) =>
        matchesViewFilters(concept, view.filters)
      );

      if (shouldShow) {
        visibleConceptIds.add(concept.id);
      }
    });

    // Aplicar clases visuales
    d3.selectAll(".node").each(function (d) {
      const isVisible = visibleConceptIds.has(d.id);
      d3.select(this)
        .classed("view-filtered", !isVisible)
        .classed("view-highlighted", isVisible)
        .classed(isVisible ? "view-fade-in" : "view-fade-out", true);

      // Remover clases de animación después de que termine
      setTimeout(() => {
        d3.select(this)
          .classed("view-fade-in", false)
          .classed("view-fade-out", false);
      }, 500);
    });

    // Filtrar enlaces
    d3.selectAll(".link").each(function (d) {
      const sourceVisible = visibleConceptIds.has(d.source_concept_id);
      const targetVisible = visibleConceptIds.has(d.target_concept_id);
      d3.select(this).classed(
        "view-filtered",
        !(sourceVisible && targetVisible)
      );
    });

    updateViewStats();
  }

  /**
   * Verificar si un concepto coincide con los filtros de una vista
   */
  function matchesViewFilters(concept, filters) {
    // Filtro por palabras clave
    if (filters.keywords && filters.keywords.length > 0) {
      const conceptText = [
        ...concept.labels.map((l) => l.label_text),
        ...concept.notes.map((n) => n.note_text),
      ]
        .join(" ")
        .toLowerCase();

      const hasKeyword = filters.keywords.some((keyword) =>
        conceptText.includes(keyword.toLowerCase())
      );

      if (!hasKeyword) {
        return false;
      }
    }

    // Filtro por categorías
    if (filters.categories && filters.categories.length > 0) {
      if (!filters.categories.includes(concept.category_id)) {
        return false;
      }
    }

    // Filtro temporal
    if (filters.use_temporal && filters.temporal_range) {
      const [minYear, maxYear] = filters.temporal_range;

      if (concept.temporal_start && concept.temporal_start > maxYear) {
        return false;
      }

      if (concept.temporal_end && concept.temporal_end < minYear) {
        return false;
      }
    }

    // Filtro por conexiones
    if (filters.min_connections !== undefined) {
      const connections = state.relationships.filter(
        (r) =>
          r.source_concept_id === concept.id ||
          r.target_concept_id === concept.id
      ).length;

      if (connections < filters.min_connections) {
        return false;
      }
    }

    if (filters.max_connections !== undefined && filters.max_connections > 0) {
      const connections = state.relationships.filter(
        (r) =>
          r.source_concept_id === concept.id ||
          r.target_concept_id === concept.id
      ).length;

      if (connections > filters.max_connections) {
        return false;
      }
    }

    return true;
  }

  /**
   * Actualizar estadísticas de vistas
   */
  function updateViewStats() {
    if (!viewStatsDiv) return;

    if (analyticalViews.active.length === 0) {
      viewStatsDiv.classList.add("hidden");
      return;
    }

    const visibleNodes = document.querySelectorAll(
      ".node:not(.view-filtered)"
    ).length;
    const totalNodes = state.concepts.length;

    viewStatsDiv.classList.remove("hidden");
    if (visibleConceptsCount) visibleConceptsCount.textContent = visibleNodes;
    if (totalConceptsCount) totalConceptsCount.textContent = totalNodes;
  }

  /**
   * Abrir modal para crear nueva vista
   */
  function openCreateViewModal() {
    if (!analyticalViewModal) return;

    analyticalViewModalTitle.textContent = "Nueva Vista Analítica";
    analyticalViewForm.reset();
    viewIdInput.value = "";

    // Cargar categorías disponibles
    renderCategoryFilters();

    analyticalViewModal.classList.remove("hidden");
  }

  /**
   * Editar una vista existente
   */
  function editView(viewId) {
    const view = analyticalViews.available.find((v) => v.id === viewId);
    if (!view) return;

    analyticalViewModalTitle.textContent = "Editar Vista Analítica";
    viewIdInput.value = view.id;
    viewNameInput.value = view.name;
    viewDescriptionInput.value = view.description || "";
    viewColorInput.value = view.color || "#2c5282";

    // Cargar filtros
    const filters = view.filters || {};

    // Categorías
    renderCategoryFilters(filters.categories);
    if (filters.categories && filters.categories.length > 0) {
      viewAllCategoriesCheckbox.checked = false;
    }

    // Temporal
    if (filters.use_temporal) {
      viewUseTemporalFilter.checked = true;
      viewTemporalRange.classList.remove("hidden");
      if (filters.temporal_range) {
        viewTemporalStart.value = filters.temporal_range[0] || "";
        viewTemporalEnd.value = filters.temporal_range[1] || "";
      }
    }

    // Conexiones
    if (filters.min_connections !== undefined) {
      viewUseConnectionFilter.checked = true;
      viewConnectionRange.classList.remove("hidden");
      viewMinConnections.value = filters.min_connections;
      viewMaxConnections.value = filters.max_connections || 0;
    }

    // Tipos de relación
    viewFilterBroader.checked = filters.show_broader !== false;
    viewFilterRelated.checked = filters.show_related !== false;

    analyticalViewModal.classList.remove("hidden");
  }

  /**
   * Renderizar filtros de categorías
   */
  function renderCategoryFilters(selectedCategories = []) {
    if (!viewCategoriesFilter) return;

    viewCategoriesFilter.innerHTML = state.categories
      .map(
        (cat) => `
      <label class="checkbox-label">
        <input type="checkbox" value="${cat.id}" ${
          selectedCategories.includes(cat.id) ? "checked" : ""
        }>
        <span class="category-color-dot" style="background-color: ${
          cat.color
        };"></span>
        <span>${cat.name}</span>
      </label>
    `
      )
      .join("");
  }

  /**
   * Guardar vista analítica
   */
  async function saveAnalyticalView(e) {
    e.preventDefault();

    const viewId = viewIdInput.value || null;
    const filters = {};

    // Recopilar filtros de categorías
    if (!viewAllCategoriesCheckbox.checked) {
      const selectedCategories = Array.from(
        viewCategoriesFilter.querySelectorAll('input[type="checkbox"]:checked')
      ).map((cb) => cb.value);

      if (selectedCategories.length > 0) {
        filters.categories = selectedCategories;
      }
    }

    // Filtro temporal
    if (viewUseTemporalFilter.checked) {
      filters.use_temporal = true;
      const startYear = parseInt(viewTemporalStart.value);
      const endYear = parseInt(viewTemporalEnd.value);
      if (startYear && endYear) {
        filters.temporal_range = [startYear, endYear];
      }
    }

    // Filtro de conexiones
    if (viewUseConnectionFilter.checked) {
      filters.min_connections = parseInt(viewMinConnections.value) || 0;
      const maxConn = parseInt(viewMaxConnections.value) || 0;
      if (maxConn > 0) {
        filters.max_connections = maxConn;
      }
    }

    // Tipos de relación
    filters.show_broader = viewFilterBroader.checked;
    filters.show_related = viewFilterRelated.checked;

    const viewData = {
      user_id: state.user.id,
      thesaurus_id: state.activeThesaurusId,
      name: viewNameInput.value.trim(),
      description: viewDescriptionInput.value.trim(),
      color: viewColorInput.value,
      filters: filters,
      is_default: false,
    };

    try {
      if (viewId) {
        // Actualizar vista existente
        const { error } = await supabase
          .from("analytical_views")
          .update(viewData)
          .eq("id", viewId);

        if (error) throw error;
      } else {
        // Crear nueva vista
        const { error } = await supabase
          .from("analytical_views")
          .insert(viewData);

        if (error) throw error;
      }

      Swal.fire("Éxito", "Vista guardada correctamente", "success");
      closeAnalyticalViewModal();
      await fetchAnalyticalViews();
      renderAnalyticalViews();
    } catch (error) {
      console.error("Error saving view:", error);
      Swal.fire("Error", "No se pudo guardar la vista", "error");
    }
  }

  /**
   * Eliminar una vista
   */
  async function deleteView(viewId) {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Se eliminará esta vista analítica",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
    });

    if (!result.isConfirmed) return;

    const { error } = await supabase
      .from("analytical_views")
      .delete()
      .eq("id", viewId);

    if (error) {
      console.error("Error deleting view:", error);
      Swal.fire("Error", "No se pudo eliminar la vista", "error");
      return;
    }

    Swal.fire("Eliminada", "La vista ha sido eliminada", "success");
    await fetchAnalyticalViews();
    await fetchActiveViews();
    renderAnalyticalViews();
    applyAnalyticalFilters();
  }

  /**
   * Cerrar modal de vista analítica
   */
  function closeAnalyticalViewModal() {
    if (analyticalViewModal) {
      analyticalViewModal.classList.add("hidden");
    }
  }

  /**
   * Abrir modal de gestión de vistas
   */
  function openManageViewsModal() {
    renderManageViewsList();
    manageViewsModal.classList.remove("hidden");
  }

  /**
   * Renderizar lista de gestión de vistas
   */
  function renderManageViewsList() {
    if (!viewsManagementList) return;

    viewsManagementList.innerHTML = analyticalViews.available
      .map(
        (view) => `
      <div class="management-view-item ${view.is_default ? "default" : ""}">
        <div class="management-view-info">
          <div class="view-color-indicator" style="background-color: ${
            view.color
          };"></div>
          <div class="management-view-details">
            <div class="management-view-name">${view.name}</div>
            <div class="management-view-description">${
              view.description || ""
            }</div>
          </div>
        </div>
        <div class="management-view-actions">
          ${
            !view.is_default
              ? `<button class="edit-managed-view" data-view-id="${view.id}">✏️ Editar</button>`
              : ""
          }
          ${
            !view.is_default
              ? `<button class="delete danger delete-managed-view" data-view-id="${view.id}">🗑️ Eliminar</button>`
              : ""
          }
          ${
            view.is_default
              ? '<span class="view-badge default" title="Vista predefinida del sistema">P</span>'
              : ""
          }
        </div>
      </div>
    `
      )
      .join("");

    // Event listeners
    viewsManagementList
      .querySelectorAll(".edit-managed-view")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          closeManageViewsModal();
          editView(btn.dataset.viewId);
        });
      });

    viewsManagementList
      .querySelectorAll(".delete-managed-view")
      .forEach((btn) => {
        btn.addEventListener("click", async () => {
          await deleteView(btn.dataset.viewId);
          renderManageViewsList();
        });
      });
  }

  /**
   * Cerrar modal de gestión de vistas
   */
  function closeManageViewsModal() {
    if (manageViewsModal) {
      manageViewsModal.classList.add("hidden");
    }
  }

  // Sobrescribir updateAll para incluir aplicación de filtros
  const originalUpdateAll = updateAll;
  updateAll = function () {
    originalUpdateAll();
    if (analyticalViews.active.length > 0) {
      setTimeout(() => applyAnalyticalFilters(), 100);
    }
  };

  // --- PANEL DE AYUDA PARA INTERACCIÓN CON NODOS ---
  const helpToggleBtn = document.getElementById("toggle-help-btn");
  const helpContent = document.getElementById("help-content");

  if (helpToggleBtn && helpContent) {
    helpToggleBtn.addEventListener("click", () => {
      helpContent.classList.toggle("hidden");
    });

    // Cerrar al hacer click fuera
    document.addEventListener("click", (event) => {
      if (!event.target.closest(".help-panel")) {
        helpContent.classList.add("hidden");
      }
    });
  }

  checkUserSession();
});
