from flask import Flask
from flask_cors import CORS

api = Flask(__name__)
CORS(api, resources={r"/api/*": {"origins": r"http://localhost:3000"}})     # allows requests to /api/ pages from origin localhost:3000

@api.route('/api/test')
def testroute():
    data = {
        "velocity": 1,
        "accel": 2
    }

    return data