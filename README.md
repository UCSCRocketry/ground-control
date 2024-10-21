# ground-control
UC Santa Cruz Rocket Team's ground control system

This project aims to create a ground control system that logs data collected during launch and is able to display real time data visualization and tracking of the rocket.

# FLASK INSTALLATION GUIDE

### 1. Pull/set this branch as your working directory

### 2. Navigate to the `backend` folder

    cd backend

### 3. You may want to create a virtual python environment to separate packages and versions.

Interpreter names may not match up to the ones listed below (e.g. "python" instead of "py")

    For mac/unix users: python3 -m venv env
    For windows users: py -m venv env

Then activate the environment:

    For mac/unix users: source env/bin/activate
    For windows users: .\env\Scripts\activate

If you want to deactivate the environment, simply type into the terminal:

    deactivate

### 4. Install flask and its environment (make sure you are doing this with the virtual python environment active):

    pip install flask
    pip install python-dotenv
    
If you get an error about permissions when running pip (such as WinError2), try adding "--user" to the command like so:

    pip install flask --user

Note that the flask environment variables are stored in the `.flaskenv` file. The main flask app is currently set to `base.py`.

### 5. Try running flask

    flask run

Open up a browser and go to localhost:5000/testroute. You should see a JSON string!

