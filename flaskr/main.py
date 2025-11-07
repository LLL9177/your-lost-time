from flask import Flask, request, render_template, g, session, current_app, redirect, url_for
from markupsafe import escape
import click
import sqlite3
import os
from datetime import datetime

app = Flask(__name__)
app.config["DATABASE"] = os.path.join(app.instance_path, "database.sqlite")


def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(
            current_app.config["DATABASE"],
            detect_types=sqlite3.PARSE_DECLTYPES
        )
        g.db.row_factory = sqlite3.Row
    return g.db


def close_db(e=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    db = get_db()
    with app.open_resource("schema.sql") as f:
        db.executescript(f.read().decode("utf-8"))


@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        time = int(request.form.get("time_lost"))
        username = request.cookies.get("username")
        db = get_db()
        error = None

        user = db.execute("SELECT * FROM user WHERE username = ?", (username,)).fetchone()

        if user is None:
            error = "User not found in the database"
        else:
            time += user["time_value"]
            print(time, user["time_value"])

            try:
                db.execute(
                    "UPDATE user SET time_value = ? WHERE username = ?", (time, username)
                )
                db.commit()
            except Exception as e:
                print("DB error inserting time: " + str(e))
                error = "Something went wrong with the database. Not your fault probably. Fixing..."

        return error or "Success!"


    else:
        username = request.cookies.get("username")
        if username is not None:
            db = get_db()
            time_lost = db.execute("SELECT * FROM user WHERE username = ?", (username,)).fetchone()["time_value"]
            print(time_lost)
            return render_template("index.html", time=time_lost)
        return render_template("index.html")

@app.route("/auth/register", methods=["POST"])
def register():
    error = None
    username = escape(request.form.get("username"))
    db = get_db()
    try:
        db.execute(
            "INSERT INTO user (username, time_value) VALUES (?, ?)", (username, 0)
        )
        db.commit()
    except Exception as e:
        error = "Something is up with the database. Try again later, it's not your fault. Fixing..."
        print("DB error creating user: " + str(e))

    # set cookies
    
    if error is not None:
        return error
    
    resp = redirect(url_for("index"))
    resp.set_cookie(
        "username", username,
        max_age=60* 60*24*7, # 7 days
        httponly=False, # must be false so js could read it
        samesite="Lax"
    )

    return resp

@app.route("/drop/cookies")
def drop_cookies():
    resp = redirect(url_for("index"))
    resp.delete_cookie("username")
    return resp

@click.command("init-db")
def init_db_command():
    """Initialize the database using schema.sql"""
    init_db()
    click.echo("Initialized the database.")


sqlite3.register_converter(
    "timestamp", lambda v: datetime.fromisoformat(v.decode())
)


def init_app(app):
    app.teardown_appcontext(close_db)
    app.cli.add_command(init_db_command)


# Register teardown and CLI command automatically
init_app(app)

if __name__ == "__main__":
    app.run()
