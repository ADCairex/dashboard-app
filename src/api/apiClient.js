// Cliente de API que se conecta a las rutas /api/* integradas en Vite
class APIClient {
  constructor(endpoint) {
    this.endpoint = endpoint;
  }

  async list(orderBy = '-created_date') {
    try {
      const response = await fetch(`/api${this.endpoint}?orderBy=${orderBy}`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error al listar ${this.endpoint}:`, error);
      throw error;
    }
  }

  async get(id) {
    try {
      const response = await fetch(`/api${this.endpoint}/${id}`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error al obtener ${this.endpoint}/${id}:`, error);
      throw error;
    }
  }

  async filter(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`/api${this.endpoint}?${queryString}`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error al filtrar ${this.endpoint}:`, error);
      throw error;
    }
  }

  async create(data) {
    // Método deshabilitado para productos
    throw new Error('Creating products is disabled');
  }

  async update(id, data) {
    // Método deshabilitado para productos
    throw new Error('Updating products is disabled');
  }

  async delete(id) {
    // Método deshabilitado para productos
    throw new Error('Deleting products is disabled');
  }
}

// Cliente de API con endpoints configurados
export const apiClient = {
  entities: {
    Order: new APIClient('/orders'),
    Product: new APIClient('/products'),
  }
};
