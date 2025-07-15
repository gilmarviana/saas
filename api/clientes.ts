// Mock de clientes para teste inicial
const clientes = [
  { id: 1, nome: 'João Silva', telefone: '(11) 99999-9999', endereco: 'Rua A, 123', email: 'joao@email.com' },
  { id: 2, nome: 'Maria Souza', telefone: '(21) 88888-8888', endereco: 'Rua B, 456', email: 'maria@email.com' },
];

export default function handler(req: any, res: any) {
  if (req.method === 'GET') {
    // Retorna lista mockada
    return res.status(200).json(clientes);
  }
  if (req.method === 'POST') {
    const { nome, telefone, endereco, email } = req.body;
    if (!nome || !telefone) {
      return res.status(400).json({ message: 'Nome e telefone são obrigatórios' });
    }
    const novoCliente = {
      id: clientes.length + 1,
      nome,
      telefone,
      endereco: endereco || '',
      email: email || '',
    };
    clientes.push(novoCliente);
    return res.status(201).json(novoCliente);
  }
  return res.status(405).json({ message: 'Método não permitido' });
} 