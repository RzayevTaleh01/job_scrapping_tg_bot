module.exports = function (bot, isAllowed) {
    bot.onText(/\/help/, (msg) => {
        const chatId = msg.chat.id;
        if (!isAllowed(chatId)) return;

        const helpText = `🆘 *Əmrlər siyahısı*:

🔧 *Ümumi əmrlər*
\`/start\` - Botun statusunu göstər  
\`/help\` - Komandaların siyahısı  
\`/scrap\` - Scraping üçün model seç  
\`/scrap <model id>\` - Modelə görə scraping et  

📤 *Vakansiya göndərmə*
\`/send\` - Vakansiya göndərmək üçün model seç  
\`/send prod <model id>\` - Növbəti 10 vakansiyanı modelə uyğun prod kanalına göndər  
\`/send test <model id>\` - Növbəti 10 vakansiyanı modelə uyğun test kanalına göndər  
\`/send prod <model id> <id>\` - ID üzrə bir vakansiyanı modelə uyğun prod kanalına göndər  
\`/send test <model id> <id>\` - ID üzrə bir vakansiyanı modelə uyğun test kanalına göndər  

📋 *Vakansiya siyahısı*
\`/list <model id>\` - Modelə uyğun bazadakı vakansiyalar  

📜 *Proda göndərilmişlər loglar*
\`/log <model id>\` - Modelə uyğun proda göndərilmiş vakansiyalar`;

        bot.sendMessage(chatId, helpText, { parse_mode: 'Markdown' });
    });
};
