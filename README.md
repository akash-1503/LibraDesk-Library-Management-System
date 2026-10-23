# 📚 LibraDesk — Library Management System

LibraDesk is a web-based Library Management System designed to simplify book inventory management, library member records, and book issue and return operations. It provides a dashboard for tracking library activity and monitoring book availability.

## ✨ Features

### 📊 Dashboard
- Overview of total books, total members, issued books, and overdue books.
- Recent book transactions.
- Popular books and borrowing activity.
- Live statistics fetched from the backend API.

### 📖 Book Management
- Add new books to the library.
- View the available book collection.
- Update book details.
- Delete book records.
- Track total and available copies.

### 👥 Member Management
- Register library members.
- View member information.
- Update member details.
- Manage member status.
- Maintain member records.

### 🔄 Transaction Management
- Issue books to registered members.
- Record issue dates and due dates.
- Return issued books.
- Track issued and returned transactions.
- Monitor overdue books.

## 🛠️ Tech Stack

**Frontend**
- Next.js (App Router)
- React
- JavaScript (JSX)
- Tailwind CSS
- Lucide React

**Backend**
- Node.js
- Express.js
- Mongoose
- REST API

**Database**
- MongoDB Atlas

**Development Tools**
- Visual Studio Code
- Git and GitHub
- Postman or Thunder Client (API testing)

## 📁 Project Structure

```text
Libradesk/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.jsx
│   │   │   ├── books/
│   │   │   ├── members/
│   │   │   └── transactions/
│   │   ├── components/
│   │   │   └── dashboard/
│   │   │       └── StatCard.jsx
│   │   └── lib/
│   │       ├── api.js
│   │       └── mockData.js
│   ├── .env.local
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   ├── models/
│   │   └── index.js
│   ├── routes/
│   ├── .env
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md
```

*Note: The structure above represents the expected organization. Keep the actual filenames and folders in your repository if they differ.*

## ⚙️ Prerequisites

Install the following before running the project:

- [Node.js](https://nodejs.org/) — preferably a version supported by your installed Next.js release.
- npm — included with Node.js.
- A MongoDB Atlas account, or another supported MongoDB deployment.
- Git (optional, for cloning the repository).

Check your installations:

```bash
node -v
npm -v
```

## 🚀 Getting Started

### 1. Clone the repository

If you are starting from GitHub:

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd Libradesk
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your actual repository URL.

If you already have the project on your computer, open its existing root directory instead.

### 2. Configure MongoDB Atlas

1. Sign in to [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create or select a database deployment.
3. Create a database user with appropriate permissions.
4. Configure your network access rules.
5. Copy the MongoDB connection string.
6. Replace the username, password, and database name in the connection string as required.

Use a database name such as `libradesk`.

**Security:** Never commit your MongoDB password or connection string to GitHub.

### 3. Configure the backend environment

Create or update `backend/.env`:

```env
PORT=5000
CLIENT_URL=http://localhost:3000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-host>/libradesk?retryWrites=true&w=majority
```

Replace the placeholders with your actual MongoDB Atlas credentials and cluster hostname. URL-encode special characters in the username or password when necessary.

Ensure your backend database configuration reads `MONGODB_URI`. If your `config/db.js` uses a different environment variable name, use the name expected by that file.

### 4. Configure the frontend environment

Create or update `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

This tells the frontend where to find the local Express API.

Restart the frontend development server after changing environment variables.

### 5. Install backend dependencies

Open a terminal at the project root:

```bash
cd backend
npm install
```

Start the backend:

```bash
npm run dev
```

If your backend does not define a `dev` script, check `backend/package.json`. For example, if Nodemon is installed, the script can be:

```json
{
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js"
  }
}
```

The backend should connect to MongoDB and start at:

```text
http://localhost:5000
```

Check the health endpoint in your browser:

```text
http://localhost:5000/api/health
```

Expected response:

```json
{
  "success": true,
  "message": "LibraDesk API is running"
}
```

### 6. Install frontend dependencies

Open a **second terminal** from the project root:

```bash
cd frontend
npm install
```

Install Lucide React if it is used by your components:

```bash
npm install lucide-react
```

Start the Next.js development server:

```bash
npm run dev
```

Open the application:

**http://localhost:3000**

Keep both terminal sessions running while using the application.

## 🔌 API Endpoints

The following endpoints reflect the planned/current API route structure. Verify them against your backend implementation.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check backend status |
| GET | `/api/dashboard` | Fetch dashboard data |
| GET | `/api/books` | List books |
| POST | `/api/books` | Create a book |
| GET | `/api/books/:id` | Get a book by ID |
| PATCH | `/api/books/:id` | Update a book |
| DELETE | `/api/books/:id` | Delete a book |
| GET | `/api/members` | List members |
| POST | `/api/members` | Create a member |
| GET | `/api/members/:id` | Get a member by ID |
| PATCH | `/api/members/:id` | Update a member |
| DELETE | `/api/members/:id` | Delete a member |
| GET | `/api/transactions` | List transactions |
| POST | `/api/transactions` | Issue a book / create a transaction |
| GET | `/api/transactions/:id` | Get a transaction by ID |
| PATCH | `/api/transactions/:id/return` | Return a book |

## 🧪 Testing the Application

After starting both servers, verify the following:

1. Open the dashboard and confirm that statistics load from the backend.
2. Add a book and check that it appears in the books list.
3. Edit a book and verify that changes persist after refreshing.
4. Register a member and confirm their details are saved.
5. Issue a book to a valid member.
6. Confirm that the book's available-copy count decreases.
7. Return the book and confirm that the available-copy count increases.
8. Test invalid inputs, unavailable books, and invalid record IDs.
9. Verify that overdue transactions are identified correctly.
10. Check the browser console and backend terminal for errors.

## 🐛 Troubleshooting

### Backend connection failed

- Confirm that the backend is running on port `5000`.
- Check the MongoDB connection string in `backend/.env`.
- Verify MongoDB Atlas network access and database credentials.
- Confirm that `NEXT_PUBLIC_API_URL` points to the correct backend URL.

### `Module not found: Can't resolve 'lucide-react'`

Run inside `frontend`:

```bash
npm install lucide-react
```

Restart the Next.js server.

### MongoDB authentication failed

- Check the database username and password.
- Ensure the database user has the required permissions.
- URL-encode special characters in the connection string.

### CORS error

Confirm that `CLIENT_URL` in `backend/.env` matches the frontend origin, normally:

```env
CLIENT_URL=http://localhost:3000
```

Restart the backend after updating the environment.

### Dashboard data does not load

- Open `http://localhost:5000/api/health`.
- Check `http://localhost:5000/api/dashboard`.
- Confirm that the dashboard route is registered in `backend/server.js`.
- Check the backend terminal for database or controller errors.

## 🔐 Environment Variables and Security

- Keep `.env` and `.env.local` out of version control.
- Never expose database credentials in frontend code.
- Only expose intentionally public configuration through `NEXT_PUBLIC_` variables.
- Validate input on the backend.
- Use appropriate database permissions and secure production environment variables.

## 🚧 Future Improvements

- Authentication and role-based access control.
- Pagination, sorting, and advanced search.
- Book categories and cover images.
- Overdue reminders and fine calculation.
- Reports and analytics.
- Automated backend tests.
- Production deployment and monitoring.

## 👨‍💻 Author

**Akash Dandale**

GitHub: [@akash-1503](https://github.com/akash-1503)

---

If you find a bug or have a suggestion, feel free to open an issue or contribute to the project.
