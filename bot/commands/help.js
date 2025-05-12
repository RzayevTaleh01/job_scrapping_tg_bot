module.exports = function (bot, isAllowed) {
    bot.onText(/\/help/, (msg) => {
        const chatId = msg.chat.id;
        if (!isAllowed(chatId)) return;

        const helpText = `🆘 *Əmrlər siyahısı*:

  /start - Botun statusu
  /help - Komandaların siyahısı
  /scrap - Saytdan vakansiya yığ
  /send prod - prod kanalına 10 vakansiya göndər
  /send test - test kanalına 10 vakansiya göndər
  /send prod <id> - prod kanalına bir vakansiya göndər
  /send test <id> - test kanalına bir vakansiya göndər
  /list - Son 10 vakansiyanı göstər
  /log - Son 10 göndərilmiş vakansiyanı göstər`;

        bot.sendMessage(chatId, helpText, { parse_mode: 'Markdown' });
    });
};
