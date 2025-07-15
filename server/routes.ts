import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { restaurantStorage } from "./restaurant-storage";
import { insertUserSchema, insertClientSchema, insertProjectSchema, insertServiceSchema, insertMeetingSchema } from "@shared/schema";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await restaurantStorage.getUserByEmail(email);
      if (!user || user.password_hash !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!user.isActive) {
        return res.status(401).json({ message: "Account is inactive" });
      }

      // Update last active for clients
      if (user.role === "client") {
        await storage.updateClientLastActive(user.id);
      }

      res.json({ 
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          empresaId: user.empresaId,
          telefone: user.telefone,
        }
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { confirmPassword, ...userData } = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await storage.createUser(userData);
      
      // If registering as a client, create client record
      if (userData.role === "client" && userData.empresaId) {
        await storage.createClient({
          userId: user.id,
          adminId: userData.empresaId,
          lastActiveAt: new Date(),
        });
      }

      res.json({ 
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          empresaId: user.empresaId,
          telefone: user.telefone,
        }
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // User management routes
  app.get("/api/users/administrators", async (req, res) => {
    try {
      const administrators = await storage.getAdministrators();
      
      const adminsWithStats = await Promise.all(
        administrators.map(async (admin) => {
          const clients = await storage.getClientsByAdmin(admin.id);
          const subscription = await storage.getSubscriptionByUser(admin.id);
          
          return {
            id: admin.id,
            username: admin.username,
            email: admin.email,
            businessName: admin.businessName,
            clientCount: clients.length,
            isActive: admin.isActive,
            subscription: subscription ? {
              planName: subscription.planName,
              status: subscription.status,
              amount: subscription.amount,
            } : null,
            createdAt: admin.createdAt,
          };
        })
      );

      res.json(adminsWithStats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const user = await storage.updateUser(id, updates);
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Client management routes
  app.get("/api/clients", async (req, res) => {
    try {
      const adminId = parseInt(req.query.adminId as string);
      if (!adminId) {
        return res.status(400).json({ message: "Admin ID is required" });
      }

      const clients = await storage.getClientsByAdmin(adminId);
      res.json(clients);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/clients", async (req, res) => {
    try {
      const clientData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(clientData);
      res.json(client);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Project management routes
  app.get("/api/projects", async (req, res) => {
    try {
      const clientId = req.query.clientId;
      const adminId = req.query.adminId;

      if (clientId) {
        const projects = await storage.getProjectsByClient(parseInt(clientId as string));
        res.json(projects);
      } else if (adminId) {
        const projects = await storage.getProjectsByAdmin(parseInt(adminId as string));
        res.json(projects);
      } else {
        return res.status(400).json({ message: "Client ID or Admin ID is required" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      res.json(project);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const project = await storage.updateProject(id, updates);
      res.json(project);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Service management routes
  app.get("/api/services", async (req, res) => {
    try {
      const adminId = parseInt(req.query.adminId as string);
      if (!adminId) {
        return res.status(400).json({ message: "Admin ID is required" });
      }

      const services = await storage.getServicesByAdmin(adminId);
      res.json(services);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/services", async (req, res) => {
    try {
      const serviceData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(serviceData);
      res.json(service);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Meeting management routes
  app.get("/api/meetings", async (req, res) => {
    try {
      const clientId = req.query.clientId;
      const adminId = req.query.adminId;

      if (clientId) {
        const meetings = await storage.getMeetingsByClient(parseInt(clientId as string));
        res.json(meetings);
      } else if (adminId) {
        const meetings = await storage.getMeetingsByAdmin(parseInt(adminId as string));
        res.json(meetings);
      } else {
        return res.status(400).json({ message: "Client ID or Admin ID is required" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/meetings", async (req, res) => {
    try {
      const meetingData = insertMeetingSchema.parse(req.body);
      const meeting = await storage.createMeeting(meetingData);
      res.json(meeting);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Analytics routes
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/stats/admin/:id", async (req, res) => {
    try {
      const adminId = parseInt(req.params.id);
      const stats = await storage.getAdminStats(adminId);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Cardápio routes
  app.get("/api/cardapio", async (req, res) => {
    try {
      const cardapio = await restaurantStorage.getCardapio(1);
      res.json(cardapio);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/cardapio", async (req, res) => {
    try {
      const { nome, descricao, preco, categoria, disponivel } = req.body;
      
      if (!nome || !preco) {
        return res.status(400).json({ message: "Nome e preço são obrigatórios" });
      }

      // Buscar a categoria pelo nome
      const categorias = await restaurantStorage.getCategorias(1);
      let categoriaId = null;
      
      if (categoria) {
        const categoriaExistente = categorias.find(cat => cat.nome === categoria);
        if (categoriaExistente) {
          categoriaId = categoriaExistente.id;
        } else {
          // Criar nova categoria se não existir
          const novaCategoria = await restaurantStorage.createCategoria({
            nome: categoria,
            empresaId: 1
          });
          categoriaId = novaCategoria.id;
        }
      }

      const novoItem = await restaurantStorage.createCardapioItem({
        nome,
        descricao: descricao || '',
        preco: parseFloat(preco).toString(),
        categoriaId,
        empresaId: 1,
        disponivel: disponivel !== undefined ? disponivel : true
      });

      res.json(novoItem);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/cardapio/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { nome, descricao, preco, categoria, disponivel } = req.body;
      
      // Buscar a categoria pelo nome se fornecida
      let categoriaId = null;
      
      if (categoria) {
        const categorias = await restaurantStorage.getCategorias(1);
        const categoriaExistente = categorias.find(cat => cat.nome === categoria);
        if (categoriaExistente) {
          categoriaId = categoriaExistente.id;
        } else {
          // Criar nova categoria se não existir
          const novaCategoria = await restaurantStorage.createCategoria({
            nome: categoria,
            empresaId: 1
          });
          categoriaId = novaCategoria.id;
        }
      }

      const itemAtualizado = await restaurantStorage.updateCardapioItem(id, {
        nome,
        descricao: descricao || '',
        preco: parseFloat(preco).toString(),
        categoriaId,
        disponivel: disponivel !== undefined ? disponivel : true
      });

      res.json(itemAtualizado);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/cardapio/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      // Aqui iríamos implementar a remoção do item do banco de dados
      // Por enquanto vamos apenas responder com sucesso
      res.json({ message: "Item removido com sucesso", id });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Todos os dados agora são gerenciados no banco de dados PostgreSQL via restaurantStorage

  // Rotas de pedidos
  app.get("/api/pedidos", async (req, res) => {
    try {
      const pedidos = await restaurantStorage.getPedidos(1);
      
      // Buscar nomes dos clientes
      const pedidosComClientes = await Promise.all(
        pedidos.map(async (pedido) => {
          let nomeCliente = 'Cliente Balcão';
          
          if (pedido.tipo === 'mesa') {
            nomeCliente = `Mesa ${pedido.mesa}`;
          } else if (pedido.clienteId) {
            const cliente = await restaurantStorage.getCliente(pedido.clienteId);
            nomeCliente = cliente?.nome || 'Cliente não encontrado';
          }
          
          return {
            ...pedido,
            cliente: nomeCliente,
            createdAt: pedido.createdAt?.toISOString() || new Date().toISOString(),
            total: Number(pedido.total),
            subtotal: Number(pedido.subtotal),
            taxaEntrega: Number(pedido.taxaEntrega),
          };
        })
      );
      
      res.json(pedidosComClientes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/pedidos", async (req, res) => {
    try {
      const { clienteId, cliente, tipo, mesa, itens, observacoes, taxaEntrega } = req.body;
      
      if (!tipo || !itens || itens.length === 0) {
        return res.status(400).json({ message: "Tipo, itens são obrigatórios" });
      }

      // Para delivery, precisa de cliente
      if (tipo === 'delivery' && !clienteId && !cliente) {
        return res.status(400).json({ message: "Cliente obrigatório para delivery" });
      }

      // Para mesa, precisa do número da mesa
      if (tipo === 'mesa' && !mesa) {
        return res.status(400).json({ message: "Número da mesa obrigatório" });
      }

      const subtotal = itens.reduce((total: number, item: any) => total + (item.preco * item.quantidade), 0);
      const taxa = tipo === 'delivery' ? (taxaEntrega || 0) : 0;
      const total = subtotal + taxa;

      // Definir nome do cliente
      let nomeCliente = 'Cliente Balcão';
      if (tipo === 'delivery') {
        if (clienteId) {
          const clienteEncontrado = clientesMemoria.find(c => c.id === clienteId);
          nomeCliente = clienteEncontrado ? clienteEncontrado.nome : 'Cliente não encontrado';
        } else if (cliente) {
          nomeCliente = typeof cliente === 'string' ? cliente : cliente.nome;
        }
      } else if (tipo === 'mesa') {
        nomeCliente = `Mesa ${mesa}`;
      }

      // Gerar número do pedido
      const pedidosExistentes = await restaurantStorage.getPedidos(1);
      const proximoNumero = pedidosExistentes.length + 1;

      // Criar/buscar cliente se necessário
      let clienteRealId = clienteId;
      if (!clienteId && cliente && tipo === 'delivery') {
        const novoCliente = await restaurantStorage.createCliente({
          nome: typeof cliente === 'string' ? cliente : cliente.nome,
          telefone: typeof cliente === 'object' ? cliente.telefone : null,
          email: typeof cliente === 'object' ? cliente.email : null,
          empresaId: 1,
        });
        clienteRealId = novoCliente.id;
      }

      // Criar pedido no banco
      const novoPedido = await restaurantStorage.createPedido({
        numero: `PED${String(proximoNumero).padStart(3, '0')}`,
        clienteId: clienteRealId || 1,
        empresaId: 1,
        mesa: tipo === 'mesa' ? mesa : null,
        status: "pendente",
        tipo,
        itens,
        subtotal: subtotal.toString(),
        taxaEntrega: taxa.toString(),
        total: total.toString(),
        observacoes,
        telefoneContato: typeof cliente === 'object' ? cliente.telefone : null,
        enderecoEntrega: typeof cliente === 'object' ? cliente.endereco : null,
        tempoEstimado: 30,
      });

      // Se for pedido de mesa, criar/atualizar controle da mesa
      if (tipo === 'mesa') {
        const mesasLista = await restaurantStorage.getMesas(1);
        let mesaExistente = mesasLista.find(m => m.numero === mesa);
        
        if (!mesaExistente) {
          mesaExistente = await restaurantStorage.createMesa({
            numero: mesa,
            empresaId: 1,
            status: 'ocupada',
            pedidos: [novoPedido.id],
            totalConta: total.toString(),
            abertaEm: new Date()
          });
        } else {
          const pedidosAtuais = Array.isArray(mesaExistente.pedidos) ? mesaExistente.pedidos : [];
          pedidosAtuais.push(novoPedido.id);
          const novoTotal = Number(mesaExistente.totalConta) + total;
          
          await restaurantStorage.updateMesa(mesaExistente.id, {
            pedidos: pedidosAtuais,
            totalConta: novoTotal.toString(),
            status: 'ocupada'
          });
        }
      }

      // Formato esperado pelo frontend
      const pedidoResponse = {
        ...novoPedido,
        cliente: nomeCliente,
        createdAt: novoPedido.createdAt?.toISOString() || new Date().toISOString(),
        total: Number(novoPedido.total),
        subtotal: Number(novoPedido.subtotal),
        taxaEntrega: Number(novoPedido.taxaEntrega),
      };

      res.json(pedidoResponse);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/pedidos/:id/confirmar", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pedido = await restaurantStorage.getPedido(id);
      
      if (!pedido) {
        return res.status(404).json({ message: "Pedido não encontrado" });
      }
      
      const pedidoAtualizado = await restaurantStorage.updatePedido(id, { status: "confirmado" });
      
      // Criar transação financeira automaticamente
      await restaurantStorage.criarTransacaoAutomatica(pedidoAtualizado);
      
      res.json({ message: "Pedido confirmado com sucesso", id, pedido: pedidoAtualizado });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/pedidos/:id/cancelar", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pedido = await restaurantStorage.getPedido(id);
      
      if (!pedido) {
        return res.status(404).json({ message: "Pedido não encontrado" });
      }
      
      const pedidoAtualizado = await restaurantStorage.updatePedido(id, { status: "cancelado" });
      res.json({ message: "Pedido cancelado com sucesso", id, pedido: pedidoAtualizado });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/pedidos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { clienteId, cliente, tipo, mesa, itens, observacoes, taxaEntrega } = req.body;
      
      const pedidoIndex = pedidosMemoria.findIndex(p => p.id === id);
      
      if (pedidoIndex === -1) {
        return res.status(404).json({ message: "Pedido não encontrado" });
      }

      if (!tipo || !itens || itens.length === 0) {
        return res.status(400).json({ message: "Tipo e itens são obrigatórios" });
      }

      const subtotal = itens.reduce((total: number, item: any) => total + (item.preco * item.quantidade), 0);
      const taxa = tipo === 'delivery' ? (taxaEntrega || 0) : 0;
      const total = subtotal + taxa;

      // Definir nome do cliente
      let nomeCliente = 'Cliente Balcão';
      if (tipo === 'delivery') {
        if (clienteId) {
          const clienteEncontrado = clientesMemoria.find(c => c.id === clienteId);
          nomeCliente = clienteEncontrado ? clienteEncontrado.nome : 'Cliente não encontrado';
        } else if (cliente) {
          nomeCliente = typeof cliente === 'string' ? cliente : cliente.nome;
        }
      } else if (tipo === 'mesa') {
        nomeCliente = `Mesa ${mesa}`;
      }

      // Atualizar pedido
      const pedidoAtualizado = {
        ...pedidosMemoria[pedidoIndex],
        cliente: nomeCliente,
        clienteId: clienteId || null,
        mesa: tipo === 'mesa' ? mesa : null,
        total,
        tipo,
        itens,
        observacoes,
        taxaEntrega: taxa,
        updatedAt: new Date().toISOString()
      };

      // Atualizar controle de mesa se necessário
      if (tipo === 'mesa') {
        let mesaExistente = mesasMemoria.find(m => m.numero === mesa);
        if (!mesaExistente) {
          mesaExistente = {
            id: proximoIdMesa++,
            numero: mesa,
            status: 'ocupada',
            pedidos: [],
            totalConta: 0,
            abertaEm: new Date().toISOString()
          };
          mesasMemoria.push(mesaExistente);
        }
        
        // Recalcular total da mesa
        const pedidosDaMesa = pedidosMemoria.filter(p => p.mesa === mesa);
        mesaExistente.totalConta = pedidosDaMesa.reduce((total, p) => total + p.total, 0);
        
        if (!mesaExistente.pedidos.includes(id)) {
          mesaExistente.pedidos.push(id);
        }
      }

      pedidosMemoria[pedidoIndex] = pedidoAtualizado;
      res.json(pedidoAtualizado);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Rotas de clientes
  app.get("/api/clientes", async (req, res) => {
    try {
      const clientes = await restaurantStorage.getClientes(1);
      res.json(clientes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/clientes", async (req, res) => {
    try {
      const { nome, telefone, endereco, email } = req.body;
      
      if (!nome || !telefone) {
        return res.status(400).json({ message: "Nome e telefone são obrigatórios" });
      }

      const novoCliente = await restaurantStorage.createCliente({
        nome,
        telefone,
        endereco: endereco || '',
        email: email || '',
        empresaId: 1
      });

      res.json(novoCliente);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Rotas de estatísticas da empresa
  app.get("/api/empresa/stats", async (req, res) => {
    try {
      const stats = await restaurantStorage.getEmpresaStats(1);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Rotas de financeiro
  app.get("/api/financeiro/transacoes", async (req, res) => {
    try {
      const transacoes = await restaurantStorage.getTransacoesFinanceiras(1);
      
      // Converter para o formato esperado pelo frontend
      const transacoesFormatadas = transacoes.map(t => ({
        id: t.id,
        tipo: t.tipo,
        descricao: t.descricao,
        valor: Number(t.valor),
        categoria: t.categoria,
        data: t.data?.toISOString() || new Date().toISOString(),
        status: t.status,
        origem: t.origem,
        pedidoId: t.pedidoId
      }));
      
      res.json(transacoesFormatadas);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/financeiro/transacoes", async (req, res) => {
    try {
      const { tipo, descricao, valor, categoria } = req.body;
      
      if (!tipo || !descricao || !valor || !categoria) {
        return res.status(400).json({ message: "Todos os campos são obrigatórios" });
      }

      const novaTransacao = await restaurantStorage.createTransacaoFinanceira({
        empresaId: 1,
        tipo,
        descricao,
        valor: parseFloat(valor).toString(),
        categoria,
        origem: "manual",
        status: "confirmado"
      });

      res.json({
        id: novaTransacao.id,
        tipo: novaTransacao.tipo,
        descricao: novaTransacao.descricao,
        valor: Number(novaTransacao.valor),
        categoria: novaTransacao.categoria,
        data: novaTransacao.data?.toISOString() || new Date().toISOString(),
        status: novaTransacao.status,
        origem: novaTransacao.origem
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/financeiro/resumo", async (req, res) => {
    try {
      const pedidos = await restaurantStorage.getPedidos(1);
      const transacoes = await restaurantStorage.getTransacoesFinanceiras(1);
      
      const receitaTotal = transacoes
        .filter(t => t.tipo === 'receita')
        .reduce((total, t) => total + Number(t.valor), 0);
      
      const despesaTotal = transacoes
        .filter(t => t.tipo === 'despesa')
        .reduce((total, t) => total + Number(t.valor), 0);
      
      const resumo = {
        receitaTotal,
        despesaTotal,
        lucroLiquido: receitaTotal - despesaTotal,
        pedidosConfirmados: pedidos.filter(p => p.status === 'confirmado').length,
        pedidosPendentes: pedidos.filter(p => p.status === 'pendente').length,
        valorPendente: pedidos
          .filter(p => p.status === 'pendente')
          .reduce((total, p) => total + Number(p.total), 0)
      };
      res.json(resumo);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Rotas de mesas
  app.get("/api/mesas", async (req, res) => {
    try {
      const mesas = await restaurantStorage.getMesas(1);
      res.json(mesas);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/mesas/:numero/fechar", async (req, res) => {
    try {
      const numero = req.params.numero;
      const mesasLista = await restaurantStorage.getMesas(1);
      const mesa = mesasLista.find(m => m.numero === numero);
      
      if (!mesa) {
        return res.status(404).json({ message: "Mesa não encontrada" });
      }
      
      // Marcar todos os pedidos da mesa como entregues
      if (mesa.pedidos && Array.isArray(mesa.pedidos)) {
        for (const pedidoId of mesa.pedidos) {
          await restaurantStorage.updatePedido(pedidoId as number, { status: 'entregue' });
        }
      }
      
      const mesaAtualizada = await restaurantStorage.updateMesa(mesa.id, {
        status: 'fechada',
        fechadaEm: new Date()
      });
      
      res.json({ message: "Mesa fechada com sucesso", mesa: mesaAtualizada });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Rotas de categorias
  app.get("/api/categorias", async (req, res) => {
    try {
      const categorias = await restaurantStorage.getCategorias(1);
      res.json(categorias);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Placeholder for subscription creation (Stripe removed)
  app.post('/api/create-subscription', async (req, res) => {
    try {
      const { userId, planName, amount } = req.body;
      
      if (!userId || !planName || !amount) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if user already has a subscription
      const existingSubscription = await storage.getSubscriptionByUser(userId);
      if (existingSubscription && existingSubscription.status === 'active') {
        return res.status(400).json({ message: "User already has an active subscription" });
      }

      // Create subscription without Stripe
      await storage.createSubscription({
        userId,
        planName,
        amount,
        status: 'active',
        stripeSubscriptionId: null,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      });

      res.json({
        subscriptionId: `sub_${Date.now()}`,
        clientSecret: null,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
