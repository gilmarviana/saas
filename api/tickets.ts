let tickets = [
  { id: 1, titulo: 'Erro no pedido', descricao: 'Não consigo finalizar o pedido', prioridade: 'alta', categoria: 'tecnico', funcionarioId: 1 }
];

export default function handler(req: any, res: any) {
  if (req.method === 'GET') {
    return res.status(200).json(tickets);
  }
  if (req.method === 'POST') {
    const { titulo, descricao, prioridade, categoria, funcionarioId } = req.body;
    if (!titulo || !descricao || !prioridade || !categoria) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }
    const novoTicket = {
      id: tickets.length + 1,
      titulo,
      descricao,
      prioridade,
      categoria,
      funcionarioId: funcionarioId || null
    };
    tickets.push(novoTicket);
    return res.status(201).json(novoTicket);
  }
  return res.status(405).json({ message: 'Método não permitido' });
} 