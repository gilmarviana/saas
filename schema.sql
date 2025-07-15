-- Schema completo para o sistema de restaurante

-- Tabela de planos
CREATE TABLE IF NOT EXISTS plans (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    limite_pedidos INTEGER NOT NULL,
    recursos TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de empresas/restaurantes
CREATE TABLE IF NOT EXISTS empresas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefone VARCHAR(20),
    whatsapp VARCHAR(20),
    endereco TEXT,
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(10),
    cnpj VARCHAR(20),
    logo TEXT,
    cores JSONB,
    horario_funcionamento JSONB,
    descricao TEXT,
    instagram VARCHAR(255),
    facebook VARCHAR(255),
    website VARCHAR(255),
    template VARCHAR(50) DEFAULT 'default',
    subdomain VARCHAR(100) UNIQUE,
    plan_id INTEGER REFERENCES plans(id),
    evolution_api_key VARCHAR(255),
    evolution_api_url VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'empresa', 'garcom', 'cliente')),
    empresa_id INTEGER REFERENCES empresas(id),
    telefone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de categorias do cardápio
CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    empresa_id INTEGER REFERENCES empresas(id),
    ordem INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela do cardápio
CREATE TABLE IF NOT EXISTS cardapio (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL,
    categoria_id INTEGER REFERENCES categorias(id),
    empresa_id INTEGER REFERENCES empresas(id),
    imagem TEXT,
    is_disponivel BOOLEAN DEFAULT true,
    tempo_preparo INTEGER,
    ingredientes TEXT[],
    informacoes_nutricionais JSONB,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telefone VARCHAR(20),
    whatsapp VARCHAR(20),
    endereco TEXT,
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(10),
    empresa_id INTEGER REFERENCES empresas(id),
    data_nascimento DATE,
    observacoes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id SERIAL PRIMARY KEY,
    numero VARCHAR(50) NOT NULL,
    cliente_id INTEGER REFERENCES clientes(id),
    empresa_id INTEGER REFERENCES empresas(id),
    garcom_id INTEGER REFERENCES users(id),
    mesa VARCHAR(10),
    status VARCHAR(50) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmado', 'preparando', 'pronto', 'entregue', 'cancelado')),
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('delivery', 'balcao', 'mesa')),
    itens JSONB NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    taxa_entrega DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    observacoes TEXT,
    endereco_entrega TEXT,
    telefone_contato VARCHAR(20),
    tempo_estimado INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de áreas de entrega
CREATE TABLE IF NOT EXISTS delivery_areas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    empresa_id INTEGER REFERENCES empresas(id),
    coordenadas JSONB,
    taxa_entrega DECIMAL(10,2) NOT NULL,
    tempo_estimado INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de assinaturas
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id),
    plan_id INTEGER REFERENCES plans(id),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
    inicio_vigencia TIMESTAMP NOT NULL,
    fim_vigencia TIMESTAMP,
    valor DECIMAL(10,2) NOT NULL,
    gateway_payment_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela financeira
CREATE TABLE IF NOT EXISTS financeiro (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id),
    pedido_id INTEGER REFERENCES pedidos(id),
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('entrada', 'saida')),
    categoria VARCHAR(100),
    valor DECIMAL(10,2) NOT NULL,
    descricao TEXT,
    data_vencimento DATE,
    data_pagamento DATE,
    status VARCHAR(50) DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'vencido')),
    metodo_pagamento VARCHAR(50),
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir dados iniciais
INSERT INTO plans (nome, preco, limite_pedidos, recursos) VALUES
('Gratuito', 0.00, 50, ARRAY['Menu Digital', 'Pedidos Online']),
('Padrão', 29.90, 200, ARRAY['Menu Digital', 'Pedidos Online', 'WhatsApp', 'Relatórios']),
('Premium', 49.90, 500, ARRAY['Menu Digital', 'Pedidos Online', 'WhatsApp', 'Relatórios', 'Multi-usuário', 'API'])
ON CONFLICT DO NOTHING;

-- Inserir empresa de exemplo
INSERT INTO empresas (nome, email, telefone, whatsapp, endereco, cidade, estado, cep, descricao, subdomain, plan_id) VALUES
('Restaurante Exemplo', 'exemplo@restaurante.com', '(11) 99999-9999', '5511999999999', 'Rua das Flores, 123', 'São Paulo', 'SP', '01234-567', 'Restaurante especializado em comida brasileira', 'restaurante-exemplo', 1)
ON CONFLICT DO NOTHING;

-- Inserir usuário administrador
INSERT INTO users (username, email, password_hash, role, empresa_id) VALUES
('admin', 'exemplo@restaurante.com', '$2b$10$..hash..', 'empresa', 1)
ON CONFLICT DO NOTHING;

-- Inserir categorias de exemplo
INSERT INTO categorias (nome, descricao, empresa_id) VALUES
('Pratos Principais', 'Pratos principais do cardápio', 1),
('Bebidas', 'Bebidas variadas', 1),
('Sobremesas', 'Doces e sobremesas', 1)
ON CONFLICT DO NOTHING;

-- Inserir itens do cardápio
INSERT INTO cardapio (nome, descricao, preco, categoria_id, empresa_id, is_disponivel) VALUES
('Feijoada Completa', 'Feijoada tradicional com acompanhamentos', 35.90, 1, 1, true),
('Picanha Grelhada', 'Picanha grelhada com arroz, feijão e salada', 45.90, 1, 1, true),
('Frango à Parmegiana', 'Frango empanado com molho e queijo', 28.90, 1, 1, true),
('Coca-Cola 350ml', 'Refrigerante Coca-Cola lata', 5.90, 2, 1, true),
('Suco de Laranja', 'Suco natural de laranja', 8.90, 2, 1, true),
('Pudim de Leite', 'Pudim de leite condensado', 12.90, 3, 1, true)
ON CONFLICT DO NOTHING;

-- Inserir clientes de exemplo
INSERT INTO clientes (nome, telefone, whatsapp, empresa_id) VALUES
('João Silva', '(11) 99999-1111', '5511999991111', 1),
('Maria Santos', '(11) 99999-2222', '5511999992222', 1),
('Pedro Oliveira', '(11) 99999-3333', '5511999993333', 1)
ON CONFLICT DO NOTHING;