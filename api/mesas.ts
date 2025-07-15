// Mock de mesas para teste inicial
const mesas = [
  { id: 1, numero: '01', status: 'ocupada', pedidos: [1], totalConta: 61, abertaEm: new Date().toISOString(), fechadaEm: null },
  { id: 2, numero: '02', status: 'fechada', pedidos: [], totalConta: 0, abertaEm: new Date().toISOString(), fechadaEm: new Date().toISOString() }
];

export default function handler(req: any, res: any) {
  if (req.method === 'GET') {
    return res.status(200).json(mesas);
  }
  if (req.method === 'POST') {
    // Fechar mesa pelo número
    const { numero } = req.query;
    const mesa = mesas.find(m => m.numero === numero);
    if (!mesa) {
      return res.status(404).json({ message: 'Mesa não encontrada' });
    }
    mesa.status = 'fechada';
    mesa.fechadaEm = new Date().toISOString();
    return res.status(200).json({ message: 'Mesa fechada com sucesso', mesa });
  }
  return res.status(405).json({ message: 'Método não permitido' });
} 