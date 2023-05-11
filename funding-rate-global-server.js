const express = require('express');
const app = express();
const path = require('path');

// Parte do código que cria as portas para os arquivos/informações

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

app.get('/funding-rate', async (req, res) => {
    try {
        const fundingRate = await getFundingRate();
        res.json(fundingRate);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/global-funding-rate', async (req, res) => {
    try {
        const volume = await getVolume();
        const globalFundingRate = await main(volume);
        res.json(globalFundingRate.toFixed(4));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/volume', async (req, res) => {
    try {
        const volume = await getVolume();
        res.json(volume);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/funding-rate-data-json', async (req, res) => {
    try {
        const fundingRateData = [];
        fs.createReadStream('funding-rate-data.csv')
            .pipe(csv())
            .on('data', (row) => {
                fundingRateData.push(row);
            })
            .on('end', () => {
                res.json(fundingRateData);
            });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

// codigo volume

const https = require('https');

const exchanges = [
    { name: 'Deribit', url: 'https://www.deribit.com/api/v2/public/get_book_summary_by_instrument?instrument_name=BTC-PERPETUAL' },
    { name: 'Bitget', url: 'https://api.bitget.com/api/mix/v1/market/ticker?symbol=BTCUSDT_UMCBL' },
    { name: 'Bybit', url: 'https://api.bybit.com/v2/public/tickers?symbol=BTCUSDT' },
    { name: 'BybitUSD', url: 'https://api.bybit.com/v2/public/tickers?symbol=BTCUSD' },
    { name: 'Bitmex', url: 'https://www.bitmex.com/api/v1/instrument?symbol=XBTUSD' },
    { name: 'OKX', url: 'https://www.okx.com/api/v5/market/ticker?instId=BTC-USDT-SWAP' },
    { name: 'OKXUSD', url: 'https://www.okx.com/api/v5/market/ticker?instId=BTC-USD-SWAP' },
    { name: 'Huobi', url: 'https://api.hbdm.com/linear-swap-ex/market/detail/merged?contract_code=BTC-USDT' },
    { name: 'BinanceUSDT', url: 'https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT' },
    { name: 'BinanceUSD', url: 'https://www.binance.com/dapi/v1/ticker/24hr?symbol=BTCUSD_PERP' }
];

function getVolume() {
    const volumeObj = {};
    for (const exchange of exchanges) {
        https.get(exchange.url, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                const jsonData = JSON.parse(data);
                let btcVolume = 0;

                switch (exchange.name) {
                    case 'Deribit':
                        btcVolume = jsonData && jsonData.result && jsonData.result[0] ? jsonData.result[0].volume_usd : 0;
                        break;
                    case 'Bitget':
                        btcVolume = jsonData.data.quoteVolume;
                        break;
                    case 'Bybit':
                        btcVolume = jsonData.result[0].turnover_24h;
                        break;
                    case 'BybitUSD':
                        btcVolume = jsonData.result[0].volume_24h;
                        break;
                    case 'Bitmex':
                        btcVolume = jsonData[0].volume24h;
                        break;
                    case 'OKX':
                        btcVolume = jsonData.data[0].volCcy24h;
                        const btcPrice = parseFloat(jsonData.data[0].last);
                        btcVolume *= btcPrice;
                        break;
                    case 'OKXUSD':
                        btcVolume = jsonData.data[0].vol24h;
                        break;
                    case 'Huobi':
                        btcVolume = jsonData.tick.trade_turnover;
                        break;
                    case 'BinanceUSDT':
                        btcVolume = jsonData.quoteVolume;
                        break;
                    case 'BinanceUSD':
                        btcVolume = jsonData[0].volume;
                        break;
                }
                volumeObj[exchange.name] = Math.trunc(btcVolume);
                // console.log(`${exchange.name}: $${Math.trunc(btcVolume)}`);
                // console.log(volumeObj)
            });

        }).on('error', (err) => {
            console.error(`Error: ${err.message}`);
        });
    }
    return volumeObj;
}

getVolume();

// codigo funding rate------------------------------------

const exchangesF = [
    { name: 'Deribit', url: 'https://www.deribit.com/api/v2/public/get_funding_chart_data?instrument_name=BTC-PERPETUAL&length=8h' },
    { name: 'Bitget', url: 'https://api.bitget.com/api/mix/v1/market/current-fundRate?symbol=BTCUSDT_UMCBL' },
    { name: 'Bybit', url: 'https://api.bybit.com/v2/public/tickers?symbol=BTCUSDT' },
    { name: 'BybitUSD', url: 'https://api.bybit.com/v2/public/tickers?symbol=BTCUSD' },
    { name: 'Bitmex', url: 'https://www.bitmex.com/api/v1/instrument?symbol=XBTUSD' },
    { name: 'OKX', url: 'https://www.okx.com/api/v5/public/funding-rate?instId=BTC-USDT-SWAP' },
    { name: 'OKXUSD', url: 'https://www.okx.com/api/v5/public/funding-rate?instId=BTC-USD-SWAP' },
    { name: 'Huobi', url: 'https://api.hbdm.com/linear-swap-api/v1/swap_funding_rate?contract_code=BTC-USDT' },
    { name: 'BinanceUSDT', url: 'https://www.binance.com/fapi/v1/premiumIndex?symbol=BTCUSDT' },
    { name: 'BinanceUSD', url: 'https://www.binance.com/dapi/v1/premiumIndex?symbol=BTCUSD_PERP' }
];

async function getFundingRate() {
    const fundingRate = {};
    const promises = [];

    for (const exchange of exchangesF) {
        const promise = new Promise((resolve, reject) => {
            https.get(exchange.url, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        const jsonData = JSON.parse(data);
                        let rate = 0;

                        switch (exchange.name) {
                            case 'Deribit':
                                rate = parseFloat(JSON.parse(data).result.interest_8h * 100).toFixed(4);
                                break;
                            case 'Bitget':
                                rate = parseFloat(JSON.parse(data).data.fundingRate * 100).toFixed(4);
                                break;
                            case 'Bybit':
                                rate = parseFloat(JSON.parse(data).result[0].funding_rate * 100).toFixed(4);
                                break;
                            case 'BybitUSD':
                                rate = parseFloat(JSON.parse(data).result[0].funding_rate * 100).toFixed(4);
                                break;
                            case 'Bitmex':
                                rate = parseFloat(JSON.parse(data)[0].fundingRate * 100).toFixed(4);
                                break;
                            case 'OKX':
                                rate = parseFloat(JSON.parse(data).data[0].fundingRate * 100).toFixed(4);
                                break;
                            case 'OKXUSD':
                                rate = parseFloat(JSON.parse(data).data[0].fundingRate * 100).toFixed(4);
                                break;
                            case 'Huobi':
                                rate = parseFloat(JSON.parse(data).data.funding_rate * 100).toFixed(4);
                                break;
                            case 'BinanceUSDT':
                                rate = parseFloat(JSON.parse(data).lastFundingRate * 100).toFixed(4);
                                break;
                            case 'BinanceUSD':
                                rate = parseFloat(JSON.parse(data)[0].lastFundingRate * 100).toFixed(4);
                                break;
                        }
                        fundingRate[exchange.name] = rate;
                        resolve();
                    } catch (err) {
                        console.error(`Error: ${err.message}`);
                        reject(err);
                    }
                });
            }).on('error', (err) => {
                console.error(`Error: ${err.message}`);
                reject(err);
            });
        });

        promises.push(promise);
    }

    await Promise.all(promises);

    return fundingRate;
}

getFundingRate();

// código funding rate global 

async function main() {
    let volume, fundingRate;
  
    do {
      volume = await getVolume();
      fundingRate = await getFundingRate();
    } while (Object.keys(fundingRate).length !== Object.keys(volume).length);
  
    let totalVolume = 0;
    let fundingRateValues = {
      Deribit: 0,
      Bitget: 0,
      Bybit: 0,
      BybitUSD: 0,
      Bitmex: 0,
      OKX: 0,
      OKXUSD: 0,
      Huobi: 0,
      BinanceUSDT: 0,
      BinanceUSD: 0
    };
  
    for (const exchange in volume) {
      const exchangeVolume = volume[exchange];
      const exchangeFundingRate = fundingRate[exchange];
  
      totalVolume += exchangeVolume;
  
      if (exchangeFundingRate !== undefined) {
        const fundingRateValue = exchangeFundingRate * exchangeVolume;
        fundingRateValues[exchange] = fundingRateValue;
      } else {
        console.log(`Exchange ${exchange} não possui taxa de financiamento.`);
      }
    }
  
    console.log('fundingRateValues:', fundingRateValues);
  
    const totalFundingRate = Object.values(fundingRateValues).reduce((acc, value) => acc + value, 0);
    console.log((totalFundingRate / totalVolume).toFixed(5));
  
    if (totalVolume === 0) {
      return 0;
    }
  
    if (Object.keys(fundingRateValues).length !== Object.keys(volume).length) {
      console.log('Erro: nem todos os valores de "exchangeFundingRate * exchangeVolume" foram incluídos no cálculo de totalFundingRate.');
      // Você pode adicionar mais lógica aqui, se necessário
    }
  
    return totalFundingRate / totalVolume;
  }
  

main().then(globalFundingRate => {
    console.log(`Global funding rate: ${globalFundingRate.toFixed(5)}%`);
}).catch(error => {
    console.error(error);
});

// código para salvar informações =========================================

const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csv = require('csv-parser');
const fs = require('fs');
const moment = require('moment');

const csvWriter = createCsvWriter({
    path: 'funding-rate-data.csv',
    header: [
        { id: 'timestamp', title: 'Timestamp' },
        { id: 'globalFundingRate', title: 'Global Funding Rate' },
    ],
    fieldDelimiter: ';'
});

// Intervalo de tempo para salvar as informações do funding rate
setInterval(() => {
    main().then(globalFundingRate => {
        console.log(`Global funding rate: ${globalFundingRate.toFixed(5)}%`);

        // Adiciona os novos dados ao arquivo CSV
        const fundingRateData = `${moment(new Date()).format('MMMM Do YYYY, h:mm:ss a')};${globalFundingRate.toFixed(5)}\n`;

        // Verifica se os novos dados já existem no arquivo CSV
        const existingData = fs.readFileSync('funding-rate-data.csv', 'utf8');
        if (existingData.includes(fundingRateData)) {
            return;
        }

        // Escreve o cabeçalho no arquivo CSV, se o arquivo ainda não existir
        if (existingData.trim() === '') {
            const header = 'Timestamp;Global Funding Rate\n';
            fs.appendFileSync('funding-rate-data.csv', header);
        }

        // Adiciona os novos dados ao arquivo CSV
        fs.appendFileSync('funding-rate-data.csv', fundingRateData);

        console.log('Dados de funding rate salvos com sucesso!');
    }).catch(error => {
        console.error(error);
    });
}, 30 * 60 * 1000); // intervalo de 30 minutos