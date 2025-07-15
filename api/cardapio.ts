// Mock de itens do cardápio para teste inicial
const cardapio = [
  { id: 1, nome: 'Pizza Margherita', descricao: 'Clássica com tomate e manjericão', preco: 40, categoria: 'Pizza', disponivel: true },
  { id: 2, nome: 'Refrigerante', descricao: 'Lata 350ml', preco: 8, categoria: 'Bebida', disponivel: true }
];

export default function handler(req: any, res: any) {
  if (req.method === 'GET') {
    return res.status(200).json(cardapio);
  }
  if (req.method === 'POST') {
    const { nome, descricao, preco, categoria, disponivel } = req.body;
    if (!nome || !preco || !categoria) {
      return res.status(400).json({ message: 'Nome, preço e categoria são obrigatórios' });
    }
    const novoItem = {
      id: cardapio.length + 1,
      nome,
      descricao: descricao || '',
      preco: parseFloat(preco),
      categoria,
      disponivel: disponivel !== undefined ? disponivel : true
    };
    cardapio.push(novoItem);
    return res.status(201).json(novoItem);
  }
  return res.status(405).json({ message: 'Método não permitido' });
} 