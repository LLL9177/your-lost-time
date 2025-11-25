from flask import Flask, request, render_template, g, current_app, redirect, url_for, make_response, flash, get_flashed_messages, session, jsonify
from markupsafe import escape
from dotenv import load_dotenv
import click, sqlite3, os, datetime, json

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

def convert_time_to_string(total_minutes):
    # quick single-unit cases
    if total_minutes < 60:
        return f"{total_minutes}m"
    if total_minutes == 60:
        return "1h"

    # compute breakdown
    minutes = total_minutes % 60
    hours_total = total_minutes // 60

    if hours_total < 24:
        # only hours (+ minutes if any)
        hours = hours_total
        parts = []
        if hours: parts.append(f"{hours}h")
        if minutes: parts.append(f"{minutes}m")
        return " ".join(parts)

    # days/weeks path
    days_total = hours_total // 24
    hours = hours_total % 24

    if days_total < 7:
        # days + maybe hours (omit hours if 0)
        parts = []
        if days_total: parts.append(f"{days_total}D")
        if hours: parts.append(f"{hours}h")
        # optionally include minutes if you want sub-hour detail:
        if minutes: parts.append(f"{minutes}m")
        return " ".join(parts)

    # weeks and leftover days/hours/minutes
    weeks = days_total // 7
    days = days_total % 7
    parts = []
    if weeks: parts.append(f"{weeks}W")
    if days: parts.append(f"{days}D")
    if hours: parts.append(f"{hours}h")
    if minutes: parts.append(f"{minutes}m")
    return " ".join(parts)
    

@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        session.pop("_flashes", None)
        time = int(request.form.get("time_lost"))
        username = request.cookies.get("username")
        db = get_db()
        error = None

        user = db.execute("SELECT * FROM user WHERE username = ?", (username,)).fetchone()
        day_data = db.execute("SELECT * FROM days WHERE username = ?", (username,)).fetchone()

        if user is None:
            error = "User not found in the database"
        else:
            time += user["time_value"]
            now = datetime.datetime.now().strftime("%H:%M")
            today = datetime.datetime.today().strftime("%d:%m:%Y")
            day_data = json.loads(day_data["day_data"])
            print(day_data)
            if day_data != {} and now in day_data:
                day_data_value = day_data[today][now] + time
            else:
                day_data_value = time

            if today not in day_data:
                day_data[today] = {}

            day_data[today][now] = day_data_value
            day_data = json.dumps(day_data)

            try:
                db.execute(
                    "UPDATE user SET time_value = ? WHERE username = ?", (time, username)
                )

                db.execute(
                    "UPDATE days SET day_data = ? WHERE username = ?", (day_data, username)
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

# This will be sent by JavaScript so instead of flashing messages, we will just return them.
@app.route('/get/day-data', methods=['POST', 'GET'])
def get_day_data():
    if request.method == "POST":
        username = request.json.get("username")
        error = None

        if username:
            db = get_db()
            data = db.execute("SELECT * FROM days WHERE username = ?", (username,)).fetchone()["day_data"]
            data = json.loads(data)

            for obj in data.values():
                for time in obj.values():
                    time = convert_time_to_string(time)

            data = jsonify(data)
        else:
            error = "Something went wrong. Sorry, but you won't get your losses book."
        
        if error is not None:
            return error
        
        return data

    flash("Method not allowed.")
    return redirect(url_for("index"))

@app.route("/auth/register", methods=["POST"])
def register():
    session.pop("_flashes", None)
    error = None
    username = escape(request.form.get("username")).strip()
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
                "INSERT INTO user (username, time_value, current_date) VALUES (?, ?, ?)", 
                (username, 0, datetime.date.today())
            )

            day_data_json = json.dumps({})
            db.execute(
                "INSERT INTO days (username, day_data) VALUES (?, ?)",
                (username, day_data_json)
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
