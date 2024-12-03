import eventlet
eventlet.monkey_patch()

from flask import Flask, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from threading import Lock
from random import randint

api = Flask(__name__)
api.config['SECRET_KEY'] = 'secret!'
CORS(api, resources={r"/*": {"origins": "http://localhost:3000"}})     # allows requests to /api/ pages from origin localhost:3000 (frontend)
socketio = SocketIO(api, async_mode="eventlet", cors_allowed_origins="*", ping_interval=5, always_connect=True)

thread = None
thread_lock = Lock()

velocity = 0
accel = 0

def background_thread():
    global velocity, accel
    count = 0
    while True:
        socketio.sleep(5)
        count += 1
        velocity += randint(-3, 10)
        accel += randint(-3, 10)
        print('Sending data...')
        emit('send_data',
                      {'data': 'Server generated event', 
                       'velocity': velocity,
                       'accel': accel,
                       'count': count},
                       broadcast=True)

@socketio.on("connect")
def connect_msg():
    print(request.sid)
    print('Client is connected!')

    global thread
    with thread_lock:
        if thread is None:
            print("Starting background thread...")
            thread = socketio.start_background_task(background_thread())
    emit('connected', {'data': f"id: {request.sid} is connected."})
    

@socketio.on("disconnect")
def disconnect_msg():
    global thread
    thread = None
    print('Client disconnected!')

@socketio.on("reconnect")
def reconnect_msg():
    print('Client reconnected!')

@api.route('/api/test')
def testroute():
    data = {
        "velocity": 1,
        "accel": 2
    }

    return data

if __name__ == '__main__':
    socketio.run(api, debug=True, port=9999)