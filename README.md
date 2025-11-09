# Your Lost Time

A minimalist web application that helps you track time you've lost or wasted. Built with Flask, SQLite, and modern web technologies.

## Features

- **User Registration**: Simple username-based authentication system
- **Time Tracking**: Track lost time in minutes and view total in hours and minutes
- **Beautiful UI**: 
  - Random background images for visual variety
  - Elegant typography using Radley and Momo Signature fonts
  - Smooth transitions and animations
  - Responsive flash messages with progress bar
  - Mobile-friendly design that works on phones and tablets
- **Persistent Storage**: Data stored in SQLite database
- **Cookie-based Authentication**: 7-day session persistence

## Setup

1. Create a virtual environment and activate it:
```bash
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file in the project root with:
```
SECRET_KEY=your_secret_key_here
```

4. Initialize the database (from flaskr):
```bash
flask --app main init-db
```

5. Run the application (from flaskr):
```bash
python main.py
```

## Usage

1. Visit the website and register with a username
2. Enter the amount of time (in minutes) you've lost today
3. View your accumulated lost time displayed in hours and minutes
4. Use the "Register or log in again" button below to switch accounts

## Project Structure

- `flaskr/`: Main application directory
  - `main.py`: Flask application and routes
  - `schema.sql`: Database schema
  - `static/`: Static files (CSS, JS, images)
  - `templates/`: HTML templates
  - `instance/`: Database file location (created on initialization)

## Technologies Used

- **Backend**:
  - Flask (Python web framework)
  - SQLite (Database)
  - python-dotenv (Environment management)
  
- **Frontend**:
  - Vanilla JavaScript
  - CSS3 with modern features (flexbox, transitions, backdrop-filter)
  - Custom fonts (Radley, Momo Signature)

## Note

This project is designed to help users be mindful of their time usage by tracking "lost time". It can be used as a personal tool for time management and self-awareness. The point is that you can see how much time you lost and you go like, "omg i'm so shit" (happens most of the times). But if you want to use something like this, you will first have to create a habit of tracking (You will use simple notebook right?).