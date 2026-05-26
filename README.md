# Teyzicore FieldOps PWA

A modern Offline-First Progressive Web Application (PWA) built using React and Vite.  
This project allows users to manage jobs even without internet connectivity and sync data automatically when back online.

## Features

- Offline-first functionality
- Add and manage jobs
- Pending job queue system
- Automatic sync when internet reconnects
- Online/Offline status detection
- Responsive UI
- Local storage using IndexedDB/Dexie

## Technologies Used

- React
- Vite
- JavaScript
- Dexie.js
- IndexedDB
- CSS

## Installation

Clone the repository:

```bash
git clone https://github.com/codebyfatima5/teyzicorefieldops.git


Move into project folder:

cd teyzicorefieldops

Install dependencies:

npm install

Run the project:

npm run dev
Offline Sync Logic
Jobs are stored locally using IndexedDB.
When offline, jobs remain in pending state.
Once internet reconnects, sync service updates pending jobs automatically.

Author

Fatima Haider

GitHub: https://github.com/codebyfatima5
LinkedIn: https://www.linkedin.com/in/fatima-haider-801910373/
Live Demo
https://teyzix-core-field-ops.netlify.app/
