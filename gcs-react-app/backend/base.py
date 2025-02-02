import eventlet
#eventlet.monkey_patch()

from flask import Flask, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from threading import Lock, Event
from random import randint

api = Flask(__name__)
api.config['SECRET_KEY'] = 'secret!'
CORS(api, resources={r"/*": {"origins": "http://localhost:3000"}})     # allows requests to /api/ pages from origin localhost:3000 (frontend)
socketio = SocketIO(api, async_mode="eventlet", cors_allowed_origins="*", ping_interval=5, always_connect=True)

thread = None
thread_event = Event()
thread_lock = Lock()
thread_update = None

velocity = [0]
accel = [0]
connected_users = 0

# TODO: add queue for data to be sent to prevent duplicate sends
def update_data():
    global velocity, accel
    while True:
        socketio.sleep(2)
        print("updated data!")
        velocity.append(randint(-10, 10))
        accel.append(randint(-10, 10))
        velocity = velocity[-5:]
        accel = accel[-5:]


def background_thread(event):
    global velocity, accel, thread
    count = 0
    try:
        while event.is_set():
            socketio.sleep(2)
            count += 1
            print('Sending data...')
            with api.test_request_context('/'):         
                socketio.emit('send_data',
                            {'data': 'Server generated event', 
                            'velocity': velocity[-1],
                            'accel': accel[-1],
                            'count': count})
    finally:
        event.clear()
        thread = None

@socketio.on("connect")
def connect_msg():
    global thread, thread_update, connected_users

    connected_users += 1
    print(request.sid)
    print(f'Client is connected! Current users: {connected_users}')

    if thread_update is None:
        thread_update = socketio.start_background_task(update_data)

    with thread_lock:
        if thread is None:
            print("Starting background thread...")
            thread_event.set()
            thread = socketio.start_background_task(background_thread, thread_event)
    socketio.emit('connected', {'data': f"id: {request.sid} is connected."})


@socketio.on("disconnect")
def disconnect_msg():
    global thread, connected_users
    connected_users -= 1
    if (not connected_users):
        thread_event.clear()
        with thread_lock:
            if thread is not None:
                thread.join()
                thread = None
    print(f'Client disconnected! Current users: {connected_users}')

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

socketio.run(api, debug=True, port=9999)
