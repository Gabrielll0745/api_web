const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = 3000;

// dados em memória (simula banco)
const db = {
  clientes: [{ id: 1, nome: "Gabriel Dias", telefone: "51 5558-55555", endereco: "Rua Nereu Batista" }],
  categorias: [{ id: 101, nome: "Hardware" }, { id: 102, nome: "Periféricos" }],
  produtos: [{ id: 1001, nome: "RTX 4090", estoque: 15, preco: 12500.00, id_categoria: 101 }],
  pedidos: [{ id: 2001, data: "2025-10-27", valor_total: 12500.00, id_cliente: 1 }],
  itensPedido: [{ id: 3001, id_pedido: 2001, id_produto: 1001, nome: "RTX 4090", quantidade: 1, preco: 12500.00 }]
};

// IDs
let nextIds = { cliente: 2, categoria: 103, produto: 1002, pedido: 2002, item: 3002 };

// funções utilitárias
const findById = (arr, id) => arr.find(el => el.id === id);
const removeById = (arr, id) => arr.filter(el => el.id !== id);

// rota raiz (status)
app.get('/', (req, res) => res.json({ message: 'API da Loja funcionando com melhorias!' }));

// CLIENTES - lista
app.get('/clientes', (req, res) => res.json(db.clientes));

app.post('/cliente', (req, res) => {
  const { nome, telefone, endereco } = req.body;
  if (!nome || !telefone || !endereco)
    return res.status(400).json({ message: 'Campos obrigatórios: nome, telefone e endereco.' });

  const novo = { id: nextIds.cliente++, nome, telefone, endereco };
  db.clientes.push(novo);
  res.status(201).json(novo);
});

app.put('/cliente/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const cliente = findById(db.clientes, id);
  if (!cliente) return res.status(404).json({ message: 'Cliente não encontrado.' });

  Object.assign(cliente, req.body);
  res.json({ message: 'Cliente atualizado com sucesso.', cliente });
});

app.delete('/cliente/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (db.pedidos.some(p => p.id_cliente === id))
    return res.status(400).json({ message: 'Não é possível excluir: cliente possui pedidos.' });

  db.clientes = removeById(db.clientes, id);
  res.json({ message: 'Cliente removido com sucesso.' });
});

// CATEGORIAS - lista, cria, atualiza, remove
app.get('/categorias', (req, res) => res.json(db.categorias));

app.post('/categoria', (req, res) => {
  const { nome } = req.body;
  if (!nome) return res.status(400).json({ message: 'Campo nome é obrigatório.' });

  const nova = { id: nextIds.categoria++, nome };
  db.categorias.push(nova);
  res.status(201).json(nova);
});

app.put('/categoria/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const categoria = findById(db.categorias, id);
  if (!categoria) return res.status(404).json({ message: 'Categoria não encontrada.' });

  Object.assign(categoria, req.body);
  res.json({ message: 'Categoria atualizada.', categoria });
});

app.delete('/categoria/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (db.produtos.some(p => p.id_categoria === id))
    return res.status(400).json({ message: 'Não é possível excluir: categoria possui produtos.' });

  db.categorias = removeById(db.categorias, id);
  res.json({ message: 'Categoria removida com sucesso.' });
});

// PRODUTOS - lista, cria, atualiza, remove
app.get('/produtos', (req, res) => res.json(db.produtos));

app.post('/produto', (req, res) => {
  const { nome, estoque, preco, id_categoria } = req.body;
  if (!nome || !estoque || !preco || !id_categoria)
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });

  if (!findById(db.categorias, parseInt(id_categoria)))
    return res.status(400).json({ message: 'Categoria não existe.' });

  const novo = {
    id: nextIds.produto++,
    nome,
    estoque: parseInt(estoque),
    preco: parseFloat(preco),
    id_categoria: parseInt(id_categoria)
  };
  db.produtos.push(novo);
  res.status(201).json(novo);
});

app.put('/produto/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const produto = findById(db.produtos, id);
  if (!produto) return res.status(404).json({ message: 'Produto não encontrado.' });

  Object.assign(produto, req.body);
  res.json({ message: 'Produto atualizado.', produto });
});

app.delete('/produto/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (db.itensPedido.some(item => item.id_produto === id))
    return res.status(400).json({ message: 'Produto está associado a um pedido.' });

  db.produtos = removeById(db.produtos, id);
  res.json({ message: 'Produto removido.' });
});

// PEDIDOS - lista, cria, atualiza, remove
app.get('/pedidos', (req, res) => res.json(db.pedidos));

app.post('/pedido', (req, res) => {
  const { id_cliente } = req.body;
  if (!id_cliente) return res.status(400).json({ message: 'Campo id_cliente é obrigatório.' });
  if (!findById(db.clientes, parseInt(id_cliente)))
    return res.status(400).json({ message: 'Cliente não encontrado.' });

  const novo = {
    id: nextIds.pedido++,
    data: new Date().toISOString().slice(0, 10),
    valor_total: 0,
    id_cliente: parseInt(id_cliente)
  };
  db.pedidos.push(novo);
  res.status(201).json(novo);
});

app.put('/pedido/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const pedido = findById(db.pedidos, id);
  if (!pedido) return res.status(404).json({ message: 'Pedido não encontrado.' });

  Object.assign(pedido, req.body);
  res.json({ message: 'Pedido atualizado.', pedido });
});

app.delete('/pedido/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (db.itensPedido.some(i => i.id_pedido === id))
    return res.status(400).json({ message: 'Pedido possui itens e não pode ser excluído.' });

  db.pedidos = removeById(db.pedidos, id);
  res.json({ message: 'Pedido removido com sucesso.' });
});

// ITENS DO PEDIDO - cria e remove item
app.post('/pedido/:idPedido/item', (req, res) => {
  const idPedido = parseInt(req.params.idPedido);
  const { id_produto, quantidade } = req.body;

  const pedido = findById(db.pedidos, idPedido);
  const produto = findById(db.produtos, parseInt(id_produto));

  if (!pedido) return res.status(400).json({ message: 'Pedido não encontrado.' });
  if (!produto) return res.status(400).json({ message: 'Produto não encontrado.' });
  if (produto.estoque < quantidade)
    return res.status(400).json({ message: 'Estoque insuficiente.' });

  const novoItem = {
    id: nextIds.item++,
    id_pedido: idPedido,
    id_produto: produto.id,
    nome: produto.nome,
    quantidade: parseInt(quantidade),
    preco: produto.preco
  };

  db.itensPedido.push(novoItem);
  produto.estoque -= novoItem.quantidade;
  pedido.valor_total += novoItem.preco * novoItem.quantidade;

  res.status(201).json(novoItem);
});

app.delete('/itempedido/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const item = findById(db.itensPedido, id);
  if (!item) return res.status(404).json({ message: 'Item de pedido não encontrado.' });

  const pedido = findById(db.pedidos, item.id_pedido);
  const produto = findById(db.produtos, item.id_produto);

  if (pedido) pedido.valor_total -= item.preco * item.quantidade;
  if (produto) produto.estoque += item.quantidade;

  db.itensPedido = removeById(db.itensPedido, id);
  res.json({ message: 'Item removido com sucesso.' });
});

app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
