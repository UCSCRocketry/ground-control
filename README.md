# Ground Control
UC Santa Cruz Rocket Team's ground control system.  

This project aims to create a ground control system that logs data collected during launch and is able to display real time data visualization and tracking of the rocket.

# REACT/FRONTEND INSTALLATION GUIDE

### 1. Pull/set this branch as your working directory (if it isn't already)

### 2. In the `gcs-react-app` folder, run the following command:

    npm install

There will likely be vulnerabilities in the installation. DO NOT WORRY ABOUT THEM FOR NOW.

### 3. Start the frontend:

    npm start

# FLASK/BACKEND INSTALLATION GUIDE

### 1. Pull/set this branch as your working directory (if it isn't already)

### 2. Navigate to the `backend` folder

    cd gcs-react-app/backend

### 3. You may want to create a virtual python environment to separate packages and versions.

Interpreter names may not match up to the ones listed below (e.g. "python" instead of "py")

    For mac/unix users: python3 -m venv env
    For windows users: py -m venv env

Then activate the environment:

    For mac/unix users: source env/bin/activate
    For windows users: .\env\Scripts\activate
    For bash on windows: source env/Scripts/activate

If you want to deactivate the environment, simply type into the terminal:

    deactivate

### 4. Install flask and its environment (make sure you are doing this with the virtual python environment active):

    pip install flask
    pip install python-dotenv
    pip install flask-cors          // this library allows us to route across domains (frontend <--> backend)

If you get an error about permissions when running pip (such as WinError2), try adding "--user" to the command like so:

    pip install flask --user

Note that the flask environment variables are stored in the `.flaskenv` file. The main flask app is currently set to `base.py`.

### 5. Try running flask:

    flask run --port 9999

Open up a browser and go to http://localhost:9999/api/test . You should see a JSON string!

### 6. Test backend-frontend connection:

Start up the backend and the frontend using the following commands (you will need to open two terminals):

    npm run start-backend           // no need to run this if your backend is still up!
    npm start                       // starts the frontend

Then navigate to http://localhost:3000/fetch . There should be a simple page displaying the values from the backend!
