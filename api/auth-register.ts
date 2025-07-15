export default function handler(req: any, res: any) {
  if (req.method === 'POST') {
    const { email, password, username, role } = req.body;
    if (!email || !password || !username || !role) {
      return res.status(400).json({ message: 'Campos obrigatórios ausentes' });
    }
    // Usuário mock
    const user = {
      id: Math.floor(Math.random() * 1000) + 2,
      username,
      email,
      role,
      empresaId: 1,
      telefone: ''
    };
    return res.status(200).json({ user });
  }
  return res.status(405).json({ message: 'Método não permitido' });
} 