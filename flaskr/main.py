from flask import Flask, request, render_template, g, current_app, redirect, url_for, make_response, flash, get_flashed_messages, session
from markupsafe import escape
from dotenv import load_dotenv
import click
import sqlite3
import os
import datetime

load_dotenv()

app = Flask(__name__)
app.config["DATABASE"] = os.path.join(app.instance_path, "database.sqlite")
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")


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
        session.pop("_flashes", None)
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

        if error is not None:
            flash(error)

        return redirect(url_for("index"))


    else:
        ua = request.user_agent.string.lower()
        if any(x in ua for x in ["android", "iphone", "ipad", "mobile"]):
            device_type = "mobile"
        else:
            device_type = "desktop"

        print(get_flashed_messages())
        username = request.cookies.get("username")
        if username is not None:
            db = get_db()
            time_lost = db.execute("SELECT * FROM user WHERE username = ?", (username,)).fetchone()
            if time_lost is None:
                resp = make_response(render_template("index.html")) if device_type == "desktop" else make_response(render_template("index_mob.html"))
                resp.delete_cookie("username")
                return resp
            else:
                from_date = time_lost["current_date"]
                return render_template("index.html", time=time_lost["time_value"], from_date=from_date) if device_type == "desktop" else render_template("index_mob.html", time=time_lost["time_value"], from_date=from_date)

            return render_template("index.html", time=time_lost["time_value"]) if device_type == "desktop" else render_template("index_mob.html", time=time_lost["time_value"])
        return render_template("index.html") if device_type == "desktop" else render_template("index_mob.html")

@app.route("/auth/register", methods=["POST"])
def register():
    session.pop("_flashes", None)
    error = None
    username = escape(request.form.get("username"))
    db = get_db()
    db_date = db.execute("SELECT * FROM user WHERE username = ?", (username,)).fetchone()
    if db_date:
        db_date = db_date["current_date"]

    user = db.execute("SELECT * FROM user WHERE username = ?", (username,)).fetchone()
    if user:
        resp = redirect(url_for("index"))
        resp.set_cookie(
            "username", username,
            max_age=60* 60*24*7, # 7 days
            httponly=False, # must be false so js could read it
            samesite="Lax"
        )
        return resp
    
    try:
        if db_date is None: 
            db.execute(
                "INSERT INTO user (username, time_value, current_date) VALUES (?, ?, ?)", (username, 0, datetime.date.today())
            )
            flash("Created an account at: "+ datetime.date.today().strftime("%d-%m-%Y"))
        else:
            db.execute(
                "UPDATE user SET username=?, time_value=? WHERE username=?", (username, 0)
            )

        db.commit()
    except Exception as e:
        error = "Something is up with the database. Try again later, it's not your fault. Fixing..."
        print("DB error creating user: " + str(e))

    if error is not None:
        flash(error)
        return redirect(url_for("index"))
    
    # set cookies
    resp = redirect(url_for("index"))
    resp.set_cookie(
        "username", username,
        max_age=60* 60*24*7, # 7 days
        httponly=False, # must be false so js could read it
        samesite="Lax"
    )

    return resp

@app.route("/drop/cookies", methods=["POST"])
def drop_cookies():
    resp = redirect(url_for("index"))
    resp.delete_cookie("username")
    flash("Cookies have been successfuly deleted")
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
