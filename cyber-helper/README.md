# 🧠 Cyber Helper

Cyber Helper is an AI-powered troubleshooting assistant designed for developers and cybersecurity learners. It takes error codes and queries, forwards them to multiple AI models (OpenAI, Claude, Groq, Gemini), and returns summarized solutions.

---

## 🚀 Features

- Error code analysis by multiple AI models.
- Summarized response for quick understanding.
- History logging using AWS DynamoDB.
- React + Bootstrap frontend.
- AWS Lambda & API Gateway backend.

---

## 💻 Tech Stack

- React (Frontend)
- Bootstrap (UI Framework)
- AWS Lambda (Backend Functions)
- AWS DynamoDB (Data Storage)
- Multiple AI API integrations (OpenAI, Anthropic, Groq, Gemini)

---

## 🧑‍💻 Getting Started

1. Clone the repository:
    ```bash
    git clone https://github.com/YourUsername/cyber-helper.git
    cd cyber-helper
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Create a `.env` file using the `.env.example` template:
    ```bash
    cp .env.example .env
    ```
    Fill in your own API keys and AWS credentials.

4. Run the development server:
    ```bash
    npm start
    ```

---

## 📦 Deployment

This project is built to be deployed on:
- AWS Amplify (recommended for React frontends)
- S3 + CloudFront (if using static hosting)

---

## ⚠️ Security Notice

Never commit your `.env` file or AWS credentials to version control.  
Always use `.gitignore` to protect sensitive files.

---

## 📄 License

MIT License.

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss your proposed changes.

