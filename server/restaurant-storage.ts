import { 
  users, empresas, categorias, cardapio, clientes, pedidos, mesas, deliveryAreas, subscriptions, transacoesFinanceiras,
  type User, type InsertUser, type Empresa, type InsertEmpresa, type Categoria, type InsertCategoria,
  type Cardapio, type InsertCardapio, type Cliente, type InsertCliente, type Pedido, type InsertPedido,
  type Mesa, type InsertMesa, type DeliveryArea, type InsertDeliveryArea, type Subscription, type InsertSubscription,
  type TransacaoFinanceira, type InsertTransacaoFinanceira
} from "@shared/restaurant-schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IRestaurantStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  
  // Empresa management
  getEmpresa(id: number): Promise<Empresa | undefined>;
  getEmpresaByUser(userId: number): Promise<Empresa | undefined>;
  createEmpresa(empresa: InsertEmpresa): Promise<Empresa>;
  updateEmpresa(id: number, updates: Partial<Empresa>): Promise<Empresa>;
  
  // Pedidos management
  getPedidos(empresaId: number): Promise<Pedido[]>;
  getPedido(id: number): Promise<Pedido | undefined>;
  createPedido(pedido: InsertPedido): Promise<Pedido>;
  updatePedido(id: number, updates: Partial<Pedido>): Promise<Pedido>;
  
  // Clientes management
  getClientes(empresaId: number): Promise<Cliente[]>;
  getCliente(id: number): Promise<Cliente | undefined>;
  createCliente(cliente: InsertCliente): Promise<Cliente>;
  updateCliente(id: number, updates: Partial<Cliente>): Promise<Cliente>;
  
  // Cardapio management
  getCardapio(empresaId: number): Promise<Cardapio[]>;
  getCardapioItem(id: number): Promise<Cardapio | undefined>;
  createCardapioItem(item: InsertCardapio): Promise<Cardapio>;
  updateCardapioItem(id: number, updates: Partial<Cardapio>): Promise<Cardapio>;
  
  // Categorias management
  getCategorias(empresaId: number): Promise<Categoria[]>;
  createCategoria(categoria: InsertCategoria): Promise<Categoria>;
  
  // Mesas management
  getMesas(empresaId: number): Promise<Mesa[]>;
  getMesa(id: number): Promise<Mesa | undefined>;
  createMesa(mesa: InsertMesa): Promise<Mesa>;
  updateMesa(id: number, updates: Partial<Mesa>): Promise<Mesa>;
  
  // Transações Financeiras
  getTransacoesFinanceiras(empresaId: number): Promise<TransacaoFinanceira[]>;
  createTransacaoFinanceira(transacao: InsertTransacaoFinanceira): Promise<TransacaoFinanceira>;
  criarTransacaoAutomatica(pedido: Pedido): Promise<TransacaoFinanceira>;
  
  // Stats
  getEmpresaStats(empresaId: number): Promise<{
    pedidosHoje: number;
    vendas: number;
    clientesTotal: number;
    pedidosPendentes: number;
  }>;
}

export class RestaurantStorage implements IRestaurantStorage {
  
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }
  
  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }
  
  async getEmpresa(id: number): Promise<Empresa | undefined> {
    const result = await db.select().from(empresas).where(eq(empresas.id, id));
    return result[0];
  }
  
  async getEmpresaByUser(userId: number): Promise<Empresa | undefined> {
    const user = await this.getUser(userId);
    if (!user?.empresaId) return undefined;
    return this.getEmpresa(user.empresaId);
  }
  
  async createEmpresa(empresa: InsertEmpresa): Promise<Empresa> {
    const result = await db.insert(empresas).values(empresa).returning();
    return result[0];
  }
  
  async updateEmpresa(id: number, updates: Partial<Empresa>): Promise<Empresa> {
    const result = await db.update(empresas).set(updates).where(eq(empresas.id, id)).returning();
    return result[0];
  }
  
  async getPedidos(empresaId: number): Promise<Pedido[]> {
    const result = await db.select().from(pedidos)
      .where(eq(pedidos.empresaId, empresaId))
      .orderBy(desc(pedidos.createdAt));
    return result;
  }
  
  async getPedido(id: number): Promise<Pedido | undefined> {
    const result = await db.select().from(pedidos).where(eq(pedidos.id, id));
    return result[0];
  }
  
  async createPedido(pedido: InsertPedido): Promise<Pedido> {
    const result = await db.insert(pedidos).values(pedido).returning();
    return result[0];
  }
  
  async updatePedido(id: number, updates: Partial<Pedido>): Promise<Pedido> {
    const result = await db.update(pedidos).set(updates).where(eq(pedidos.id, id)).returning();
    return result[0];
  }
  
  async getClientes(empresaId: number): Promise<Cliente[]> {
    const result = await db.select().from(clientes)
      .where(eq(clientes.empresaId, empresaId))
      .orderBy(desc(clientes.createdAt));
    return result;
  }
  
  async getCliente(id: number): Promise<Cliente | undefined> {
    const result = await db.select().from(clientes).where(eq(clientes.id, id));
    return result[0];
  }
  
  async createCliente(cliente: InsertCliente): Promise<Cliente> {
    const result = await db.insert(clientes).values(cliente).returning();
    return result[0];
  }
  
  async updateCliente(id: number, updates: Partial<Cliente>): Promise<Cliente> {
    const result = await db.update(clientes).set(updates).where(eq(clientes.id, id)).returning();
    return result[0];
  }
  
  async getCardapio(empresaId: number): Promise<Cardapio[]> {
    const result = await db.select().from(cardapio)
      .where(eq(cardapio.empresaId, empresaId))
      .orderBy(cardapio.ordem);
    return result;
  }
  
  async getCardapioItem(id: number): Promise<Cardapio | undefined> {
    const result = await db.select().from(cardapio).where(eq(cardapio.id, id));
    return result[0];
  }
  
  async createCardapioItem(item: InsertCardapio): Promise<Cardapio> {
    const result = await db.insert(cardapio).values(item).returning();
    return result[0];
  }
  
  async updateCardapioItem(id: number, updates: Partial<Cardapio>): Promise<Cardapio> {
    const result = await db.update(cardapio).set(updates).where(eq(cardapio.id, id)).returning();
    return result[0];
  }
  
  async getCategorias(empresaId: number): Promise<Categoria[]> {
    const result = await db.select().from(categorias)
      .where(eq(categorias.empresaId, empresaId))
      .orderBy(categorias.ordem);
    return result;
  }
  
  async createCategoria(categoria: InsertCategoria): Promise<Categoria> {
    const result = await db.insert(categorias).values(categoria).returning();
    return result[0];
  }
  
  async getMesas(empresaId: number): Promise<Mesa[]> {
    const result = await db.select().from(mesas)
      .where(eq(mesas.empresaId, empresaId))
      .orderBy(mesas.numero);
    return result;
  }
  
  async getMesa(id: number): Promise<Mesa | undefined> {
    const result = await db.select().from(mesas).where(eq(mesas.id, id));
    return result[0];
  }
  
  async createMesa(mesa: InsertMesa): Promise<Mesa> {
    const result = await db.insert(mesas).values(mesa).returning();
    return result[0];
  }
  
  async updateMesa(id: number, updates: Partial<Mesa>): Promise<Mesa> {
    const result = await db.update(mesas).set(updates).where(eq(mesas.id, id)).returning();
    return result[0];
  }
  
  async getTransacoesFinanceiras(empresaId: number): Promise<TransacaoFinanceira[]> {
    const result = await db.select().from(transacoesFinanceiras)
      .where(eq(transacoesFinanceiras.empresaId, empresaId))
      .orderBy(desc(transacoesFinanceiras.data));
    return result;
  }
  
  async createTransacaoFinanceira(transacao: InsertTransacaoFinanceira): Promise<TransacaoFinanceira> {
    const result = await db.insert(transacoesFinanceiras).values(transacao).returning();
    return result[0];
  }
  
  async criarTransacaoAutomatica(pedido: Pedido): Promise<TransacaoFinanceira> {
    const cliente = await this.getCliente(pedido.clienteId);
    const nomeCliente = cliente?.nome || 'Cliente não identificado';
    
    const transacao = await this.createTransacaoFinanceira({
      empresaId: pedido.empresaId,
      tipo: 'receita',
      descricao: `Pedido #${pedido.numero} - ${nomeCliente}`,
      valor: pedido.total,
      categoria: 'Vendas',
      pedidoId: pedido.id,
      origem: 'pedido',
      status: 'confirmado'
    });
    
    return transacao;
  }
  
  async getEmpresaStats(empresaId: number): Promise<{
    pedidosHoje: number;
    vendas: number;
    clientesTotal: number;
    pedidosPendentes: number;
  }> {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    // Pedidos de hoje
    const pedidosHoje = await db.select({ count: sql<number>`count(*)` })
      .from(pedidos)
      .where(sql`${pedidos.empresaId} = ${empresaId} AND ${pedidos.createdAt} >= ${hoje}`);
    
    // Vendas totais
    const vendas = await db.select({ 
      total: sql<number>`COALESCE(SUM(CAST(${pedidos.total} AS DECIMAL)), 0)` 
    })
      .from(pedidos)
      .where(sql`${pedidos.empresaId} = ${empresaId} AND ${pedidos.status} = 'confirmado'`);
    
    // Total de clientes
    const clientesTotal = await db.select({ count: sql<number>`count(*)` })
      .from(clientes)
      .where(eq(clientes.empresaId, empresaId));
    
    // Pedidos pendentes
    const pedidosPendentes = await db.select({ count: sql<number>`count(*)` })
      .from(pedidos)
      .where(sql`${pedidos.empresaId} = ${empresaId} AND ${pedidos.status} = 'pendente'`);
    
    return {
      pedidosHoje: pedidosHoje[0]?.count || 0,
      vendas: Number(vendas[0]?.total || 0),
      clientesTotal: clientesTotal[0]?.count || 0,
      pedidosPendentes: pedidosPendentes[0]?.count || 0
    };
  }
}

export const restaurantStorage = new RestaurantStorage();