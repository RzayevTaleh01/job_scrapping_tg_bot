# 🤖 Telegram Vacancy Scraper Bot

A **Telegram bot** built with Node.js that scrapes job and internship listings from multiple websites and allows admins to manage and send posts to Telegram channels.

---

## 📌 Description

This bot automates job and internship sharing from platforms like **HelloJob.az** and **Tecrube.az**. It is designed to:

- Scrape job/internship posts (title, link, company, date, description)
- Save posts in **MongoDB**
- Send listings to **Telegram channels** (prod/test)
- Prevent duplicate posts
- Track scraping history
- Restrict bot usage to **admins only**
---

## ⚙️ Technologies Used

- Node.js
- Express.js
- Axios + Cheerio + Puppeteer (for scraping HTML and JavaScript content)
- MongoDB + Mongoose
- node-telegram-bot-api

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/vacancy-scraper-bot.git
cd vacancy-scraper-bot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create `.env` File

Add your environment variables in a `.env` file:

```env
MONGO_URI=your_mongodb_connection_string
TELEGRAM_TOKEN=your_telegram_bot_token
TEST_CHANNEL_USERNAME=@your_test_channel
PROD_CHANNEL_USERNAME=@your_prod_channel
ALLOWED_USERS=your_tg_user_id,your_tg_user_id2
MODEL_NAMES=[{"id":1,"name":"HelloJob.az"},{"id":2,"name":"Tecrube.az"}]
```

### 4. Start the Bot

```bash
node index.js
```

The bot will run on port `3000`.

---

## 💬 Bot Commands (Admin Only)

| Command                   | Description                                                       |
|---------------------------|-------------------------------------------------------------------|
| `/start`                 | Show bot status and statistics for HelloJob & Tecrube.az          |
| `/help`                  | Display available commands                                        |
| `/scrap`                 | Choose which site to scrape from                                  |
| `/scrap 1`               | Scrape HelloJob.az postings                                       |
| `/scrap 2`               | Scrape Tecrube.az postings                                        |
| `/send prod`            | Send the next 10 unsent posts to the production channel           |
| `/send test`            | Send the next 10 unsent posts to the test channel                 |
| `/send prod <postId>`   | Send a specific post by ID to the production channel              |
| `/send test <postId>`   | Send a specific post by ID to the test channel                    |
| `/list`                  | List the 10 most recent scraped posts                             |
| `/log`                   | Show the last 10 sent posts (from both HelloJob & Tecrube.az)     |

---

## 🛠 Customization Options

You can modify the following:

- Add or remove supported scraping sources
- Adjust how many posts are sent with `/send`
- Update message formats per source
- Change channel usernames in `.env`

---

## 🧪 Sample Message

```
📌 Junior Frontend Developer  
🏢 ABC Company  
🕒 2024-05-11  
🔗 https://hellojob.az/vacancy/frontend-xyz
```

```
📌 Təcrübəçi Marketinqçi  
🏢 XYZ Group  
📅 Başlama: 2024-06-01  
📅 Bitmə: 2024-08-30  
🔗 https://tecrube.az/vacancies/view/123
```

---

## 🧑‍💻 Developer

Made with ❤️ by [Taleh Rzayev](https://github.com/rzayevtaleh01)

---

## 📄 License

This project is licensed under the MIT License.
