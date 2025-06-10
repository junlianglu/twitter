# 🐦 Twitter Clone

A full-featured Twitter-like platform built with React, GraphQL, Node.js, and AWS.

## 🚀 Features
- Post, like, quote, reply, repost
- AI image generation (OpenAI GPT)
- JWT authentication
- Media uploads (AWS S3)

## 🛠️ Tech Stack
React 18 · Apollo Client · Node.js · MongoDB · AWS · GraphQL · OpenAI API

## ⚙️ Setup

```bash
git clone https://github.com/junlianglu/twitter.git
cd twitter

# 1️⃣  Backend
cd backend
cp .env.example .env           # add your keys
npm install
npm start &                    # starts on http://localhost:4000
cd ..

# 2️⃣  Frontend
cd frontend
cp .env.example .env           # ensure REACT_APP_API_URL points to your backend
npm install
npm start                    # React server on http://localhost:3000
```

## 🌐 Live Demo

⚠️ Deployment available upon request to prevent abuse and stay within AWS free tier limits.

Feel free to reach out via [LinkedIn](https://linkedin.com/in/junliang-lu) or [email](mailto:junliang.lu.dev@gmail.com) for access.
