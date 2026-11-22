# Marqueuet — Team Collaboration Guide

> **Run it locally:** open a terminal in the project folder and run `npm install`, then `npm start`,
> then open **http://localhost:3000** in your browser. Do not double-click `index.html` — login and
> search need the little server, because a page opened straight from disk cannot keep a login cookie.
>
> **No sign-up needed to demo:** with no `.env` file the app runs on built-in **sample posts** and
> shows a **Sample data** badge. Copy `.env.example` to `.env` only if you want live TikTok posts.

This repository contains the source code for the **Marqueuet** project. If you are new to Git and GitHub, this guide explains the core concepts and provides the exact terminal commands needed to collaborate effectively without overwriting each other's work.

##  Project Directory Structure
```text
WST-FinalProject-Prototype/
server/                  (the back end, same shape as the browser side)
├── index.js             (entry point: just starts the server)
├── composition/app.js   (the one place that joins everything together)
├── edge/routes.js       (web routes: search, posts, explain, auth)
├── use-cases/           (what the app does: search-posts, explain-decision)
├── cleaning/pipeline.js (rules that drop spam, reposts and off-topic posts)
├── store/post-store.js  (saves cleaned posts to data/posts.json)
├── adapters/            (outside sources: sample data, TikTok via Apify)
├── config/settings.js   (the one file that picks the data source)
├── auth.js              (local sign up / sign in / guest + Google)
├── .data/               (local accounts file, git-ignored)
└── data/posts.json      (cleaned posts saved by the server)
css/
├── style.css            (Apple-grade translucent glassmorphism & styles)
└── auth.css             (sign-in sheet styles)
js/
├── data/demo-data.js    (ALL sample data: entities, matchups, feed posts)
├── domain/                  (pure rules, no page and no network)
│   ├── matchup.js           (splits typed text into brand names, drops filler)
│   ├── verdict.js           (scores, headline, "who leads where")
│   └── explainer.js         (picks the chart type by rule, writes the short line)
├── application/             (what the page can ask for)
│   ├── compare.js           (build a comparison from the names typed)
│   └── explain.js           (ask for the plain-English answer)
├── ports/ports.js           (the labelled doors: content source, account, explain)
├── adapters/                (the plugs behind those doors)
│   ├── sample-source.js     (built-in sample posts, works with no keys)
│   ├── post-gateway.js      (cleaned posts from the server)
│   └── explain-gateway.js   (server explanation)
├── composition/app.js       (the one place that decides which plug is in use)
├── script.js                (page layer: draws and listens only)
├── landing.js               (Header, scroll reveals, typewriter)
└── auth.js                  (Sign-in sheet on the landing page)
docs/                      (Architecture + Google setup guides)
index.html                 (Structure & semantic markup only)
package.json               (scripts and dependencies)
package-lock.json          (exact package versions, keep it in Git)
.env.example               (copy to .env only for live data)
.gitignore                 (keeps node_modules, .env and accounts out of Git)
README.md                  (Team documentation & deployment guides)
```

* **`index.html`**: Handles the layout, sections, navigation bars, and modals.
* **`css/style.css`**: Handles color palettes, typography, responsive grids, and translucent blur materials.
* **`script.js`**: Page layer only — draws the charts, reads input, listens for clicks. The rules and data sit behind it.
* **`domain/`**: The pure rules. Give it posts, it returns numbers — no page, no network, so it can be swapped or tested alone.
* **`ports/` + `adapters/`**: Small labelled doors and the plugs behind them. Sample data and real TikTok are two plugs for the same door.
* **`composition/app.js`**: The single file that chooses which plug is in use. Swapping sample data for live posts is one line here, not a rewrite.
* **`demo-data.js`**: Holds every sample number the app shows. Change this file only, and the whole demo shows a different dataset.
---

## 1. What is "Cloning"?

Before you can work on this project, you need a local copy of the project files on your own computer.

**Cloning** downloads the entire project repository—including all files, markup, scripts, and complete version history—from GitHub directly onto your hard drive.

> **Analogy:** Think of the remote repository as a shared master document hosted in cloud storage. "Cloning" downloads an exact, linked duplicate onto your computer so you can open and edit files locally in your code editor.

---

## 2. How to Clone the Repository

Follow these instructions in your terminal or command prompt to download your local working directory.

### Prerequisites
Ensure [Git](https://git-scm.com/) is installed on your computer.

### Step 1: Open Terminal or Command Prompt
* **Windows:** Press `Win + S`, type `cmd`, and press **Enter**.
* **macOS / Linux:** Open the **Terminal** application.

### Step 2: Navigate to Your Working Directory
Use the `cd` (change directory) command to choose where to save the project (for example, your Desktop):
```bash
cd Desktop
```

### Step 3: Clone the Repository
Run the clone command using the repository URL:
```bash
git clone https://github.com/justinbaliwag/WST-FinalProject-Prototype.git
```

### Step 4: Enter the Cloned Directory
Move into the newly created folder:
```bash
cd Marqueuet
```

*Verification:* Run `dir` (Windows) or `ls` (macOS/Linux). You should see the project files, including `index.html`.

---

## 3. What is a "Branch"?

When multiple teammates modify the same files simultaneously, editing a single shared copy directly leads to code conflicts and accidental overwrites.

A **Branch** is an isolated, independent workspace within Git.

> **Analogy:** The `main` branch represents the official, working version of your application. When you branch off, you take a snapshot of that code into a separate draft room. You can build features, adjust styling, and test changes safely without disrupting teammates. Once finished and verified, your branch merges back into `main`.

---

## 4. How to Create and Work on Your Own Branch

Never push experimental work directly to `main`. Follow this workflow for each new feature, bug fix, or section update:

### Step 1: Update Your Local Main Branch
Before starting new work, pull the latest changes submitted by your teammates:
```bash
git checkout main
git pull origin main
```

### Step 2: Create and Switch to a New Branch
Use the `checkout -b` flag followed by a clear, lowercase branch name (e.g., `feature/sidebar-update` or `jules/radar-chart`):
```bash
git checkout -b feature/your-feature-name
```
*Verification:* Run `git branch`. An asterisk (`*`) will appear beside your new branch name, confirming it is active.

### Step 3: Edit Your Code
Open the project in VS Code or your preferred text editor, make your adjustments, and save your files.

### Step 4: Stage and Commit Your Changes
Tell Git which modified files to include, then record a clear snapshot message:
```bash
git add .
git commit -m "feat: brief summary of changes made"
```

### Step 5: Push the Branch to GitHub
Send your branch to the remote GitHub repository:
```bash
git push -u origin feature/your-feature-name
```

---

## 5. Merging Changes (Pull Requests)

Once your branch is pushed:

1. Open the repository on GitHub: `https://github.com/justinbaliwag/WST-FinalProject-Prototype`
2. Look for the banner highlighting your recently pushed branch and click **Compare & pull request**.
3. Add a concise title and description summarizing what was added or changed.
4. Click **Create pull request**.
5. Alert your teammates to review your updates. Once approved, merge the Pull Request into `main`.
