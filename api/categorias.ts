// Mock de categorias para teste inicial
let categorias = [
  { id: 1, nome: 'Pizza', descricao: 'Pizzas artesanais', cor: '#ea580c' },
  { id: 2, nome: 'Bebida', descricao: 'Bebidas em geral', cor: '#2563eb' }
];

export default function handler(req: any, res: any) {
  if (req.method === 'GET') {
    return res.status(200).json(categorias);
  }
  if (req.method === 'POST') {
    const { nome, descricao, cor } = req.body;
    if (!nome) {
      return res.status(400).json({ message: 'Nome é obrigatório' });
    }
    const novaCategoria = {
      id: categorias.length + 1,
      nome,
      descricao: descricao || '',
      cor: cor || '#ea580c'
    };
    categorias.push(novaCategoria);
    return res.status(201).json(novaCategoria);
  }
  if (req.method === 'PUT') {
    const { id, nome, descricao, cor } = req.body;
    const categoria = categorias.find(c => c.id === id);
    if (!categoria) {
      return res.status(404).json({ message: 'Categoria não encontrada' });
    }
    categoria.nome = nome || categoria.nome;
    categoria.descricao = descricao || categoria.descricao;
    categoria.cor = cor || categoria.cor;
    return res.status(200).json(categoria);
  }
  if (req.method === 'DELETE') {
    const { id } = req.body;
    categorias = categorias.filter(c => c.id !== id);
    return res.status(200).json({ message: 'Categoria excluída', id });
  }
  return res.status(405).json({ message: 'Método não permitido' });
} 