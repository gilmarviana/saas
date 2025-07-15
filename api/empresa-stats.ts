export default function handler(req: any, res: any) {
  if (req.method === 'GET') {
    const stats = {
      pedidosHoje: 5,
      vendas: 300,
      clientesTotal: 20,
      pedidosPendentes: 2
    };
    return res.status(200).json(stats);
  }
  return res.status(405).json({ message: 'Método não permitido' });
} 