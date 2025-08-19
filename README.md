# Kanban Workboard – Django REST Framework + ReactJS

A full-stack Kanban board application with **drag-and-drop task management** and **role-based user control**.  
Built using **Django REST Framework (backend)** and **ReactJS (frontend)**, this project is designed for scalability and a smooth developer experience.

---

## Key Features

- **Drag & Drop Workflow** – Move tasks seamlessly between **To-Do**, **In Progress**, and **Done** columns using React Beautiful DnD.  
- **Role-Based Access Control** – Admin panel to manage **normal users** and **staff** (create, update, or deactivate accounts).  
- **Django REST Framework API** – Clean and modular backend providing secure CRUD operations for tasks, boards, and users.  
- **ReactJS Frontend** – Responsive UI with instant state updates and API integration.  
- **Scalable Architecture** – Decoupled frontend and backend for easy deployment and maintenance.  

---

## Tech Stack

- **Backend:** Django, Django REST Framework  
- **Frontend:** ReactJS, React Beautiful DnD, Axios  
- **Database:** PostgreSQL (or SQLite for development)  
- **Authentication:** JWT / Token-based authentication  

---

## Folder Structure

```
workboard/
├── workboard/        # Django backend (API)
└── workboards/       # ReactJS frontend
```

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd workboard
```

---

### 2. Backend Setup (Django + DRF)

1. Navigate to the backend folder:
   ```bash
   cd workboard
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # macOS / Linux
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run migrations and start the server:
   ```bash
   python manage.py migrate
   python manage.py runserver
   ```

The Django API will be running at:  
**http://127.0.0.1:8000/**

---

### 3. Frontend Setup (ReactJS)

1. Open a new terminal window (keep backend running).  
2. Navigate to the frontend folder:
   ```bash
   cd workboards
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the React development server:
   ```bash
   npm start
   ```

The React app will be running at:  
**http://localhost:3000/**

---

## Usage

- Open **http://localhost:3000/** in your browser.  
- Register/login as a user to manage your tasks.  
- Admin users can manage normal users and staff accounts.  
- Drag tasks between **To-Do → In Progress → Done** columns to update status.  

---

## API Endpoints (Examples)

- `POST /api/auth/login/` – User login  
- `POST /api/auth/register/` – User registration  
- `GET /api/boards/` – Fetch boards  
- `POST /api/tasks/` – Create task  
- `PATCH /api/tasks/:id/` – Update task status  

---

## License

This project is licensed under the **MIT License** – you are free to use, modify, and distribute it.
