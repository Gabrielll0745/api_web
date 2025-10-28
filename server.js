const express = require('express');
const jsonfile = require('jsonfile');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = 3000;
const DADOS_PATH = './banco.json';


let clientes = [{ id: 1, nome: "Gabriel Dias", telefone: "51 5558-55555", endereco: "Rua Nereu Batista" }];
let nextClienteId = 2;

let categorias = [{ id: 101, nome: "Hardware" }, { id: 102, nome: "Periféricos" }];
let nextCategoriaId = 103;

let produtos = [{ id: 1001, nome: "RTX 4090", estoque: 15, preco: 12500.00, id_categoria: 101 }];
let nextProdutoId = 1002;

let pedidos = [{ id: 2001, data: "2025-10-27", valor_total: 12500.00, id_cliente: 1 }];
let nextPedidoId = 2002;

let itensPedido = [{ id: 3001, id_pedido: 2001, id_produto: 1001, nome: "RTX 4090", quantidade: 1, preco: 12500.00 }];
let nextItemPedidoId = 3002;


// ROTAS GERAIS
app.get('/', (req, res) => {
  res.json({ message: 'API da Loja funcionando.' });
});

// CLIENTES
app.get('/clientes', (req, res) => { res.json(clientes); });
app.post('/cliente', (req, res) => {
  const novoCliente = { id: nextClienteId++, nome: req.body.nome, telefone: req.body.telefone, endereco: req.body.endereco };
  clientes.push(novoCliente);
  res.status(201).json(novoCliente);
});
app.put('/cliente/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const cliente = clientes.find(c => c.id === id);
  if (!cliente) return res.status(404).json({ message: 'Cliente não encontrado' });
  Object.assign(cliente, req.body);
  res.json(cliente);
});
app.delete('/cliente/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const hasPedidos = pedidos.some(p => p.id_cliente === id);
  if (hasPedidos) return res.status(400).json({ message: 'Erro: Cliente possui pedidos.' });
  clientes = clientes.filter(c => c.id !== id);
  res.json({ message: 'Cliente removido' });
});


// CATEGORIAS
app.get('/categorias', (req, res) => { res.json(categorias); });
app.post('/categoria', (req, res) => {
  const novaCategoria = { id: nextCategoriaId++, nome: req.body.nome };
  categorias.push(novaCategoria);
  res.status(201).json(novaCategoria);
});
app.put('/categoria/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const categoria = categorias.find(c => c.id === id);
  if (!categoria) return res.status(404).json({ message: 'Categoria não encontrada' });
  Object.assign(categoria, req.body);
  res.json(categoria);
});
app.delete('/categoria/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const hasProdutos = produtos.some(p => p.id_categoria === id);
  if (hasProdutos) return res.status(400).json({ message: 'Erro: Categoria possui produtos.' });
  categorias = categorias.filter(c => c.id !== id);
  res.json({ message: 'Categoria removida' });
});


// PRODUTOS
app.get('/produtos', (req, res) => { res.json(produtos); });
app.post('/produto', (req, res) => {
  const id_categoria = parseInt(req.body.id_categoria);
  if (!categorias.find(c => c.id === id_categoria)) return res.status(400).json({ message: 'Erro: Categoria não existe.' });
  const novoProduto = { id: nextProdutoId++, nome: req.body.nome, estoque: parseInt(req.body.estoque), preco: parseFloat(req.body.preco), id_categoria: id_categoria };
  produtos.push(novoProduto);
  res.status(201).json(novoProduto);
});
app.put('/produto/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const produto = produtos.find(p => p.id === id);
  if (!produto) return res.status(404).json({ message: 'Produto não encontrado' });
  Object.assign(produto, req.body);
  res.json(produto);
});
app.delete('/produto/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const isReferenced = itensPedido.some(item => item.id_produto === id);
  if (isReferenced) return res.status(400).json({ message: 'Erro: Produto está em um pedido.' });
  produtos = produtos.filter(p => p.id !== id);
  res.json({ message: 'Produto removido' });
});


// PEDIDOS
app.get('/pedidos', (req, res) => { res.json(pedidos); });
app.post('/pedido', (req, res) => {
  const id_cliente = parseInt(req.body.id_cliente);
  if (!clientes.find(c => c.id === id_cliente)) return res.status(400).json({ message: 'Erro: Cliente não existe.' });
  const novoPedido = { id: nextPedidoId++, data: new Date().toISOString().slice(0, 10), valor_total: parseFloat(req.body.valor_total) || 0.00, id_cliente: id_cliente };
  pedidos.push(novoPedido);
  res.status(201).json(novoPedido);
});
app.put('/pedido/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const pedido = pedidos.find(p => p.id === id);
  if (!pedido) return res.status(404).json({ message: 'Pedido não encontrado' });
  Object.assign(pedido, req.body);
  res.json(pedido);
});
app.delete('/pedido/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const hasItens = itensPedido.some(item => item.id_pedido === id);
  if (hasItens) return res.status(400).json({ message: 'Erro: Pedido possui itens.' });
  pedidos = pedidos.filter(p => p.id !== id);
  res.json({ message: 'Pedido removido' });
});


// ITEM_PEDIDO
app.post('/pedido/:idPedido/item', (req, res) => {
  const id_pedido = parseInt(req.params.idPedido);
  const id_produto = parseInt(req.body.id_produto);
  const quantidade = parseInt(req.body.quantidade);

  const pedido = pedidos.find(p => p.id === id_pedido);
  if (!pedido) return res.status(400).json({ message: 'Erro: Pedido não encontrado.' });

  const produto = produtos.find(p => p.id === id_produto);
  if (!produto) return res.status(400).json({ message: 'Erro: Produto não encontrado.' });

  const novoItem = { id: nextItemPedidoId++, id_pedido: id_pedido, id_produto: id_produto, nome: produto.nome, quantidade: quantidade, preco: produto.preco };
  itensPedido.push(novoItem);

  pedido.valor_total += (novoItem.preco * quantidade);
  produto.estoque -= quantidade;

  res.status(201).json(novoItem);
});
app.delete('/itempedido/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const itemIndex = itensPedido.findIndex(item => item.id === id);
  if (itemIndex === -1) return res.status(404).json({ message: 'Item de Pedido não encontrado' });

  const itemRemovido = itensPedido[itemIndex];
  const pedido = pedidos.find(p => p.id === itemRemovido.id_pedido);
  const produto = produtos.find(p => p.id === itemRemovido.id_produto);

  if (pedido) pedido.valor_total -= (itemRemovido.preco * itemRemovido.quantidade);
  if (produto) produto.estoque += itemRemovido.quantidade;

  itensPedido.splice(itemIndex, 1);
  res.json({ message: 'Item de Pedido removido' });
});


// INICIALIZAÇÃO
app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}`);
});