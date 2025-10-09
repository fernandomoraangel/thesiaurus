/**
 * Módulo de Integración con Zotero API
 * Permite buscar y formatear citas bibliográficas desde Zotero
 */

class ZoteroIntegration {
  constructor() {
    this.apiKey = null;
    this.libraryType = "user"; // 'user' o 'group'
    this.libraryId = null;
    this.citationStyle = "apa";
    this.baseUrl = "https://api.zotero.org";
    this.selectedItems = new Set();

    this.loadConfig();
  }

  /**
   * Cargar configuración desde localStorage
   */
  loadConfig() {
    const config = localStorage.getItem("zotero_config");
    if (config) {
      try {
        const parsed = JSON.parse(config);
        this.apiKey = parsed.apiKey || null;
        this.libraryType = parsed.libraryType || "user";
        this.libraryId = parsed.libraryId || null;
        this.citationStyle = parsed.citationStyle || "apa";
      } catch (e) {
        console.error("Error loading Zotero config:", e);
      }
    }
  }

  /**
   * Guardar configuración en localStorage
   */
  saveConfig() {
    const config = {
      apiKey: this.apiKey,
      libraryType: this.libraryType,
      libraryId: this.libraryId,
      citationStyle: this.citationStyle,
    };
    localStorage.setItem("zotero_config", JSON.stringify(config));
  }

  /**
   * Actualizar configuración
   */
  updateConfig(apiKey, libraryType, libraryId, citationStyle) {
    this.apiKey = apiKey;
    this.libraryType = libraryType;
    this.libraryId = libraryId;
    this.citationStyle = citationStyle;
    this.saveConfig();
  }

  /**
   * Verificar si la configuración está completa
   */
  isConfigured() {
    return !!(this.apiKey && this.libraryId);
  }

  /**
   * Construir headers para las peticiones
   */
  getHeaders() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Zotero-API-Version": "3",
    };
  }

  /**
   * Probar conexión con Zotero
   */
  async testConnection() {
    if (!this.isConfigured()) {
      throw new Error(
        "Configuración incompleta. Por favor ingresa API Key y Library ID."
      );
    }

    const url = `${this.baseUrl}/${this.libraryType}s/${this.libraryId}/items?limit=1`;

    try {
      const response = await fetch(url, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("API Key inválida o sin permisos suficientes.");
        } else if (response.status === 404) {
          throw new Error("Library ID no encontrado.");
        } else {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
      }

      return { success: true, message: "Conexión exitosa con Zotero!" };
    } catch (error) {
      throw new Error(`Error de conexión: ${error.message}`);
    }
  }

  /**
   * Buscar items en Zotero
   */
  async searchItems(query = "", limit = 50) {
    if (!this.isConfigured()) {
      throw new Error("Debes configurar Zotero primero.");
    }

    // Construir URL base - la API de Zotero acepta items regulares por defecto
    // No necesitamos filtrar attachments y notes explícitamente
    let url = `${this.baseUrl}/${this.libraryType}s/${this.libraryId}/items?limit=${limit}`;

    // Agregar query de búsqueda si existe
    if (query && query.trim()) {
      url += `&q=${encodeURIComponent(query.trim())}`;
    }

    try {
      console.log("Fetching from Zotero:", url);
      const response = await fetch(url, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Zotero API Error Response:", errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const items = await response.json();

      // Filtrar attachments y notes en el cliente
      const filteredItems = items.filter((item) => {
        const itemType = item.data?.itemType;
        return itemType !== "attachment" && itemType !== "note";
      });

      return filteredItems;
    } catch (error) {
      console.error("Search error:", error);
      throw new Error(`Error buscando items: ${error.message}`);
    }
  }

  /**
   * Obtener cita formateada para un item
   */
  async getFormattedCitation(itemKey) {
    if (!this.isConfigured()) {
      throw new Error("Debes configurar Zotero primero.");
    }

    const url = `${this.baseUrl}/${this.libraryType}s/${this.libraryId}/items/${itemKey}?format=bib&style=${this.citationStyle}`;

    try {
      const response = await fetch(url, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const citation = await response.text();
      // Limpiar HTML de la cita
      const div = document.createElement("div");
      div.innerHTML = citation;
      return div.textContent.trim();
    } catch (error) {
      console.error("Error getting formatted citation:", error);
      // Si falla el formateo, usar fallback
      return null;
    }
  }

  /**
   * Formatear item manualmente (fallback si la API no devuelve formato)
   */
  formatItemManually(item) {
    const data = item.data;
    const creators = data.creators || [];

    // Extraer autores
    let authors = creators
      .filter((c) => c.creatorType === "author")
      .map((c) => {
        if (c.lastName && c.firstName) {
          return `${c.lastName}, ${c.firstName.charAt(0)}.`;
        } else if (c.name) {
          return c.name;
        }
        return "";
      })
      .filter((a) => a)
      .join(", ");

    if (!authors && creators.length > 0) {
      authors = creators[0].name || creators[0].lastName || "Autor desconocido";
    }

    const year = data.date ? new Date(data.date).getFullYear() : "s.f.";
    const title = data.title || "Sin título";

    // Formato básico APA-like
    let citation = `${authors} (${year}). ${title}`;

    // Agregar información adicional según el tipo
    if (data.publicationTitle) {
      citation += `. ${data.publicationTitle}`;
    }

    if (data.volume) {
      citation += `, ${data.volume}`;
    }

    if (data.issue) {
      citation += `(${data.issue})`;
    }

    if (data.pages) {
      citation += `, ${data.pages}`;
    }

    if (data.publisher) {
      citation += `. ${data.publisher}`;
    }

    if (data.DOI) {
      citation += `. https://doi.org/${data.DOI}`;
    } else if (data.url) {
      citation += `. ${data.url}`;
    }

    citation += ".";

    return citation;
  }

  /**
   * Obtener citas formateadas para múltiples items
   */
  async getFormattedCitations(itemKeys) {
    const citations = [];

    for (const key of itemKeys) {
      try {
        const citation = await this.getFormattedCitation(key);
        if (citation) {
          citations.push(citation);
        }
      } catch (error) {
        console.error(`Error formateando cita para ${key}:`, error);
      }
    }

    return citations;
  }

  /**
   * Extraer información básica de un item
   */
  extractItemInfo(item) {
    const data = item.data;
    const creators = data.creators || [];

    let authors = creators
      .filter((c) => c.creatorType === "author")
      .slice(0, 3)
      .map((c) => {
        if (c.lastName) return c.lastName;
        if (c.name) return c.name;
        return "";
      })
      .filter((a) => a)
      .join(", ");

    if (!authors && creators.length > 0) {
      authors = creators[0].name || creators[0].lastName || "Autor desconocido";
    }

    if (creators.length > 3) {
      authors += " et al.";
    }

    const year = data.date ? new Date(data.date).getFullYear() : "s.f.";
    const title = data.title || "Sin título";
    const type = data.itemType || "item";

    return {
      key: item.key,
      title,
      authors,
      year,
      type,
      fullData: item,
    };
  }

  /**
   * Limpiar selección
   */
  clearSelection() {
    this.selectedItems.clear();
  }

  /**
   * Seleccionar/deseleccionar item
   */
  toggleSelection(itemKey) {
    if (this.selectedItems.has(itemKey)) {
      this.selectedItems.delete(itemKey);
    } else {
      this.selectedItems.add(itemKey);
    }
  }

  /**
   * Obtener items seleccionados
   */
  getSelectedItems() {
    return Array.from(this.selectedItems);
  }

  /**
   * Verificar si un item está seleccionado
   */
  isSelected(itemKey) {
    return this.selectedItems.has(itemKey);
  }
}

// Exportar para uso global
window.ZoteroIntegration = ZoteroIntegration;
