# 🏆 SportsPro Management Suite

A full-stack **Sports Management System** built using **React (Frontend)** and **Flask (Backend)**.
This application helps manage students, coaches, teams, sports, and parents through a clean dashboard with complete CRUD functionality.

---

## 🚀 Features

* 📊 Dashboard with real-time statistics
* 👨‍🎓 Student management
* 🧑‍🏫 Coach management
* 🏟️ Team management
* 🏀 Sports management
* 👨‍👩‍👧 Parent management
* 🔍 Search functionality
* ➕ Add / ✏️ Edit / ❌ Delete records
* 🔔 Toast notifications
* 🪟 Modal-based forms
* 🔗 Fully connected relational data

---

## 🧩 Tech Stack

### 🎨 Frontend

* React.js
* JavaScript (ES6+)
* HTML5 & CSS3
* Axios
* React Router DOM

### ⚙️ Backend

* Python
* Flask
* Flask-CORS

### 🗄️ Database

* SQLite
* SQLAlchemy (ORM)

---

## 🏗️ Architecture

```id="arch123"
User → React Frontend → Flask API → SQLite Database
```

---

## 🔄 Workflow

### 1. User Interaction

* User interacts with UI (Dashboard, Students, etc.)

### 2. Frontend Processing

* React manages state using hooks
* Sends API requests using Axios

### 3. API Communication

```js id="api123"
GET /api/students
POST /api/students
PUT /api/students/:id
DELETE /api/students/:id
```

### 4. Backend Processing

* Flask receives request
* Validates data
* Applies business logic

### 5. Database Operations

* SQLAlchemy interacts with SQLite
* Data stored in `sports.db`

### 6. Response Handling

* Backend returns JSON
* Frontend updates UI instantly

---

## 📁 Project Structure

```id="struct123"
project/
│
├── frontend/
│   ├── src/
│   │   ├── App.js
│
├── backend/
│   ├── app.py
│   ├── models.py
│   ├── sports.db
```

---

## 📦 Installation & Setup

### 🔹 1. Clone Repository

```bash id="clone123"
git clone https://github.com/your-username/sportspro.git
cd sportspro
```

---

### 🔹 2. Backend Setup

```bash id="backend123"
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
pip install flask flask_sqlalchemy flask_cors
python app.py
```

Backend runs on:

```id="backendurl"
http://localhost:5000
```

---

### 🔹 3. Frontend Setup

```bash id="frontend123"
cd frontend
npm install
npm install axios react-router-dom
npm start
```

Frontend runs on:

```id="frontendurl"
http://localhost:3000
```

---

## 🔗 API Endpoints

| Resource | Endpoint        |
| -------- | --------------- |
| Students | `/api/students` |
| Coaches  | `/api/coaches`  |
| Teams    | `/api/teams`    |
| Sports   | `/api/sports`   |
| Parents  | `/api/parents`  |
| Stats    | `/api/stats`    |

---

## 🔍 Search Support

All endpoints support search:

```id="search123"
GET /api/students?search=john
```

---

## 🔗 Relationships

* Student → Parent
* Student → Team
* Team → Coach
* Team → Sport

---

## ⚙️ Key Concepts Used

* REST API Design
* CRUD Operations
* Component-based Architecture
* Reusable UI Components
* ORM (SQLAlchemy)
* State Management with Hooks

---

## 🧠 Example Workflow (Add Student)

1. Click **Add Student**
2. Fill form in modal
3. Submit → POST request
4. Backend saves to DB
5. Data returned to frontend
6. UI updates + success toast

---

## ⚠️ Limitations

* No authentication system
* No deployment (local only)
* Uses SQLite (not scalable for production)

---

## 🧪 Future Improvements

* 🔐 Authentication (JWT)
* 👥 Role-based access
* ☁️ Deployment (Vercel + Render)
* 🐘 PostgreSQL/MySQL
* 📄 Pagination & filtering

---


## ⭐ Final Note

This project demonstrates a complete **full-stack CRUD application** with:

* Clean UI
* Structured backend
* Real-world relationships
* Scalable architecture

---

