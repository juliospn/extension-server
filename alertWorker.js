const WebSocket = require('ws');
const mongoose = require('mongoose');
const Alert = require('./models/alert.model');

// Conecte-se ao banco de dados MongoDB
mongoose.connect('mongodb://localhost/alerts', { useNewUrlParser: true, useUnifiedTopology: true });

// Crie uma conexão WebSocket com o feed de dados da Binance
const wst = new WebSocket('wss://fstream.binance.com/ws/btcusdt@markPrice@1s');

// Adicione um evento de mensagem à conexão WebSocket
wst.on('message', async (data) => {
  // Analise a mensagem recebida
  const parsedData = JSON.parse(data);

  // Obtenha o funding rate do par BTCUSDT
  const fundingRate = parsedData.r;

  // Busque no banco de dados por alertas que correspondam às condições
  const alerts = await Alert.find({
    asset: 'BTC',
    metric: 'Funding Rate',
    exchange: 'Binance',
    condition: 'greater than',
    threshold: fundingRate,
  });

  // Envie notificações para cada canal especificado nas configurações do alerta
  alerts.forEach((alert) => {
    alert.channels.forEach((channel) => {
      // Lógica para enviar notificações para cada canal
      console.log(`Enviando notificação para o canal ${channel}`);
    });
  });
});
