
# 📒 NotesApp - Electron Desktop Application

A cross-platform desktop Notes application built using **Electron**, **Node.js**, and **JavaScript**.

---

## ✅ Features

- 📝 Simple, responsive notes UI
- 🖥️ Runs as a standalone desktop app
- 📦 Packaged into `.exe` (Windows) and `.dmg` (Mac) installers
- ⚡ Lightweight and fast

---

## ✅ Project Structure

```
NotesApp/
├── node_modules/
├── public/
├── src/
│   ├── main/        # Electron Main Process (app entry point)
│   ├── preload/     # Preload scripts
│   └── renderer/    # Frontend (HTML, CSS, JS)
│       └── assets/
│           └── icons/
├── package.json
└── README.md
```

---

## ✅ Prerequisites

Before starting:

- [Node.js (LTS Version 16.x or 18.x)](https://nodejs.org/en/download/)
- npm (comes with Node.js)
- Git 

---

## ✅ Installation and Setup

### 1. Clone the Repository or Download Source Code:

```bash
git clone https://github.com/yourusername/notes-app.git
cd notes-app
```

> Or just download the ZIP and extract it.

---

### 2. Install Dependencies:

```bash
npm install
```

This will install Electron, Electron Builder, Axios, and other required modules.

---

## ✅ Running in Development Mode

To start the app in development mode (hot reload and debug-friendly):

```bash
npm start
```

This will launch Electron with your app.

---

## ✅ Building the Installer (Production Build)

### 👉 For **Windows (.exe Installer)**

> Run this on a **Windows machine**:

```bash
npm run build
```

After building, check:

```
dist/notes-app Setup.exe
```

---

### 👉 For **Mac (.dmg Installer)**

> Run this on a **Mac machine**:

```bash
npm run build
```

After building, check:

```
dist/notes-app.dmg
```

---

### ⚠️ Important Notes on Cross-Platform Builds

| Target | Build Environment |
|------|------|
| `.exe` (Windows Installer) | Build on **Windows** |
| `.dmg` (Mac Installer) | Build on **Mac** |

Electron Builder does not support cross-building `.dmg` on Windows or `.exe` on Mac without advanced CI setup (Mac runners like GitHub Actions MacOS VM).

---

## ✅ Build Output Directory

All builds go to:

```
/dist/
```

Look for your `.exe`, `.dmg`, or `.zip` files there.

---

## ✅ Installer Customizations (NSIS for Windows)

Current settings:

- One-click installer: ❌ Disabled (user selects install directory)
- Desktop shortcut: ✅ Yes
- Start Menu shortcut: ✅ Yes
- App data gets deleted on uninstall: ✅ Yes
- Custom icons used: ✅ Yes (`n_logo.ico`)

You can modify these in `package.json` under the `build` → `nsis` section.

---

## ✅ Icon Locations

- **Windows Installer Icon:**  
`src/renderer/assets/icons/n_logo.ico`

- **Mac Installer Icon:**  
`src/renderer/assets/icons/n_logo.icns`  
(*Make sure to provide this file if missing*)

---

## ✅ Dependencies Used

- **Electron**
- **Electron Builder**
- **Axios**

---

## ✅ Troubleshooting

| Error | Cause | Solution |
|-----|----|----|
| `icon not found` | Wrong icon path | Double-check paths in `package.json` |
| Electron Builder not found | Missing dependency | Run `npm install` |
| Cannot build Mac `.dmg` on Windows | Platform limitation | Build on MacOS or set up CI/CD |
| Node version errors | Incompatible Node | Use Node LTS (16.x or 18.x) |

---

## ✅ Useful Build Commands (Cheat Sheet)

| Command | Purpose |
|---|---|
| `npm start` | Run app in development |
| `npm run build` | Create production installer |

---

## ✅ License

ISC License  
---


