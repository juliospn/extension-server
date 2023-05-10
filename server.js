const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Alert = require('./models/alert.model');

// Conecte-se ao banco de dados MongoDB
mongoose.connect('mongodb://localhost/alerts', { useNewUrlParser: true, useUnifiedTopology: true });

// Defina o esquema para as configurações de alerta
const alertSchema = new mongoose.Schema({
  asset: String,
  metric: String,
  exchange: String,
  condition: String,
  threshold: Number,
  type: String,
  cool_down: String,
  channels: [String],
  note: String,
});

// Defina o modelo para as configurações de alerta
const Alert = mongoose.model('Alert', alertSchema);

// Crie um aplicativo Express
const app = express();

// Use o middleware body-parser para analisar o corpo das solicitações
app.use(bodyParser.json());

// Defina uma rota para adicionar uma nova configuração de alerta
app.post('/alerts', async (req, res) => {
  try {
    // Crie uma nova instância do modelo Alert com os dados enviados pelo formulário
    const alert = new Alert({
      asset: req.body.asset,
      metric: req.body.metric,
      exchange: req.body.exchange,
      condition: req.body.condition,
      threshold: req.body.threshold,
      type: req.body.type,
      cool_down: req.body.cool_down,
      channels: req.body.channels,
      note: req.body.note,
    });

    // Salve a nova configuração de alerta no banco de dados
    await alert.save();

    // Envie uma resposta de sucesso para a solicitação AJAX
    res.status(200).json({ message: 'Alert created successfully' });
  } catch (error) {
    // Envie uma resposta de erro para a solicitação AJAX
    res.status(500).json({ message: 'Alert could not be created' });
  }
});

// Inicie o servidor na porta 3000
app.listen(3000, () => console.log('Server started on port 3000'));
