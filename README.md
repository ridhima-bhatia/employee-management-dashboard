# 🧑‍💼 Employee Management Dashboard
A **secure, full-stack Employee Management Dashboard** built using the **MERN stack (MongoDB, Express.js, React.js, Node.js)**.
The application enables efficient employee data management, secure document handling, real-time analytics, and server-side filtering, while adhering to **OWASP security best practices**.

## 📌 Features Overview
* Full **CRUD operations** for employee records
* **Secure file uploads** with AES-256 encryption for resumes
* **Server-side filtering** (department, gender, joining date, search)
* **Live analytics dashboard** using interactive charts
* **Dark Mode** with consistent UI theming
* **OWASP-compliant backend security framework**

## 🏗️ System Architecture
The application follows a **modern client–server architecture**, ensuring separation of concerns, scalability, and maintainability.
```
React Frontend (SPA)
        ↓
RESTful API (Express.js)
        ↓
Business Logic & Security Layer
        ↓
MongoDB Atlas (Cloud Database)
```

### Architecture Layers
* **Client (Frontend)**
  React.js Single Page Application responsible for UI rendering, user input, and API interactions.

* **API Layer**
  RESTful endpoints enabling structured communication between frontend and backend.

* **Server (Backend)**
  Node.js + Express.js server handling validation, security, encryption, and database operations.

* **Database**
  MongoDB Atlas for persistent storage of employee records and encrypted file metadata.

## 🧰 Technology Stack

### Frontend
* **React.js** – Component-based UI, hooks (`useState`, `useEffect`)
* **JavaScript (ES6+)** – Async operations, state handling, conditional rendering
* **HTML5 & JSX** – Dynamic UI structure
* **CSS3 & Bootstrap 5** – Responsive layout and dark mode styling
* **Axios** – API communication and file uploads
* **React Chart.js 2** – Interactive analytics visualization

### Backend
* **Node.js** – Asynchronous, non-blocking server runtime
* **Express.js** – RESTful API development
* **MongoDB Atlas** – Cloud-hosted NoSQL database
* **Mongoose** – Schema validation and ODM
* **Multer** – Secure multipart file uploads
* **Crypto (Node.js)** – AES-256 encryption for sensitive files

### Utilities & Middleware
* **Dotenv** – Environment variable management
* **Morgan** – HTTP request logging
* **CORS** – Controlled cross-origin access
* **Helmet** – Secure HTTP headers

## 🔐 Security Highlights (OWASP-Aligned)
Security is a first-class concern in this project.

### Implemented Protections
* **AES-256 encryption** for resumes (at-rest security)
* **Strict schema validation** via Mongoose
* **File type & size restrictions** using Multer
* **CORS restrictions** for trusted frontend origins only
* **Environment variable isolation** using `.env`
* **Safe error handling** (no internal stack trace exposure)

### OWASP Top 10 Mitigation

| Risk                   | Mitigation                               |
| ---------------------- | ---------------------------------------- |
| NoSQL Injection        | Schema validation, no raw queries        |
| XXE Attacks            | JSON-only data handling                  |
| DoS Attacks            | File size & payload limits               |
| Malicious File Uploads | Whitelisting + encryption                |
| Misconfiguration       | Secure headers, dotenv, updated packages |

## 🔁 Data Flow (End-to-End)
1. **User submits employee data** from React frontend
2. **Axios sends multipart/form-data** request
3. **Express API validates inputs**
4. **Multer processes file uploads**
5. **Resume encrypted using AES-256**
6. **MongoDB stores employee record & encrypted paths**
7. **Frontend re-renders updated state**

## 📊 Analytics Dashboard
* Real-time **department-wise employee distribution**
* Interactive **pie chart visualization**
* Dynamic updates without page refresh

## 🌗 Dark Mode Support
* Seamless toggle between light & dark themes
* Accessibility-friendly contrast ratios
* Consistent styling across all components

## 🚀 Installation & Setup

### Prerequisites
* Node.js (v16+)
* MongoDB Atlas account

### Clone Repository
```bash
git clone https://github.com/ridhima-bhatia/employee-management-dashboard.git
cd employee-management-dashboard
```

### Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file:

```env
MONGO_URI=your_mongodb_atlas_uri
ENCRYPTION_KEY=your_32_byte_key
IV_KEY=your_16_byte_iv
```

Run backend:

```bash
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## 🧪 Testing & Validation
* Manual API testing with invalid payloads
* Malicious file upload attempts rejected
* Encryption verified via binary inspection
* `npm audit` confirms no vulnerable dependencies

## 📈 Future Enhancements
* Role-Based Access Control (RBAC)
* JWT Authentication
* Rate-limiting middleware
* Resume decryption on-demand
* Audit logs & admin dashboard
