# 📁 File Tracker

A workflow management system built with **Next.js (App Router)** and **TypeScript** to track files as they move through multiple organizational stages.

Designed to simulate real office flow — where files are received, processed, reviewed, and archived — with clear tracking, accountability, and history.

---

## 🚀 What This App Does

* Track files across multiple stages:

  * Reception → Officer Desk → Manager Review → Final Records
* Allow officers to:

  * ✅ Approve & forward (with signature + timestamp)
  * ➡️ Forward without approval
* Maintain full file history (who did what, and when)
* Show real-time status and stage distribution

---

## 🧱 Tech Stack

* **Framework:** Next.js (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **UI Components:** shadcn/ui
* **State Management:** React Context API + custom hooks

---

## ⚙️ Getting Started

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd file-tracker
npm install
```

### 2. Run the App

```bash
npm run dev
```

Open: http://localhost:3000

---

## 📂 Project Structure

```text
app/                → Routes & layouts
components/         → UI + shared components
context/            → Global state (FileContext)
hooks/              → Custom hooks (useFiles)
lib/                → Utilities & mock data
styles/             → Extra styling (animations)
types/              → TypeScript models
```

---

## 🧾 Data Model (Simplified)

Each file follows this structure:

```ts
type TrackedFile = {
  id: string;
  title: string;
  description: string;
  currentStage: string;
  assignedTo: string;
  status: "Pending" | "Approved" | "Forwarded";
  history: {
    actor: string;
    action: string;
    from: string;
    to: string;
    timestamp: string;
    signature?: string;
  }[];
};
```

---

## ✨ Features

* 📌 Multi-stage workflow system
* 📊 Stage-based file tables
* 🏷️ Status indicators (Pending / Approved / Forwarded)
* ✍️ Approval with signature modal
* 🔄 Forward-only option
* 👤 Officer switching (role simulation)
* 📈 Sidebar with live counts per stage
* 🔍 Search & filtering
* ♻️ Reusable, modular architecture

---

## ⚠️ Current Limitations

* Uses **mock data only** (no database)
* No authentication system yet
* State resets on refresh

---

## 🔮 Future Improvements

* Backend integration (Node.js / Express / Prisma)
* Persistent database (PostgreSQL / MongoDB)
* Authentication & role-based access
* Real-time updates (WebSockets)
* Audit logs & reporting

---

## 🧠 Design Philosophy

This project is structured to be:

* Easy to extend into a full-stack system
* Cleanly separated (UI, logic, data)
* Beginner-friendly but scalable

---

## 🛠 Scripts

```bash
npm run dev     # start development
npm run build   # production build
npm run start   # run production server
npm run lint    # lint code
```

---

## 📌 Notes

* Final stage is intentionally locked (no further forwarding)
* Context API is used for simplicity — can be replaced with Zustand/Redux if needed
* UI is fully customizable via shadcn + Tailwind

---

## 👨‍💻 Author

Built as a workflow simulation project for learning and scaling into real-world systems.

---
