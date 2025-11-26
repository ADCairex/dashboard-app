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

  async create(data) {
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
    Order: new APIClient('/orders'),
    Product: new APIClient('/products'),
  }
};
