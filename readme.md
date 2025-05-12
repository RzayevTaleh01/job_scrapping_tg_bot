
# 🤖 HelloJob Telegram Scraper Bot

A **Telegram bot** built with Node.js that scrapes job listings from [HelloJob.az](https://hellojob.az) and allows admins to manage and send posts to a Telegram channel.

---

## 📌 Description

This bot automates job sharing from the **"Technology → Programming"** category of HelloJob.az. It is designed to:

- Scrape job posts (title, link, company, date)
- Save posts in **MongoDB**
- Send job listings in batches to a **Telegram channel**
- Avoid posting duplicates
- Restrict commands to **admins only**

---

## ⚙️ Technologies Used

- Node.js  
- Express.js  
- Axios + Cheerio (for web scraping)  
- MongoDB + Mongoose  
- node-telegram-bot-api  

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/hellojob-telegram-bot.git
cd hellojob-telegram-bot
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
TEST_CHANNEL_USERNAME=@your_tg_channel_test
PROD_CHANNEL_USERNAME=@your_tg_channel_prod
ALLOWED_USERS=your_tg_user_id,your_tg_user_id2
JOB_URL=https://www.hellojob.az/is-elanlari/texnologiya/proqramlasdirma
CHANNEL_USERNAME=@your_channel_username
```

### 4. Start the Bot

```bash
node index.js
```

The bot will run on port `3000`.

---

## 💬 Bot Commands (Admin Only)

| Command             | Description                                  |
|---------------------|----------------------------------------------|
| `/start`            | Show bot status and statistics               |
| `/help`             | Display available commands                   |
| `/scrap`            | Scrape and store the latest job posts        |
| `/send prod`             | Send the next 10 unsent jobs to the prod channel  |
| `/send test`             | Send the next 10 unsent jobs to the test channel  |
| `/send prod <jobId>`     | Send a specific job post by its ID to the prod channel           |
| `/send test <jobId>`     | Send a specific job post by its ID to the test channel           |
| `/list`             | List the 10 most recent scraped jobs         |
| `/log`              | Show the last 10 sent jobs                   |

---

## 🛠 Customization Options

You can modify the following:

- Scraping source URL or category
- Number of jobs per `/send`
- Message format for Telegram
- Channel name in `.env` file

---

## 🧪 Sample Message

```
📌 Junior Frontend Developer  
🏢 ABC Company  
🕒 2024-05-11  
🔗 https://hellojob.az/vacancy/frontend-xyz
```

---

## 🧑‍💻 Developer

Made with ❤️ by [Taleh Rzayev](https://github.com/yourusername)

---

## 📄 License

This project is licensed under the MIT License.
