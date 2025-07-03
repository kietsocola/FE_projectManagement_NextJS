# 📝 Task Management App (Next.js)

A modern and scalable **task management system** built with **Next.js**, featuring advanced task filtering, subtask hierarchy, comment threads, user roles, activity logging, and customizable priorities/labels.

## 🚀 Features

### ✅ Task Management
- **CRUD Tasks**: Create, edit, delete tasks with full validation.
- **Advanced Filtering**: Filter by priority, label, assignee, status, keyword, date range, etc.
- **Pagination**: Efficient server-side pagination for large datasets.
- **Subtasks**: Nested subtasks with **configurable depth limits**.
- **Comments & Replies**: Support for threaded comments with **limited reply depth**.
- **Assign Users**: Assign tasks to one or multiple users.
- **Labels & Priorities**: Tag tasks with dynamic labels and priority levels.
- **Activity Log**: Track all changes to tasks (e.g. updates, status changes, comments).
- **Access Control**: Check user permissions for edit/delete/assign actions.

### 🏷️ Label & Priority Management
- **CRUD Labels/Priorities**: Manage customizable label and priority lists.
- **Color Picker**: Choose colors for visual distinction.

### 🔐 Role-Based Permissions (if included)
- **Admin**: Full control.
- **Project Manager**: Manage tasks and assign users.
- **User**: View and update assigned tasks, leave comments.


---

## 🧱 Tech Stack

| Technology    | Description                           |
|---------------|---------------------------------------|
| Next.js       | React framework with SSR and routing  |
| TypeScript    | Type-safe development                 |
| Tailwind CSS  | Modern utility-first CSS framework    |
| Axios         | Data fetching                         |
| PostgreSQL    | Backend database                      |
| Spring boot   | Custom backend endpoints              |

---

## 📂 Folder Structure

````

/task-management-ui
├── components/           # Reusable components (TaskCard, CommentThread, etc.)
├── pages/                # Next.js routing
│   ├── index.tsx         # Main dashboard
│   └── tasks/            # Task listing, detail, create/edit
├── services/             # API calls (taskService.ts, labelService.ts)
├── store/                # Zustand/Redux state
├── utils/                # Helper functions (formatDate, permissions, etc.)
├── types/                # TypeScript interfaces
├── public/               # Static files
└── styles/               # Tailwind/global CSS

````

---

## ⚙️ Setup & Development

### 1. Clone the project
```bash
git clone https://github.com/kietsocola/FE_projectManagement_NextJS.git
cd task-management-ui
````

### 2. Install dependencies

```bash
npm install
```

### 3. Run the development server

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
npm start
```

---

## 📌 TODO & Suggestions (Optional)

* [ ] Add dark mode
* [ ] Drag & drop task sorting (kanban-style)
* [ ] Task deadlines & calendar view
* [ ] Email notifications for updates
* [ ] User profile pages
* [ ] Export tasks (CSV/PDF)
* [ ] Mobile responsiveness

---

## 🛡️ License

This project is licensed under the [MIT License](LICENSE).

---

## 👤 Author

**Kiet Socola**
🔗 GitHub: [@kietsocola](https://github.com/kietsocola)
