// Mock de transações financeiras para teste inicial
const transacoes = [
  { id: 1, tipo: 'receita', descricao: 'Venda de Pizza', valor: 40, categoria: 'Vendas', data: new Date().toISOString(), status: 'confirmado', origem: 'pedido', pedidoId: 1 },
  { id: 2, tipo: 'despesa', descricao: 'Compra de ingredientes', valor: 20, categoria: 'Insumos', data: new Date().toISOString(), status: 'confirmado', origem: 'manual', pedidoId: null }
];

export default function handler(req: any, res: any) {
  if (req.method === 'GET') {
    return res.status(200).json(transacoes);
  }
  if (req.method === 'POST') {
    const { tipo, descricao, valor, categoria } = req.body;
    if (!tipo || !descricao || !valor || !categoria) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }
    const novaTransacao = {
      id: transacoes.length + 1,
      tipo,
      descricao,
      valor: parseFloat(valor),
      categoria,
      data: new Date().toISOString(),
      status: 'confirmado',
      origem: 'manual',
      pedidoId: null
    };
    transacoes.push(novaTransacao);
    return res.status(201).json(novaTransacao);
  }
  return res.status(405).json({ message: 'Método não permitido' });
} 