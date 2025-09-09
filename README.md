# 🗂️ Kanban Work Board Application

<p align="center">
  <img src="https://img.shields.io/badge/Django-5.1.1-green?style=for-the-badge&logo=django" alt="Django">
  <img src="https://img.shields.io/badge/DRF-3.14.0-red?style=for-the-badge&logo=django" alt="Django REST Framework">
  <img src="https://img.shields.io/badge/React-18.2.0-blue?style=for-the-badge&logo=react" alt="React">
  <img src="https://img.shields.io/badge/Tailwind-3.3.3-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python" alt="Python">
</p>

<p align="center">
  <strong>A modern, full‑stack task management application with a beautiful Kanban board and drag‑and‑drop.</strong>
</p>

<p align="center">
  <a href="#-features">Features</a> • 
  <a href="#-quick-start">Quick Start</a> • 
  <a href="#-tech-stack">Tech Stack</a> • 
  <a href="#-usage">Usage</a> • 
  <a href="#-api-reference">API</a> • 
  <a href="#-project-structure">Project Structure</a> •
  <a href="#-deployment">Deployment</a> • 
  <a href="#-troubleshooting">Troubleshooting</a>
</p>

<p align="center">
  <!-- Replace with your own screenshot -->
  <img src="https://user-images.githubusercontent.com/your-username/your-image-id.png" width="800" alt="Kanban Board Preview">
</p>

---

## ✨ Features

### 🎯 Core Functionality

- **🔐 Secure Authentication** – User registration, login and logout
- **📋 Multi‑Board Management** – Create and organize multiple work boards
- **🧭 Kanban Columns** – To‑Do, In‑Progress and Completed
- **🎯 Drag & Drop** – Seamless task movement between columns
- **📝 Task CRUD** – Create, edit and delete tasks
- **👥 Assignment** – Assign tasks to specific users
- **⚡ Real‑time UI Updates** – Instant front‑end refresh on changes

### 🎨 UI/UX

- **Clean, Responsive UI** – Built with Tailwind CSS
- **Helpful Empty/Loading States**
- **Toast Notifications** – User‑friendly success/error messages
- **Mobile‑first Layout**

---

## 🚀 Quick Start

### Prerequisites

- **Python** 3.8+
- **Node.js** 16+
- **npm** or **yarn**

### Backend Setup (Django)

```bash
# Clone the repository
git clone https://github.com/your-username/Kanban_WorkBoard.git
cd Kanban_WorkBoard/workboard

# (Optional) Create and activate a virtual environment
python -m venv venv
# Linux/Mac
source venv/bin/activate
# Windows (PowerShell)
# .\\venv\\Scripts\\Activate.ps1

# Install Python dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# (Optional) Create a superuser
python manage.py createsuperuser

# Start the Django development server
python3 manage.py runserver
```

The backend will be available at **http://localhost:8000**.

### Frontend Setup (React + Vite)

```bash
cd ../workboards

# Install Node.js dependencies
npm install

# Create environment file
# In the workboards directory, create .env.local with:
# VITE_API_URL=http://localhost:8000/api
printf "VITE_API_URL=http://localhost:8000/api\n" > .env.local

# Start the development server
npm run dev
```

The frontend will be available at **http://localhost:5173**.

---

## 🧭 Usage

1. Open **http://localhost:5173** in your browser.
2. Sign up or sign in.
3. Create your first **Work Board**.
4. Add tasks and assign them to users.
5. Drag tasks between **To‑Do**, **In‑Progress**, and **Completed** columns.

---

## 🏗️ Tech Stack

### Backend

|            Technology | Purpose            | Version |
| --------------------: | ------------------ | :-----: |
|                Django | Web framework      |  5.1.1  |
| Django REST Framework | API development    | 3.14.0  |
|                SQLite | Default database   |   3.x   |
|                  CORS | Cross‑origin setup |    —    |
|        Token/JWT Auth | Secure API access  |    —    |

### Frontend

|      Technology | Purpose                                          | Version |
| --------------: | ------------------------------------------------ | :-----: |
|           React | UI library                                       | 18.2.0  |
|            Vite | Build tool/dev server                            |   4.x   |
|     React Query | Server state mgmt                                |   4.x   |
|    React Router | Client routing                                   |   6.x   |
|     Drag & Drop | Kanban DnD (`@dnd-kit` or `react-beautiful-dnd`) |    —    |
|    Tailwind CSS | Styling                                          |  3.3.3  |
|    Lucide React | Icons                                            |    —    |
| React Hot Toast | Notifications                                    |    —    |

> ℹ️ Replace DnD choice above with the one you actually use. Example snippets below use **@dnd-kit**.

---

## 📖 API Reference

### Authentication

| Method | Endpoint         | Description       |
| :----: | ---------------- | ----------------- |
|  POST  | `/api/signup/`   | User registration |
|  POST  | `/api/login/`    | User login        |
|  POST  | `/api/logout/`   | User logout       |
|  GET   | `/api/users/me/` | Current user      |

### Boards

| Method | Endpoint            | Description      |
| :----: | ------------------- | ---------------- |
|  GET   | `/api/boards/`      | List all boards  |
|  POST  | `/api/boards/`      | Create new board |
|  GET   | `/api/boards/{id}/` | Board details    |
|  PUT   | `/api/boards/{id}/` | Update board     |
| DELETE | `/api/boards/{id}/` | Delete board     |

### Tasks

| Method | Endpoint                  | Description        |
| :----: | ------------------------- | ------------------ |
|  GET   | `/api/tasks/`             | List all tasks     |
|  POST  | `/api/tasks/`             | Create new task    |
|  GET   | `/api/tasks/{id}/`        | Task details       |
|  PUT   | `/api/tasks/{id}/`        | Update task        |
| DELETE | `/api/tasks/{id}/`        | Delete task        |
| PATCH  | `/api/tasks/{id}/status/` | Update task status |

---

## 🎮 Usage Examples

### Creating a Board (frontend)

```javascript
// Example API call
const createBoard = async (boardData, token) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/boards/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`, // or `Bearer ${token}` if using JWT
    },
    body: JSON.stringify(boardData),
  });
  if (!response.ok) throw new Error("Failed to create board");
  return response.json();
};
```

### Drag & Drop (with @dnd-kit)

```jsx
import { DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";

<DndContext onDragEnd={handleDragEnd}>
  <SortableContext items={tasks.map((t) => t.id)}>
    {tasks.map((task) => (
      <SortableTask key={task.id} task={task} />
    ))}
  </SortableContext>
</DndContext>;
```

---

## 📁 Project Structure

```
Kanban_WorkBoard/
├── workboard/                 # Django Backend
│   ├── boards/               # Main app
│   │   ├── models.py         # Database models
│   │   ├── views.py          # API views
│   │   ├── serializers.py    # Data serializers
│   │   └── urls.py           # API routes
│   ├── workboard/            # Django project settings
│   │   ├── settings.py
│   │   └── urls.py
│   └── requirements.txt      # Python dependencies
├── workboards/               # React Frontend
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/            # Page components
│   │   ├── contexts/         # React contexts
│   │   └── api/              # API functions
│   └── package.json
└── README.md
```

---

## 🚀 Deployment

### Backend (Django)

```bash
# Example production steps
export DEBUG=False
# export DJANGO_SETTINGS_MODULE=workboard.settings  # adjust if you have separate prod settings

# Collect static assets
python manage.py collectstatic --noinput

# Run with your chosen WSGI container (gunicorn/uwsgi) behind a reverse proxy
# Deploy to platforms like Railway, Render, DigitalOcean, etc.
```

### Frontend (React)

```bash
# Build for production
npm run build

# Deploy the dist/ folder (Vercel/Netlify/Railway, etc.)
```

---

## 🐛 Troubleshooting

- **Port already in use**: run `python manage.py runserver 8001`
- **CORS errors**: verify Django CORS configuration and `VITE_API_URL`
- **Module not found**: reinstall with `pip install -r requirements.txt` or `npm install`
- **Auth header mismatch**: ensure `Authorization: Token <token>` or `Authorization: Bearer <jwt>` matches your backend

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/YourFeature`
3. Commit your changes: `git commit -m "feat: add YourFeature"`
4. Push: `git push origin feature/YourFeature`
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the **MIT License**.

---

<p align="center">Made with ❤️ by <strong>Abhishek</strong></p>
<p align="center">
  <a href="https://github.com/Abhishek6827">GitHub</a> •
  <a href="https://linkedin.com/in/abhishek-tiwariiii">LinkedIn</a> •
  <a href="https://x.com/devilizbusyy">Twitter</a>
</p>
