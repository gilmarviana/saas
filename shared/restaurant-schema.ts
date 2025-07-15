import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Planos de assinatura
export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  preco: decimal("preco", { precision: 10, scale: 2 }).notNull(),
  limitePedidos: integer("limite_pedidos").notNull(),
  painelFinanceiro: boolean("painel_financeiro").default(false),
  integracaoEvolution: boolean("integracao_evolution").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Empresas/Restaurantes
export const empresas = pgTable("empresas", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  email: text("email").notNull().unique(),
  telefone: text("telefone"),
  whatsapp: text("whatsapp"),
  endereco: text("endereco"),
  cidade: text("cidade"),
  estado: text("estado"),
  cep: text("cep"),
  cnpj: text("cnpj"),
  logo: text("logo"),
  cores: jsonb("cores"), // {primary: '#000', secondary: '#fff'}
  horarioFuncionamento: jsonb("horario_funcionamento"), // {seg: '8-18', ter: '8-18', ...}
  descricao: text("descricao"),
  instagram: text("instagram"),
  facebook: text("facebook"),
  website: text("website"),
  template: text("template").default("default"),
  subdomain: text("subdomain").notNull().unique(),
  planId: integer("plan_id").references(() => plans.id),
  evolutionApiKey: text("evolution_api_key"),
  evolutionApiUrl: text("evolution_api_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Usuários (super_admin, empresa, garcom, cliente)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password_hash: text("password_hash").notNull(),
  role: text("role").notNull().default("cliente"), // super_admin, empresa, garcom, cliente
  empresaId: integer("empresa_id").references(() => empresas.id),
  nome: text("nome"),
  telefone: text("telefone"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Categorias do cardápio
export const categorias = pgTable("categorias", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  empresaId: integer("empresa_id").references(() => empresas.id).notNull(),
  ordem: integer("ordem").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Itens do cardápio
export const cardapio = pgTable("cardapio", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  descricao: text("descricao"),
  preco: decimal("preco", { precision: 10, scale: 2 }).notNull(),
  imagem: text("imagem"),
  categoriaId: integer("categoria_id").references(() => categorias.id).notNull(),
  empresaId: integer("empresa_id").references(() => empresas.id).notNull(),
  disponivel: boolean("disponivel").default(true),
  ordem: integer("ordem").default(0),
  tempoPreparacao: integer("tempo_preparacao"), // em minutos
  ingredientes: text("ingredientes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Clientes
export const clientes = pgTable("clientes", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  telefone: text("telefone"),
  email: text("email"),
  whatsapp: text("whatsapp"),
  endereco: text("endereco"),
  cidade: text("cidade"),
  estado: text("estado"),
  cep: text("cep"),
  empresaId: integer("empresa_id").references(() => empresas.id).notNull(),
  dataNascimento: timestamp("data_nascimento"),
  observacoes: text("observacoes"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Pedidos
export const pedidos = pgTable("pedidos", {
  id: serial("id").primaryKey(),
  numero: text("numero").notNull(),
  clienteId: integer("cliente_id").references(() => clientes.id).notNull(),
  empresaId: integer("empresa_id").references(() => empresas.id).notNull(),
  garcomId: integer("garcom_id").references(() => users.id),
  mesa: text("mesa"),
  status: text("status").notNull().default("pendente"), // pendente, confirmado, preparando, pronto, entregue, cancelado
  tipo: text("tipo").notNull(), // delivery, balcao, mesa
  itens: jsonb("itens").notNull(), // [{id, nome, preco, quantidade, obs}]
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxaEntrega: decimal("taxa_entrega", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  observacoes: text("observacoes"),
  enderecoEntrega: text("endereco_entrega"),
  telefoneContato: text("telefone_contato"),
  tempoEstimado: integer("tempo_estimado"), // em minutos
  createdAt: timestamp("created_at").defaultNow(),
});

// Mesas
export const mesas = pgTable("mesas", {
  id: serial("id").primaryKey(),
  numero: text("numero").notNull(),
  empresaId: integer("empresa_id").references(() => empresas.id).notNull(),
  status: text("status").notNull().default("livre"), // livre, ocupada, fechada
  pedidos: jsonb("pedidos").default('[]'), // array de IDs de pedidos
  totalConta: decimal("total_conta", { precision: 10, scale: 2 }).default("0"),
  abertaEm: timestamp("aberta_em"),
  fechadaEm: timestamp("fechada_em"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Áreas de entrega
export const deliveryAreas = pgTable("delivery_areas", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  empresaId: integer("empresa_id").references(() => empresas.id).notNull(),
  tipo: text("tipo").notNull(), // raio, poligono, cep
  dados: jsonb("dados").notNull(), // {centro: {lat, lng}, raio: km} ou {pontos: [{lat, lng}]} ou {ceps: []}
  taxaEntrega: decimal("taxa_entrega", { precision: 10, scale: 2 }).notNull(),
  tempoEntrega: integer("tempo_entrega").notNull(), // em minutos
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Assinaturas
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  empresaId: integer("empresa_id").references(() => empresas.id).notNull(),
  planId: integer("plan_id").references(() => plans.id).notNull(),
  status: text("status").notNull().default("trial"), // active, cancelled, expired, trial
  asaasSubscriptionId: text("asaas_subscription_id"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  trialEnd: timestamp("trial_end"),
  pedidosUsados: integer("pedidos_usados").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Transações Financeiras
export const transacoesFinanceiras = pgTable("transacoes_financeiras", {
  id: serial("id").primaryKey(),
  empresaId: integer("empresa_id").references(() => empresas.id).notNull(),
  tipo: text("tipo").notNull(), // receita, despesa
  descricao: text("descricao").notNull(),
  valor: decimal("valor", { precision: 10, scale: 2 }).notNull(),
  categoria: text("categoria").notNull(),
  pedidoId: integer("pedido_id").references(() => pedidos.id),
  origem: text("origem").notNull().default("manual"), // manual, pedido
  status: text("status").notNull().default("confirmado"),
  data: timestamp("data").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schemas de inserção
export const insertPlanSchema = createInsertSchema(plans).omit({
  id: true,
  createdAt: true,
});

export const insertEmpresaSchema = createInsertSchema(empresas).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCategoriaSchema = createInsertSchema(categorias).omit({
  id: true,
  createdAt: true,
});

export const insertCardapioSchema = createInsertSchema(cardapio).omit({
  id: true,
  createdAt: true,
});

export const insertClienteSchema = createInsertSchema(clientes).omit({
  id: true,
  createdAt: true,
});

export const insertPedidoSchema = createInsertSchema(pedidos).omit({
  id: true,
  createdAt: true,
});

export const insertMesaSchema = createInsertSchema(mesas).omit({
  id: true,
  createdAt: true,
});

export const insertDeliveryAreaSchema = createInsertSchema(deliveryAreas).omit({
  id: true,
  createdAt: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
});

export const insertTransacaoFinanceiraSchema = createInsertSchema(transacoesFinanceiras).omit({
  id: true,
  createdAt: true,
});

// Tipos
export type Plan = typeof plans.$inferSelect;
export type InsertPlan = z.infer<typeof insertPlanSchema>;

export type Empresa = typeof empresas.$inferSelect;
export type InsertEmpresa = z.infer<typeof insertEmpresaSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Categoria = typeof categorias.$inferSelect;
export type InsertCategoria = z.infer<typeof insertCategoriaSchema>;

export type Cardapio = typeof cardapio.$inferSelect;
export type InsertCardapio = z.infer<typeof insertCardapioSchema>;

export type Cliente = typeof clientes.$inferSelect;
export type InsertCliente = z.infer<typeof insertClienteSchema>;

export type Pedido = typeof pedidos.$inferSelect;
export type InsertPedido = z.infer<typeof insertPedidoSchema>;

export type Mesa = typeof mesas.$inferSelect;
export type InsertMesa = z.infer<typeof insertMesaSchema>;

export type DeliveryArea = typeof deliveryAreas.$inferSelect;
export type InsertDeliveryArea = z.infer<typeof insertDeliveryAreaSchema>;

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

export type TransacaoFinanceira = typeof transacoesFinanceiras.$inferSelect;
export type InsertTransacaoFinanceira = z.infer<typeof insertTransacaoFinanceiraSchema>;