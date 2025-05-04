# 🛡️ Fullstack Auth with Passport.js, Google OAuth & JWT (Email/Password)

This project implements a robust authentication system using:

- ✅ **Passport.js** with **Google OAuth 2.0**
- 🔐 **JWT authentication** using HTTP-only cookies (for email/password login)
- 🗃️ **Prisma ORM** for database interaction
- 🍪 **Express sessions** for social login session management

---

## 📦 Tech Stack

- Node.js
- Express.js
- Passport.js (Google OAuth 2.0 Strategy)
- Prisma + PostgreSQL (or your DB of choice)
- JSON Web Tokens (JWT)
- Cookie-parser + Express-session

---

## ✨ Features

- Google Login via OAuth 2.0
- Email + Password authentication with JWT cookies
- Prisma ORM for user model and DB access
- Session handling for Google auth
- Token validation middleware
- Secure HTTP-only cookies
- Auto-creation of users from Google profile (with random password)
- Environment-based config using `.env`

---

## 📁 Folder Structure

```
project-root/
│
├── controllers/        # Auth logic
├── middlewares/        # Auth middleware (JWT, sessions)
├── routes/             # All routes (Google, login, register, etc.)
├── prisma/             # Prisma schema and client
├── utils/              # Helper functions (e.g., token, random password)
├── .env
├── app.js / index.js
└── README.md
```

---

## 🛠️ Installation

```bash
git clone https://github.com/your-username/auth-passport-jwt.git
cd auth-passport-jwt
npm install
```

---

## ⚙️ Environment Variables

Create a `.env` file and add:

```env
PORT=8000
SESSION_SECRET=your_session_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:8000/auth/google/callback

JWT_SECRET=your_jwt_secret
```

---

## 🧠 How It Works

### Google OAuth 2.0 (via Passport.js)

- Users click "Login with Google"
- Passport authenticates and returns user profile
- If the user doesn't exist in DB, it creates one
- Session is managed via `express-session`

### Email & Password Login (JWT + Cookies)

- User logs in using email/password
- JWT token is signed and stored in a secure HTTP-only cookie
- Protected routes are guarded using JWT verification middleware

---

## 🧪 Example Routes

### Register

```http
POST /auth/register
```
```json
{
  "name": "Vinay",
  "email": "vinay@example.com",
  "password": "securepassword"
}
```

### Login

```http
POST /auth/login
```
```json
{
  "email": "vinay@example.com",
  "password": "securepassword"
}
```

### Google Auth

```http
GET /auth/google
```

### Google Auth Callback

```http
GET /auth/google/callback
```

---

## 🧾 Prisma Schema Example

```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String
  googleId  String?  @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Run migration:

```bash
npx prisma migrate dev --name init
```

---

## 🔐 Middleware

- `verifyToken.js`: JWT token check for protected routes
- `isAuthenticated.js`: Checks for active session for Google login

---

## 🧹 TODO / Improvements

- Refresh token flow for JWT
- Logout and cookie clearing
- Add frontend UI
- Rate limiting & brute force protection

---

## 👨‍💻 Author

Made with ❤️ by [Vinay Sandhu](https://www.linkedin.com/in/vinay316/)

---

## 📄 License

MIT