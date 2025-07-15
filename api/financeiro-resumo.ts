export default function handler(req: any, res: any) {
  if (req.method === 'GET') {
    const resumo = {
      receitaTotal: 500,
      despesaTotal: 200,
      lucroLiquido: 300,
      pedidosConfirmados: 3,
      pedidosPendentes: 2,
      valorPendente: 122
    };
    return res.status(200).json(resumo);
  }
  return res.status(405).json({ message: 'Método não permitido' });
} 