import TelegramBot from 'node-telegram-bot-api';

const token = '8011590263:AAEg-R_zDS8k7zJFQZVftGqxLETXVx7FZ7M';

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Olá! Como posso te ajudar hoje?');
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text.toLowerCase();

  if (text.includes('aniversário')) {
    bot.sendMessage(chatId, 'Uma boa opção para um aniversário é um look casual elegante: camisa clara, jeans escuro e um tênis limpo.');
  } else if (text.includes('rolê')) {
    bot.sendMessage(chatId, 'Para um rolê, recomendo um look mais casual, despojado e confortável.');
  } else if (text.includes('trabalho')) {  
    bot.sendMessage(chatId, 'Para o trabalho, recomendo um look mais formal e que mostre sua confiança.');
  } else if (!text.startsWith('/start')) {
    bot.sendMessage(chatId, 'Posso te ajudar com looks para diferentes ocasiões. Me conte mais!');
  }
});
