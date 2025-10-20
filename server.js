// importando o express 
import express from 'express'
const app = express()
const porta = 3000
// Faz o Express entender dados enviados no formato JSON
app.use(express.json())
// un array de objt de cliente 
let clientes = [
  { id: 1, nome: "Gabriel Dias", telefone: "51 5558-55555", endereco: "Rua Nereu Batista" }
]
// ID do próximo cliente automaticamente
let nextId = 2

app.get('/', (req, res) => {
  res.json({ message: 'API de Cliente funcionando com sucesso!' })
})
// retorna todos o nosso cliente 
app.get('/clientes', (req, res) => {
  res.json(clientes)
})
// criar um cliente novo 
app.post('/cliente', (req, res) => {
  const novoCliente = {
    id: nextId++,
    nome: req.body.nome,
    telefone: req.body.telefone,
    endereco: req.body.endereco
  }
  clientes.push(novoCliente)
  res.status(201).json(novoCliente) // indicando que a requisição POST foi bem-sucedida
})
// atualiza os dados de um cliente existente
app.put('/cliente/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const cliente = clientes.find(c => c.id === id)
  if (!cliente) return res.status(404).json({ message: 'Cliente não encontrado' })
  cliente.nome = req.body.nome
  cliente.telefone = req.body.telefone
  cliente.endereco = req.body.endereco
  res.json(cliente)
})

app.delete('/cliente/:id', (req, res) => {
  const id = parseInt(req.params.id)
  clientes = clientes.filter(c => c.id !== id)
  res.json({ message: 'Cliente removido com sucesso' })
})

app.listen(porta, () => {
  console.log(`API rodando em http://localhost:${porta}`)
})
