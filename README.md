# Campus-Connect
# 🎓 Campus Connect

**Your campus, all in one place.** Campus Connect is a lightweight community platform where students share real-time updates about lost items, free study rooms, free food, dorm notices, events, and second-hand marketplace listings, while campus admins publish official announcements that always stay on top.

Built with a **Flask + SQLite** backend and a **vanilla HTML / CSS / JavaScript** frontend. No frameworks, no build step.

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Demo Accounts](#-demo-accounts)
- [Two Ways to Run](#-two-ways-to-run)
- [Adding Your Own Photos](#-adding-your-own-photos)
- [API Reference](#-api-reference)
- [Database Schema](#-database-schema)
- [Security Notes](#-security-notes)
- [Deployment](#-deployment)
- [Roadmap](#-roadmap)

---

## ✨ Features

### Content categories
| Category | What it's for |
|---|---|
| 🔍 **Lost and Found** | Post lost items or claim what you've found |
| 📚 **Study Rooms** | Share which rooms are free right now |
| 🍕 **Free Food** | Post a menu (up to 12 items) with a Veg / Non-veg / Both label |
| 📢 **Notices** | Dorm and campus updates |
| 🎉 **Events** | Date, time and location; upcoming events are sorted soonest-first |
| 🛍️ **Marketplace** | Buy and sell with price and contact details |
| 📌 **Announcements** | Admin-only official updates, pinned to the top |

### Platform features
- **Authentication:** sign up, log in and log out with hashed passwords and server-side sessions
- **Role-based access:** only `admin` users can post Announcements
- **Live feed:** auto-refreshes every 30 seconds, with newest-first ordering
- **Search:** searches titles, descriptions, menus and event/marketplace details
- **Filter and paginate:** category tabs, a "Hide resolved" toggle and a "Load more" button
- **Upvotes:** mark posts as helpful (toggle on/off)
- **Resolve and delete:** authors can mark their posts as resolved (dimmed in the feed) or delete them
- **Photo uploads:** images are compressed in the browser (max 800px, JPEG) before upload
- **Image lightbox:** click any photo to enlarge it
- **Profile page:** see your posts plus stats for posts, helpful votes and resolved items
- **Live stats:** hero counters for total posts, students and resolved posts
- **Dark / light theme:** manual toggle that is saved, and it respects the system preference
- **Responsive and accessible:** mobile menu, safe-area support, focus states, ARIA labels and `prefers-reduced-motion` support
- **Graceful photo fallback:** if an image file is missing, a placeholder tile is shown, so nothing breaks

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3, [Flask](https://flask.palletsprojects.com/) 3.0+ |
| Database | SQLite (`campus.db`, created automatically on first run) |
| Auth | Flask sessions + Werkzeug password hashing |
| Frontend | HTML5, CSS3 (custom properties, Grid, Flexbox), vanilla JavaScript (ES6+) |
| Font | [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts |

---

## 📁 Project Structure

```
campus-connect-fullstack/
├── app.py                  # Flask app: REST API, auth, DB init and seed data
├── requirements.txt        # Python dependencies (Flask>=3.0)
├── templates/
│   └── index.html          # Single-page UI template
└── static/
    ├── style.css           # Styles, theming, responsive layout
    ├── script.js           # Frontend logic, API client, local fallback
    └── img/                # Post photos (see "Adding Your Own Photos")
        └── README.txt
```

The repository also includes **`Campus_Connect_final.html`**, a single-file standalone version that needs no server (see [Two Ways to Run](#-two-ways-to-run)).

---

## 🚀 Getting Started

### Prerequisites
- Python **3.9+**
- `pip`

### Installation

```bash
# 1. Clone or download the project, then enter the folder
cd campus-connect-fullstack

# 2. (Recommended) create a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Start the server
python app.py
```

Open **http://127.0.0.1:5000** in your browser.

On first launch the database is created automatically and seeded with demo users and sample posts, so the site is never empty.

---

## 🔑 Demo Accounts

| Role | Email | Password |
|---|---|---|
| Student | `demo@campus.edu` | `demo1234` |
| Admin | `admin@campus.edu` | `admin1234` |

> ⚠️ **Change or remove these accounts before deploying publicly.**

---

## 🔀 Two Ways to Run

| Mode | How | Data stored in |
|---|---|---|
| **Full-stack** | `python app.py` → `http://127.0.0.1:5000` | SQLite database (shared by all users) |
| **Standalone** | Open `Campus_Connect_final.html` directly in a browser | Browser `localStorage` (private to that browser) |

In the standalone version, the frontend automatically falls back to a local implementation of the same API, so it works on static hosting or as a quick preview. In this mode, data is **not shared** between users or devices.

---

## 🖼️ Adding Your Own Photos

Seed posts look for these files in `static/img/` (JPG, ideally 800px+ wide, landscape):

| File | Used by |
|---|---|
| `fest.jpg` | Welcome Week Fest |
| `hackathon.jpg` | Hackathon kickoff |
| `openmic.jpg` | Open Mic Night |
| `textbook.jpg` | Engineering Maths textbook |
| `lamp.jpg` | Study desk lamp |
| `bicycle.jpg` | Cycle in good condition |
| `exam.jpg` | Mid-semester exams announcement |
| `library.jpg` | Library timings |

Missing files fall back to a placeholder, so nothing breaks. Refresh the page after adding files. Free image sources: [Unsplash](https://unsplash.com), [Pexels](https://pexels.com), [Pixabay](https://pixabay.com). Check each photo's licence before using it.

---

## 🔌 API Reference

All endpoints exchange JSON. Routes marked 🔒 require login.

### Auth
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/me` | Current user, or `null` |
| `POST` | `/api/signup` | Create account `{name, email, password}` |
| `POST` | `/api/login` | Log in `{email, password}` |
| `POST` | `/api/logout` | End the session |

### Posts
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/posts` | List posts (see query params below) |
| `POST` 🔒 | `/api/posts` | Create a post |
| `POST` 🔒 | `/api/posts/<id>/up` | Toggle upvote |
| `POST` 🔒 | `/api/posts/<id>/done` | Toggle resolved (author only) |
| `DELETE` 🔒 | `/api/posts/<id>` | Delete a post (author only) |
| `GET` | `/api/stats` | `{posts, users, res}` counters |

**`GET /api/posts` query parameters**

| Param | Default | Description |
|---|---|---|
| `cat` | `All` | One of the seven categories, or `All` |
| `q` | – | Search text |
| `page` / `size` | `1` / `6` | Pagination (`size` max 50) |
| `open` | – | `1` hides resolved posts |
| `mine` | – | `1` returns only your posts 🔒 |
| `sort` | `new` | `new`, `pin` (announcements first) or `event` (upcoming events, soonest first) |

**Create-post body**

```json
{
  "t": "Title (1–80 chars)",
  "d": "Description (1–300 chars)",
  "c": "Events",
  "img": "data:image/jpeg;base64,... (optional)",
  "menu": { "items": ["Pizza", "Garlic bread"], "diet": "Veg" },
  "extra": { "date": "2026-10-12", "time": "17:00", "location": "Main Lawn" }
}
```

- `menu` applies to **Free Food** only.
- `extra` for **Events**: `{date, time, location}`. For **Marketplace**: `{price, contact}`.

---

## 🗄️ Database Schema

```
users   (id, name, email UNIQUE, pw, role)                       role: 'student' | 'admin'
posts   (id, title, description, category, created, user_id,
         done, img, menu, extra)                                  menu/extra stored as JSON text
upvotes (post_id, user_id)                                        composite primary key
```

Schema migrations (`img`, `menu`, `extra`, `role` columns) are applied automatically at startup, so older databases upgrade in place.

---

## 🔒 Security Notes

- Passwords are hashed with Werkzeug (`generate_password_hash`), never stored in plain text
- All SQL uses parameterised queries
- Server-side validation on every field (lengths, categories, dates, prices, menu items)
- Photos must be JPEG data URLs and are capped at ~600 KB; request bodies are capped at 1 MB
- Authors can only modify or delete their own posts; announcements are admin-only

---

## 🌐 Deployment

Before going live:

1. **Set a strong secret key**
   ```bash
   export SECRET_KEY="your-long-random-string"
   ```
2. **Turn off debug mode.** `app.run(debug=True)` is for development only.
3. **Change the demo credentials** (or delete the seeded accounts).
4. **Run with a production server**
   ```bash
   pip install gunicorn
   gunicorn -w 2 -b 0.0.0.0:8000 app:app
   ```
5. **Put it behind HTTPS** (Nginx, Caddy or your host's proxy).
6. If usage grows, swap SQLite for **PostgreSQL**.

---

## 🛣️ Roadmap

- [ ] Comments on posts
- [ ] Email verification for campus domains
- [ ] Admin moderation tools (edit / remove any post)
- [ ] Push or email notifications
- [ ] Image storage on disk or cloud instead of base64 in the database

---

## 📄 License

Add your preferred license here (for example, MIT).

---

<p align="center">Made with ❤️ to make campus life easier.</p>