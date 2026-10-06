"""Campus Connect backend: Flask + SQLite. Run: python app.py"""
import json, os, re, sqlite3, time
from datetime import date, timedelta
from functools import wraps
from flask import Flask, g, jsonify, request, session, render_template
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "dev-change-me")  # set a real one in production
app.config["MAX_CONTENT_LENGTH"] = 1_000_000  # reject huge uploads
import os
DB = "/tmp/campus.db" if os.environ.get("VERCEL") else os.path.join(os.path.dirname(os.path.abspath(__file__)), "campus.db")
CATS = ["Lost and Found", "Study Rooms", "Free Food", "Notices", "Events", "Marketplace", "Announcements"]

DIETS = ("Veg", "Non-veg", "Veg & non-veg")

SCHEMA = """
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL, pw TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS posts(id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL,
  description TEXT NOT NULL, category TEXT NOT NULL, created INTEGER NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id), done INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS upvotes(post_id INTEGER, user_id INTEGER, PRIMARY KEY(post_id, user_id));
CREATE INDEX IF NOT EXISTS idx_posts ON posts(category, created DESC);
"""

def init_db():
    c = sqlite3.connect(DB); c.executescript(SCHEMA)
    if "img" not in [r[1] for r in c.execute("PRAGMA table_info(posts)")]:
        c.execute("ALTER TABLE posts ADD COLUMN img TEXT")  # photo (JPEG data URL)
    if "menu" not in [r[1] for r in c.execute("PRAGMA table_info(posts)")]:
        c.execute("ALTER TABLE posts ADD COLUMN menu TEXT")  # Free Food menu (JSON)
    if "extra" not in [r[1] for r in c.execute("PRAGMA table_info(posts)")]:
        c.execute("ALTER TABLE posts ADD COLUMN extra TEXT")  # event / marketplace details (JSON)
    if "role" not in [r[1] for r in c.execute("PRAGMA table_info(users)")]:
        c.execute("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'student'")
    if not c.execute("SELECT 1 FROM users").fetchone():
        c.execute("INSERT INTO users(name,email,pw) VALUES(?,?,?)",
                  ("Demo Student", "demo@campus.edu", generate_password_hash("demo1234")))
        now = int(time.time() * 1000)
        for i, (t, d, cat, mins) in enumerate([
            ("Black AirPods case found", "Found near the library entrance. Pick up at the front desk.", CATS[0], 12),
            ("Library Room 204 is free", "Seats 6, whiteboard available until 6 PM.", CATS[1], 35),
            ("Free pizza at Student Union", "Robotics Club info session, 5:30 PM. Come hungry!", CATS[2], 60),
            ("Dorm B water shutdown", "Maintenance tomorrow 10 AM to 1 PM. Plan ahead.", CATS[3], 180)]):
            c.execute("INSERT INTO posts(title,description,category,created,user_id) VALUES(?,?,?,?,1)",
                      (t, d, cat, now - mins * 60000))
    if not c.execute("SELECT 1 FROM users WHERE role='admin'").fetchone():
        c.execute("INSERT OR IGNORE INTO users(name,email,pw,role) VALUES(?,?,?,'admin')",
                  ("Campus Admin", "admin@campus.edu", generate_password_hash("admin1234")))
    if not c.execute("SELECT 1 FROM posts WHERE category IN ('Events','Marketplace','Announcements')").fetchone():
        now = int(time.time() * 1000)
        first = c.execute("SELECT MIN(id) FROM users").fetchone()[0]
        admin = c.execute("SELECT id FROM users WHERE role='admin'").fetchone()[0]
        day = lambda n: (date.today() + timedelta(days=n)).isoformat()
        for t, d, cat, ex, mins, uid in [
            ("Welcome Week Fest", "Music, stalls and games for all new students.", "Events", {"date": day(3), "time": "17:00", "location": "Main Lawn"}, 20, first),
            ("Hackathon kickoff", "24-hour build sprint. Teams of up to 4.", "Events", {"date": day(7), "time": "10:00", "location": "CS Building, Lab 2"}, 50, first),
            ("Engineering Maths textbook", "Lightly used, no highlights.", "Marketplace", {"price": 350, "contact": "demo@campus.edu"}, 90, first),
            ("Study desk lamp", "LED, 3 brightness levels, works perfectly.", "Marketplace", {"price": 499, "contact": "demo@campus.edu"}, 120, first),
            ("Open Mic Night", "Sing, play or just watch. Sign up at the door.", "Events", {"date": day(5), "time": "18:30", "location": "Student Union Cafe"}, 10, first),
            ("Cycle in good condition", "Geared cycle, 1 year old. Helmet included.", "Marketplace", {"price": 2500, "contact": "demo@campus.edu"}, 30, first),
            ("Library open till 11 PM", "Extended timings during exam season, starting Monday.", "Announcements", None, 2, admin),
            ("Mid-semester exams start soon", "Timetable is on the student portal. Carry your ID card.", "Announcements", None, 5, admin)]:
            c.execute("INSERT INTO posts(title,description,category,created,user_id,extra) VALUES(?,?,?,?,?,?)",
                      (t, d, cat, now - mins * 60000, uid, json.dumps(ex) if ex else None))
    c.execute("UPDATE posts SET menu=? WHERE menu IS NULL AND title='Free pizza at Student Union'",
              (json.dumps({"items": ["Margherita pizza", "Garlic bread", "Cold drinks"], "diet": "Veg"}),))
    for title, name in {"Welcome Week Fest": "fest", "Hackathon kickoff": "hackathon", "Engineering Maths textbook": "textbook",
                        "Study desk lamp": "lamp", "Mid-semester exams start soon": "exam", "Open Mic Night": "openmic",
                        "Cycle in good condition": "bicycle", "Library open till 11 PM": "library"}.items():
        c.execute("UPDATE posts SET img=? WHERE title=? AND (img IS NULL OR img LIKE 'static/img/%')", (f"static/img/{name}.jpg", title))
    c.commit(); c.close()

def db():
    if "db" not in g:
        g.db = sqlite3.connect(DB); g.db.row_factory = sqlite3.Row
    return g.db

@app.teardown_appcontext
def close_db(_):
    d = g.pop("db", None)
    if d: d.close()

def err(msg, code=400): return jsonify(error=msg), code

def current_user():
    uid = session.get("uid")
    return db().execute("SELECT id,name,email,role FROM users WHERE id=?", (uid,)).fetchone() if uid else None

def login_required(f):
    @wraps(f)
    def w(*a, **k):
        u = current_user()
        if not u: return err("Please log in", 401)
        return f(u, *a, **k)
    return w

def user_json(u): return {"id": u["id"], "name": u["name"], "email": u["email"], "role": u["role"]}

@app.get("/")
def index(): return render_template("index.html")

@app.get("/api/me")
def me():
    u = current_user(); return jsonify(user_json(u) if u else None)

@app.post("/api/signup")
def signup():
    d = request.get_json(silent=True) or {}
    name, email, pw = (d.get("name") or "").strip(), (d.get("email") or "").strip().lower(), d.get("password") or ""
    if not 1 <= len(name) <= 40: return err("Enter your name (max 40 characters)")
    if "@" not in email or len(email) > 120: return err("Enter a valid email")
    if len(pw) < 6: return err("Password must be at least 6 characters")
    try:
        cur = db().execute("INSERT INTO users(name,email,pw) VALUES(?,?,?)", (name, email, generate_password_hash(pw)))
        db().commit()
    except sqlite3.IntegrityError:
        return err("Email already registered")
    session["uid"] = cur.lastrowid
    return jsonify(user_json(current_user()))

@app.post("/api/login")
def login():
    d = request.get_json(silent=True) or {}
    u = db().execute("SELECT * FROM users WHERE email=?", ((d.get("email") or "").strip().lower(),)).fetchone()
    if not u or not check_password_hash(u["pw"], d.get("password") or ""):
        return err("Wrong email or password", 401)
    session["uid"] = u["id"]
    return jsonify(user_json(u))

@app.post("/api/logout")
def logout():
    session.clear(); return jsonify(ok=True)

def clean_extra(cat, x):
    """Validate event / marketplace details. Returns JSON text, None (not needed) or False (invalid)."""
    if cat not in ("Events", "Marketplace"): return None
    if not isinstance(x, dict): return False
    if cat == "Events":
        dt, tm, loc = x.get("date"), x.get("time"), x.get("location")
        try: date.fromisoformat(dt)
        except (TypeError, ValueError): return False
        if not (isinstance(tm, str) and re.fullmatch(r"\d\d:\d\d", tm)): return False
        if not (isinstance(loc, str) and 1 <= len(loc.strip()) <= 60): return False
        return json.dumps({"date": dt, "time": tm, "location": loc.strip()})
    ct = x.get("contact")
    try: price = float(x.get("price"))
    except (TypeError, ValueError): return False
    if not (0 <= price <= 10_000_000) or not (isinstance(ct, str) and 1 <= len(ct.strip()) <= 60): return False
    return json.dumps({"price": price, "contact": ct.strip()})

@app.get("/api/posts")
def list_posts():
    cat, q = request.args.get("cat", "All"), request.args.get("q", "").strip()
    page = max(1, request.args.get("page", 1, type=int)); size = min(50, max(1, request.args.get("size", 6, type=int)))
    where, args = [], []
    if cat in CATS: where.append("p.category=?"); args.append(cat)
    if request.args.get("open") == "1": where.append("p.done=0")
    if request.args.get("mine") == "1":
        me_ = current_user()
        if not me_: return err("Please log in", 401)
        where.append("p.user_id=?"); args.append(me_["id"])
    order, sort = "p.created DESC", request.args.get("sort", "new")
    if sort == "pin": order = "(p.category='Announcements') DESC, p.created DESC"
    if sort == "event":  # upcoming events only, soonest first
        where.append("json_extract(p.extra,'$.date') >= ?"); args.append(date.today().isoformat())
        order = "json_extract(p.extra,'$.date'), json_extract(p.extra,'$.time'), p.created"
    if q: where.append("(p.title LIKE ? OR p.description LIKE ? OR p.menu LIKE ? OR p.extra LIKE ?)"); args += [f"%{q}%"] * 4
    w = ("WHERE " + " AND ".join(where)) if where else ""
    total = db().execute(f"SELECT COUNT(*) FROM posts p {w}", args).fetchone()[0]
    rows = db().execute(f"""SELECT p.*, u.name FROM posts p JOIN users u ON u.id=p.user_id {w}
                            ORDER BY {order} LIMIT ?""", args + [page * size]).fetchall()
    ids = [r["id"] for r in rows]; ups = {i: [] for i in ids}
    if ids:
        for v in db().execute(f"SELECT post_id,user_id FROM upvotes WHERE post_id IN ({','.join('?'*len(ids))})", ids):
            ups[v["post_id"]].append(v["user_id"])
    items = [{"id": r["id"], "t": r["title"], "d": r["description"], "c": r["category"], "ts": r["created"],
              "by": r["user_id"], "name": r["name"], "img": r["img"], "menu": json.loads(r["menu"]) if r["menu"] else None,
              "extra": json.loads(r["extra"]) if r["extra"] else None, "ups": ups[r["id"]], "done": bool(r["done"])} for r in rows]
    return jsonify(items=items, total=total)

@app.post("/api/posts")
@login_required
def create_post(u):
    d = request.get_json(silent=True) or {}
    t, desc, cat = (d.get("t") or "").strip(), (d.get("d") or "").strip(), d.get("c")
    if not 1 <= len(t) <= 80: return err("Title is required (max 80 characters)")
    if not 1 <= len(desc) <= 300: return err("Description is required (max 300 characters)")
    if cat not in CATS: return err("Invalid category")
    img = d.get("img") or None
    if img and (len(img) > 600_000 or not re.fullmatch(r"data:image/jpeg;base64,[A-Za-z0-9+/=]+", img)):
        return err("Invalid photo")
    menu = d.get("menu") if cat == "Free Food" else None
    if menu:
        items = menu.get("items") if isinstance(menu, dict) else None
        if (not isinstance(items, list) or not 1 <= len(items) <= 12
                or not all(isinstance(i, str) and 1 <= len(i.strip()) <= 40 for i in items)
                or menu.get("diet") not in DIETS):
            return err("Invalid menu")
        menu = json.dumps({"items": [i.strip() for i in items], "diet": menu["diet"]})
    else:
        menu = None
    if cat == "Announcements" and u["role"] != "admin":
        return err("Only admins can post announcements", 403)
    extra = clean_extra(cat, d.get("extra"))
    if extra is False: return err("Invalid details")
    cur = db().execute("INSERT INTO posts(title,description,category,created,user_id,img,menu,extra) VALUES(?,?,?,?,?,?,?,?)",
                       (t, desc, cat, int(time.time() * 1000), u["id"], img, menu, extra))
    db().commit()
    return jsonify(id=cur.lastrowid), 201

@app.post("/api/posts/<int:pid>/up")
@login_required
def upvote(u, pid):
    if not db().execute("SELECT 1 FROM posts WHERE id=?", (pid,)).fetchone(): return err("Not found", 404)
    if db().execute("DELETE FROM upvotes WHERE post_id=? AND user_id=?", (pid, u["id"])).rowcount == 0:
        db().execute("INSERT INTO upvotes VALUES(?,?)", (pid, u["id"]))
    db().commit(); return jsonify(ok=True)

def owned(u, pid):
    return db().execute("SELECT 1 FROM posts WHERE id=? AND user_id=?", (pid, u["id"])).fetchone()

@app.post("/api/posts/<int:pid>/done")
@login_required
def toggle_done(u, pid):
    if not owned(u, pid): return err("Only the author can do that", 403)
    db().execute("UPDATE posts SET done=1-done WHERE id=?", (pid,)); db().commit(); return jsonify(ok=True)

@app.delete("/api/posts/<int:pid>")
@login_required
def delete_post(u, pid):
    if not owned(u, pid): return err("Only the author can do that", 403)
    db().execute("DELETE FROM upvotes WHERE post_id=?", (pid,)); db().execute("DELETE FROM posts WHERE id=?", (pid,))
    db().commit(); return jsonify(ok=True)

@app.get("/api/stats")
def stats():
    c = db()
    return jsonify(posts=c.execute("SELECT COUNT(*) FROM posts").fetchone()[0],
                   users=c.execute("SELECT COUNT(*) FROM users").fetchone()[0],
                   res=c.execute("SELECT COUNT(*) FROM posts WHERE done=1").fetchone()[0])

init_db()

if __name__ == "__main__":
    app.run(debug=True)
