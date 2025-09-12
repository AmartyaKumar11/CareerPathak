# CareerPathak

**Your Career Guidance Platform for Jammu & Kashmir Students**

CareerPathak is a comprehensive web application designed to help students in Jammu & Kashmir discover their ideal career paths through personalized guidance, college recommendations, and localized content.

## 🌟 Features

- **🎯 Career Aptitude Assessment**: Interactive quiz to discover ideal career streams
- **🏫 College Explorer**: Comprehensive database of J&K colleges with detailed information
- **👥 Alumni Success Stories**: Real success stories from J&K students
- **📅 Academic Timeline**: Important dates, deadlines, and entrance exam schedules
- **🌍 Multi-language Support**: Available in English, Hindi, Urdu, Kashmiri, and Dogri
- **🔐 Google OAuth Authentication**: Secure sign-in with Google accounts
- **💰 Cost Calculator**: Compare government vs private college expenses

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Context + TanStack Query
- **Routing**: React Router DOM
- **Authentication**: Google OAuth 2.0
- **Internationalization**: i18next

## 📋 Prerequisites

- Node.js 16+ or Bun
- Google Cloud Console account (for OAuth setup)

## 🛠️ Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/AmartyaKumar11/CareerPathak.git
cd CareerPathak
```

### 2. Install Dependencies
```bash
npm install
# or
bun install
```

### 3. Environment Configuration
1. Copy the environment example file:
   ```bash
   cp .env.example .env
   ```

2. Set up Google OAuth:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing project
   - Enable "Google Identity Services API"
   - Create OAuth 2.0 Client ID credentials
   - Add `http://localhost:8080` to authorized origins
   - Copy your client ID to `.env` file

### 4. Run Development Server
```bash
npm run dev
# or
bun dev
```

The application will be available at `http://localhost:8080`

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   └── ui/             # shadcn/ui components
├── contexts/           # React contexts
├── data/               # Static data files
├── hooks/              # Custom React hooks
├── i18n/              # Internationalization
├── lib/               # Utility functions
└── pages/             # Route components
```

## 🌐 Supported Languages

- English (Default)
- हिंदी (Hindi)
- اردو (Urdu)
- کٲشُر (Kashmiri)
- डोगरी (Dogri)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎯 Target Audience

This platform is specifically designed for:
- High school students (Classes 10-12) in Jammu & Kashmir
- College students seeking career guidance
- Parents and educators supporting student career decisions

## 🌍 Mission

Empowering J&K students with personalized career guidance and connecting local talent with national and global opportunities while preserving regional languages and cultural identity.

---

**Made with ❤️ for the students of Jammu & Kashmir**
