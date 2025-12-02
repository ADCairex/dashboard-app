// Cliente de API que se conecta a las rutas /api/* integradas en Vite
class APIClient {
  constructor(endpoint, readOnly = false) {
    this.endpoint = endpoint;
    this.readOnly = readOnly;
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
    if (this.readOnly) {
      throw new Error(`Creating ${this.endpoint} is disabled`);
    }
    
    try {
      const response = await fetch(`/api${this.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error al crear ${this.endpoint}:`, error);
      throw error;
    }
  }

  async update(id, data) {
    if (this.readOnly) {
      throw new Error(`Updating ${this.endpoint} is disabled`);
    }
    
    try {
      const response = await fetch(`/api${this.endpoint}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error al actualizar ${this.endpoint}/${id}:`, error);
      throw error;
    }
  }

  async delete(id) {
    if (this.readOnly) {
      throw new Error(`Deleting ${this.endpoint} is disabled`);
    }
    
    try {
      const response = await fetch(`/api${this.endpoint}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error al eliminar ${this.endpoint}/${id}:`, error);
      throw error;
    }
  }
}

// Cliente de API con endpoints configurados
export const apiClient = {
  entities: {
    Order: new APIClient('/orders', false), // CRUD completo habilitado
    Product: new APIClient('/products', true), // Solo lectura
  }
};
