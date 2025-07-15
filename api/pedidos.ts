// Mock de pedidos para teste inicial
const pedidos = [
  {
    id: 1,
    numero: 'PED001',
    cliente: 'João Silva',
    clienteId: 1,
    empresaId: 1,
    mesa: null,
    status: 'pendente',
    tipo: 'delivery',
    itens: [
      { nome: 'Pizza Margherita', preco: 40, quantidade: 1 },
      { nome: 'Refrigerante', preco: 8, quantidade: 2 }
    ],
    subtotal: 56,
    taxaEntrega: 5,
    total: 61,
    observacoes: '',
    telefoneContato: '(11) 99999-9999',
    enderecoEntrega: 'Rua A, 123',
    tempoEstimado: 30,
    createdAt: new Date().toISOString()
  }
];

export default function handler(req: any, res: any) {
  if (req.method === 'GET') {
    return res.status(200).json(pedidos);
  }
  if (req.method === 'POST') {
    const { cliente, clienteId, tipo, mesa, itens, observacoes, taxaEntrega, telefoneContato, enderecoEntrega } = req.body;
    if (!tipo || !itens || itens.length === 0) {
      return res.status(400).json({ message: 'Tipo e itens são obrigatórios' });
    }
    const subtotal = itens.reduce((total: number, item: any) => total + (item.preco * item.quantidade), 0);
    const taxa = tipo === 'delivery' ? (taxaEntrega || 0) : 0;
    const total = subtotal + taxa;
    const novoPedido = {
      id: pedidos.length + 1,
      numero: `PED${String(pedidos.length + 1).padStart(3, '0')}`,
      cliente: cliente || 'Cliente Balcão',
      clienteId: clienteId || 1,
      empresaId: 1,
      mesa: tipo === 'mesa' ? mesa : null,
      status: 'pendente',
      tipo,
      itens,
      subtotal,
      taxaEntrega: taxa,
      total,
      observacoes: observacoes || '',
      telefoneContato: telefoneContato || '',
      enderecoEntrega: enderecoEntrega || '',
      tempoEstimado: 30,
      createdAt: new Date().toISOString()
    };
    pedidos.push(novoPedido);
    return res.status(201).json(novoPedido);
  }
  return res.status(405).json({ message: 'Método não permitido' });
} 