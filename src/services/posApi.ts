const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// ============================================
// TIPOS
// ============================================

export interface Mesa {
  id: string;
  numero: number;
  estado: 'libre' | 'ocupada' | 'por_cobrar';
  capacidad: number;
  nombre: string | null;
  posicionX: number;
  posicionY: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExchangeRate {
  id: string;
  tasa: number;
  moneda: string;
  monedaBase: string;
  activa: boolean;
  creadaPor: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  categoriaId: string;
  categoria?: Categoria;
  imagenUrl: string | null;
  activo: boolean;
  destacado: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Categoria {
  id: string;
  nombre: string;
  descripcion: string | null;
  icono: string | null;
  orden: number;
  activa?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PedidoItem {
  id: string;
  pedidoId: string;
  productoId: string;
  producto?: Producto;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  createdAt: string;
}

export interface Pedido {
  id: string;
  mesaId: string;
  mesa?: Mesa;
  meseraId: string;
  mesera?: User;
  estado: 'activo' | 'por_cobrar' | 'cerrado' | 'cancelado';
  subtotal: number;
  descuento: number;
  total: number;
  items?: PedidoItem[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  nombre: string;
  rol: string;
  activo: boolean;
  createdAt: string;
}

export interface TransaccionDetalle {
  id: string;
  transaccionId: string;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Transaccion {
  id: string;
  numeroTransaccion: string;
  mesaId: string;
  mesa?: Mesa;
  mesaNumero: number;
  cajeraId: string;
  cajera?: User;
  cajeraNombre: string;
  pedidoId: string;
  subtotal: number;
  descuento: number;
  totalLocal: number;
  totalUSD: number;
  tasaCambio: number;
  formaPago: 'efectivo_local' | 'efectivo_usd' | 'mixto' | 'tarjeta';
  montoRecibidoLocal: number;
  montoRecibidoUSD: number;
  cambioLocal: number;
  cambioUSD: number;
  notas: string | null;
  createdAt: string;
}

export interface TicketData {
  numeroTransaccion: string;
  mesaNumero: number;
  cajeraNombre: string;
  fecha: Date;
  items: Array<{
    nombre: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
  }>;
  subtotal: number;
  descuento: number;
  totalLocal: number;
  totalUSD: number;
  tasaCambio: number;
  formaPago: string;
  montoRecibidoLocal: number;
  montoRecibidoUSD: number;
  cambioLocal: number;
  cambioUSD: number;
  notas?: string;
}

// ============================================
// MESAS
// ============================================

export const mesaService = {
  async getAll(): Promise<Mesa[]> {
    const res = await fetch(`${API_BASE}/mesas`);
    if (!res.ok) throw new Error('Error al obtener mesas');
    return res.json();
  },

  async getById(id: string): Promise<Mesa> {
    const res = await fetch(`${API_BASE}/mesas/${id}`);
    if (!res.ok) throw new Error('Mesa no encontrada');
    return res.json();
  },

  async create(data: { numero: number; capacidad?: number; nombre?: string }): Promise<Mesa> {
    const res = await fetch(`${API_BASE}/mesas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al crear mesa');
    return res.json();
  },

  async update(id: string, data: Partial<Mesa>): Promise<Mesa> {
    const res = await fetch(`${API_BASE}/mesas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al actualizar mesa');
    return res.json();
  },

  async ocupar(id: string): Promise<Mesa> {
    const res = await fetch(`${API_BASE}/mesas/${id}/ocupar`, { method: 'PUT' });
    if (!res.ok) throw new Error('Error al ocupar mesa');
    return res.json();
  },

  async liberar(id: string): Promise<Mesa> {
    const res = await fetch(`${API_BASE}/mesas/${id}/liberar`, { method: 'PUT' });
    if (!res.ok) throw new Error('Error al liberar mesa');
    return res.json();
  },

  async marcarParaCobrar(id: string): Promise<Mesa> {
    const res = await fetch(`${API_BASE}/mesas/${id}/cobrar`, { method: 'PUT' });
    if (!res.ok) throw new Error('Error al marcar para cobrar');
    return res.json();
  },
};

// ============================================
// TASAS DE CAMBIO
// ============================================

export const tasaService = {
  async getAll(): Promise<ExchangeRate[]> {
    const res = await fetch(`${API_BASE}/tasas`);
    if (!res.ok) throw new Error('Error al obtener tasas');
    return res.json();
  },

  async getActiva(): Promise<ExchangeRate> {
    const res = await fetch(`${API_BASE}/tasas/activa`);
    if (!res.ok) throw new Error('No hay tasa activa');
    return res.json();
  },

  async create(data: { tasa: number; moneda?: string; monedaBase?: string; creadaPor?: string }): Promise<ExchangeRate> {
    const res = await fetch(`${API_BASE}/tasas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al crear tasa');
    return res.json();
  },

  async update(id: string, data: { tasa?: number; activa?: boolean }): Promise<ExchangeRate> {
    const res = await fetch(`${API_BASE}/tasas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al actualizar tasa');
    return res.json();
  },

  async activate(id: string): Promise<ExchangeRate> {
    const res = await fetch(`${API_BASE}/tasas/${id}/activar`, { method: 'PUT' });
    if (!res.ok) throw new Error('Error al activar tasa');
    return res.json();
  },
};

// ============================================
// PRODUCTOS / MENÚ (POS)
// ============================================

export const menuService = {
  async getCategorias(): Promise<Categoria[]> {
    const res = await fetch(`${API_BASE}-pos/categorias`);
    if (!res.ok) throw new Error('Error al obtener categorías');
    return res.json();
  },

  async getProductos(): Promise<Producto[]> {
    const res = await fetch(`${API_BASE}-pos/productos`);
    if (!res.ok) throw new Error('Error al obtener productos');
    const data = await res.json();
    // El backend returns objects con relaciones; normalizar
    return Array.isArray(data) ? data : [];
  },

  async getProductosPorCategoria(categoriaId: string): Promise<Producto[]> {
    const res = await fetch(`${API_BASE}-pos/categoria/${categoriaId}/productos`);
    if (!res.ok) throw new Error('Error al obtener productos');
    return res.json();
  },

  async getMenuCompleto(): Promise<Array<{ category: Categoria; items: Producto[] }>> {
    const res = await fetch(`${API_BASE}-pos/menu`);
    if (!res.ok) throw new Error('Error al obtener menú');
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },
};

// ============================================
// PEDIDOS
// ============================================

export const pedidoService = {
  async getAll(): Promise<Pedido[]> {
    const res = await fetch(`${API_BASE}/pedidos`);
    if (!res.ok) throw new Error('Error al obtener pedidos');
    return res.json();
  },

  async getActivos(): Promise<Pedido[]> {
    const res = await fetch(`${API_BASE}/pedidos/activos`);
    if (!res.ok) throw new Error('Error al obtener pedidos activos');
    return res.json();
  },

  async getPorCobrar(): Promise<Pedido[]> {
    const res = await fetch(`${API_BASE}/pedidos/por-cobrar`);
    if (!res.ok) throw new Error('Error al obtener pedidos por cobrar');
    return res.json();
  },

  async getById(id: string): Promise<Pedido> {
    const res = await fetch(`${API_BASE}/pedidos/${id}`);
    if (!res.ok) throw new Error('Pedido no encontrado');
    return res.json();
  },

  async getActivoByMesa(mesaId: string): Promise<Pedido | null> {
    const res = await fetch(`${API_BASE}/pedidos/mesa/${mesaId}/activo`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Error al obtener pedido');
    return res.json();
  },

  async create(data: { mesaId: string; meseraId: string; items: Array<{ productoId: string; cantidad: number }>; descuento?: number }): Promise<Pedido> {
    const res = await fetch(`${API_BASE}/pedidos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Error al crear pedido');
    }
    return res.json();
  },

  async agregarItems(pedidoId: string, items: Array<{ productoId: string; cantidad: number }>): Promise<PedidoItem[]> {
    const res = await fetch(`${API_BASE}/pedidos/${pedidoId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Error al agregar items');
    }
    return res.json();
  },

  async updateItemCantidad(itemId: string, cantidad: number): Promise<PedidoItem> {
    const res = await fetch(`${API_BASE}/pedidos/items/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cantidad }),
    });
    if (!res.ok) throw new Error('Error al actualizar cantidad');
    return res.json();
  },

  async removeItem(itemId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/pedidos/items/${itemId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar item');
  },

  async marcarParaCobrar(pedidoId: string): Promise<Pedido> {
    const res = await fetch(`${API_BASE}/pedidos/${pedidoId}/para-cobrar`, { method: 'PUT' });
    if (!res.ok) throw new Error('Error al marcar para cobrar');
    return res.json();
  },

  async cancelar(pedidoId: string): Promise<Pedido> {
    const res = await fetch(`${API_BASE}/pedidos/${pedidoId}/cancelar`, { method: 'PUT' });
    if (!res.ok) throw new Error('Error al cancelar pedido');
    return res.json();
  },

  async aplicarDescuento(pedidoId: string, descuento: number): Promise<Pedido> {
    const res = await fetch(`${API_BASE}/pedidos/${pedidoId}/descuento`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ descuento }),
    });
    if (!res.ok) throw new Error('Error al aplicar descuento');
    return res.json();
  },
};

// ============================================
// CAJA
// ============================================

export interface Caja {
  id: string;
  estado: 'abierta' | 'cerrada';
  cajeroId: string | null;
  cajeroNombre: string | null;
  aperturaLocal: number;
  aperturaUSD: number;
  totalVentasLocal: number;
  totalVentasUSD: number;
  cierreLocal: number | null;
  cierreUSD: number | null;
  observacionesCierre: string | null;
  fechaApertura: string | null;
  fechaCierre: string | null;
  createdAt: string;
  updatedAt: string;
}

export const cajaService = {
  async getEstado(): Promise<Caja | null> {
    const res = await fetch(`${API_BASE}/caja`);
    if (!res.ok) throw new Error('Error al obtener estado de caja');
    return res.json();
  },

  async abrir(data: {
    cajeroId: string;
    cajeroNombre: string;
    aperturaLocal?: number;
    aperturaUSD?: number;
  }): Promise<Caja> {
    const res = await fetch(`${API_BASE}/caja/abrir`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Error al abrir caja');
    }
    return res.json();
  },

  async cerrar(data: { observaciones?: string }): Promise<Caja> {
    const res = await fetch(`${API_BASE}/caja/cerrar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Error al cerrar caja');
    }
    return res.json();
  },
};

export const transaccionService = {
  async getAll(): Promise<Transaccion[]> {
    const res = await fetch(`${API_BASE}/transacciones`);
    if (!res.ok) throw new Error('Error al obtener transacciones');
    return res.json();
  },

  async getById(id: string): Promise<Transaccion> {
    const res = await fetch(`${API_BASE}/transacciones/${id}`);
    if (!res.ok) throw new Error('Transacción no encontrada');
    return res.json();
  },

  async getByMesa(mesaId: string): Promise<Transaccion[]> {
    const res = await fetch(`${API_BASE}/transacciones/mesa/${mesaId}`);
    if (!res.ok) throw new Error('Error al obtener transacciones');
    return res.json();
  },

  async getByDateRange(inicio: string, fin: string): Promise<Transaccion[]> {
    const res = await fetch(`${API_BASE}/transacciones/fecha?inicio=${inicio}&fin=${fin}`);
    if (!res.ok) throw new Error('Error al obtener transacciones');
    return res.json();
  },

  async cerrarMesa(data: {
    mesaId: string;
    pedidoId: string;
    cajeraId: string;
    cajeraNombre: string;
    descuento?: number;
    formaPago: 'efectivo_local' | 'efectivo_usd' | 'mixto' | 'tarjeta';
    montoRecibidoLocal?: number;
    montoRecibidoUSD?: number;
    notas?: string;
  }): Promise<{ transaccion: Transaccion; ticket: TicketData }> {
    const res = await fetch(`${API_BASE}/transacciones/cerrar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Error al cerrar mesa');
    }
    return res.json();
  },

  async getTicket(transaccionId: string): Promise<TicketData> {
    const res = await fetch(`${API_BASE}/transacciones/${transaccionId}/ticket`);
    if (!res.ok) throw new Error('Ticket no encontrado');
    return res.json();
  },
};

// ============================================
// AUTH (real con backend PostgreSQL)
// ============================================

export interface AuthUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  rol: 'CAJERO' | 'MESERO';
  isActive: boolean;
  createdAt: string;
}

export interface PosAuthUser {
  id: string;
  email: string;
  nombre: string;
  rol: 'CAJERO' | 'MESERO';
}

interface LoginResponse {
  usuario: AuthUser;
  token: string;
}

export const authService = {
  /**
   * Login - llama al backend y guarda token en sessionStorage
   */
  async login(username: string, password: string): Promise<AuthUser> {
    console.log('Intentando login en:', `${API_BASE}/auth/login`);
    
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    console.log('Respuesta login:', res.status, res.statusText);

    if (!res.ok) {
      let errorMsg = 'Credenciales inválidas';
      try {
        const error = await res.json();
        errorMsg = error.error || errorMsg;
      } catch {
        errorMsg = `Error ${res.status}: ${res.statusText}`;
      }
      throw new Error(errorMsg);
    }

    const data: LoginResponse = await res.json();
    console.log('Login exitoso:', data.usuario.email, data.usuario.rol);
    
    // Guardar token en sessionStorage (se borra al cerrar navegador)
    sessionStorage.setItem('pos_token', data.token);
    sessionStorage.setItem('pos_user', JSON.stringify(data.usuario));
    
    return data.usuario;
  },

  /**
   * Logout - limpia sessionStorage
   */
  logout() {
    sessionStorage.removeItem('pos_token');
    sessionStorage.removeItem('pos_user');
  },

  /**
   * Obtener usuario actual desde sessionStorage
   */
  getUser(): AuthUser | null {
    const stored = sessionStorage.getItem('pos_user');
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  /**
   * Obtener token actual
   */
  getToken(): string | null {
    return sessionStorage.getItem('pos_token');
  },

  /**
   * Verificar si está autenticado
   */
  isAuthenticated(): boolean {
    return this.getToken() !== null && this.getUser() !== null;
  },

  /**
   * Verificar si es Cajero
   */
  isCajera(): boolean {
    const user = this.getUser();
    return user?.rol === 'CAJERO';
  },

  /**
   * Verificar si es Mesero
   */
  isMesera(): boolean {
    const user = this.getUser();
    return user?.rol === 'MESERO';
  },

  /**
   * Llamadas autenticadas con Bearer token
   */
  async authFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getToken();
    const headers = new Headers(options.headers as HeadersInit);
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    return fetch(url, { ...options, headers });
  },
};