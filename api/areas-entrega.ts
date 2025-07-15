let areas = [
  { id: 1, nome: 'Centro', bairros: ['Centro'], raioKm: 5, taxaEntrega: 5, tempoEstimado: 30, cor: '#ea580c', ativo: true },
  { id: 2, nome: 'Bairro A', bairros: ['Bairro A'], raioKm: 8, taxaEntrega: 8, tempoEstimado: 45, cor: '#2563eb', ativo: true }
];

export default function handler(req: any, res: any) {
  if (req.method === 'GET') {
    return res.status(200).json(areas);
  }
  if (req.method === 'POST') {
    const { nome, bairros, raioKm, taxaEntrega, tempoEstimado, cor } = req.body;
    if (!nome || !bairros) {
      return res.status(400).json({ message: 'Nome e bairros são obrigatórios' });
    }
    const novaArea = {
      id: areas.length + 1,
      nome,
      bairros: Array.isArray(bairros) ? bairros : bairros.split(',').map((b: string) => b.trim()),
      raioKm: parseFloat(raioKm),
      taxaEntrega: parseFloat(taxaEntrega),
      tempoEstimado: parseInt(tempoEstimado),
      cor: cor || '#ea580c',
      ativo: true
    };
    areas.push(novaArea);
    return res.status(201).json(novaArea);
  }
  if (req.method === 'PUT') {
    const { id, nome, bairros, raioKm, taxaEntrega, tempoEstimado, cor, ativo } = req.body;
    const area = areas.find(a => a.id === id);
    if (!area) {
      return res.status(404).json({ message: 'Área não encontrada' });
    }
    area.nome = nome || area.nome;
    area.bairros = bairros ? (Array.isArray(bairros) ? bairros : bairros.split(',').map((b: string) => b.trim())) : area.bairros;
    area.raioKm = raioKm !== undefined ? parseFloat(raioKm) : area.raioKm;
    area.taxaEntrega = taxaEntrega !== undefined ? parseFloat(taxaEntrega) : area.taxaEntrega;
    area.tempoEstimado = tempoEstimado !== undefined ? parseInt(tempoEstimado) : area.tempoEstimado;
    area.cor = cor || area.cor;
    area.ativo = ativo !== undefined ? ativo : area.ativo;
    return res.status(200).json(area);
  }
  if (req.method === 'DELETE') {
    const { id } = req.body;
    areas = areas.filter(a => a.id !== id);
    return res.status(200).json({ message: 'Área excluída', id });
  }
  return res.status(405).json({ message: 'Método não permitido' });
} 