# Campus Connect
Flask + SQLite backend, HTML/CSS/JS frontend.

    pip install -r requirements.txt
    python app.py        # open http://127.0.0.1:5000

Demo login: demo@campus.edu / demo1234
Structure: app.py (API + DB) · templates/index.html · static/style.css · static/script.js
For production set SECRET_KEY and run with gunicorn; swap SQLite for PostgreSQL if usage grows.
