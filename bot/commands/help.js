module.exports = function (bot, isAllowed) {
    bot.onText(/\/help/, (msg) => {
        const chatId = msg.chat.id;
        if (!isAllowed(chatId)) return;

        const helpText = `🆘 *Əmrlər siyahısı*

🔧 *Ümumi əmrlər*
\`/start\` – Botun statusunu göstər  
\`/help\` – Komandaların siyahısı  
\`/scrap\` – Scraping üçün model seç  
\`/scrap <model id>\` – Modelə görə scraping et  

📤 *Vakansiya göndərmə*
\`/send\` – Vakansiya göndərmək üçün model seç  
\`/send prod <model id>\` – Növbəti 10 vakansiyanı *prod* kanalına göndər  
\`/send test <model id>\` – Növbəti 10 vakansiyanı *test* kanalına göndər  
\`/send prod <model id> <id>\` – Seçilmiş vakansiyanı *prod* kanalına göndər  
\`/send test <model id> <id>\` – Seçilmiş vakansiyanı *test* kanalına göndər  

📋 *Vakansiya siyahısı*
\`/list\` – Model və status seçimi üçün təlimat  
\`/list <model id>\` – Modelə uyğun vakansiyalar (bütün statuslar)  
\`/list <model id> <status>\` – Modelə uyğun və statusa görə vakansiyalar  
💡 *Misal:* \`/list 1 pending\`

📜 *Loglar*
\`/log <model id>\` – Modelə uyğun proda göndərilmiş vakansiyalar`;

        bot.sendMessage(chatId, helpText, { parse_mode: 'Markdown' });
    });
};
