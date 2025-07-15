export default function handler(req: any, res: any) {
  if (req.method === 'POST') {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }
    // Usuário mock
    const user = {
      id: 1,
      username: 'admin',
      email,
      role: 'admin',
      empresaId: 1,
      telefone: '(11) 99999-9999'
    };
    return res.status(200).json({ user });
  }
  return res.status(405).json({ message: 'Método não permitido' });
} 