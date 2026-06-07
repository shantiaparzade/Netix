# NETIX - Corporate Website

## Project Overview

NETIX is a corporate website developed for providing network infrastructure services, technical support, network security solutions, and digital transformation consulting.

The website includes a contact form that allows users to submit their requests. Submitted requests are stored in the database and can be managed through the Django Admin Panel.

---

## Features

- Responsive user interface
- Dark / Light theme support
- Interactive network background animation
- Services section
- Projects section
- Contact form
- Database integration
- Django Admin Panel

---

## Technologies Used

### Backend

- Python
- Django

### Frontend

- HTML5
- CSS3
- JavaScript

### Database

- SQLite3

### Additional Packages

- django-daisy

---

## Required Packages

Install the required packages before running the project:

```bash
pip install django django-daisy
```

---

## Running the Project

Apply database migrations:

```bash
python manage.py migrate
```

Run the development server:

```bash
python manage.py runserver
```

Open the following address in your browser:

```text
http://127.0.0.1:8000/
```

---

## Admin Panel Access

Create a superuser:

```bash
python manage.py createsuperuser
```

Open the admin panel:

```text
http://127.0.0.1:8000/admin/
```

Log in using the created superuser credentials.

---

## Project Structure

```text
Netix/
│
├── Netix/
├── main/
├── static/
├── templates/
├── db.sqlite3
├── manage.py
└── README.md
```

---

## Repository

https://github.com/shantiaparzade/Netix.git

---

## Author

Shantia Parzade
