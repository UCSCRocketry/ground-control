from flask import Flask

api = Flask(__name__)

@api.route('/testroute')
def testroute():
    data = {
        "velocity": 1,
        "accel": 2
    }

    return data