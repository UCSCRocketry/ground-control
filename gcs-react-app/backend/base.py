import eventlet
#eventlet.monkey_patch()

from flask import Flask, request
from flask_cors import CORS
from flask_socketio import SocketIO
from threading import Lock, Event
from Serialport import MockSerialport
from serial2num_PORT import serial2num
from generate_data import generate

api = Flask(__name__)
api.config['SECRET_KEY'] = 'secret!'
CORS(api, resources={r"/*": {"origins": "http://localhost:3000"}})     # allows requests to /api/ pages from origin localhost:3000 (frontend)
socketio = SocketIO(api, async_mode="eventlet", cors_allowed_origins="*", ping_interval=5, always_connect=True)

thread = None
thread_event = Event()
thread_lock = Lock()
thread_update = None

ser = None
state = {"BARO": [[], []],
         "GPS": [[], []],
         "ACCEL": [[], []],
         "GYRO": [[], []]}

queue = []
connected_users = 0

# TODO:
# - send graph state to frontend on connect
# - change update_data() to start on backend start, rather than first user connect
# - clean up backend structure (https://hackersandslackers.com/flask-application-factory/)

# generates randomized data from a serialport every 2 seconds
def update_data():
    global ser, queue
    while True:
        socketio.sleep(2)
        print("updated data!")
        generate(ser)
        data = serial2num(ser)
        for item in data:
            queue.insert(0, item)

# sends any data waiting in the queue to the frontend
def send_data(event):
    global thread, queue, state
    count = 0
    try:
        while event.is_set():
            socketio.sleep(1)
            while len(queue) > 0:
                count += 1
                print('Sending data...')
                with api.test_request_context('/'):
                    packet = queue.pop()
                    print(f'PACKET: {packet}')
                    state[packet[0]][0].extend(packet[3])
                    state[packet[0]][0][-5:]
                    state[packet[0]][1].extend([packet[1] for x in range(packet[2])])
                    state[packet[0]][1][-5:]
                    print(packet) 
                    socketio.emit(f'send_data_{packet[0]}',
                                {'label': 'Server generated event', 
                                'name': packet[0],
                                'time': packet[1],
                                'num': packet[2],
                                'data': packet[3],
                                'count': count})
    finally:
        event.clear()
        thread = None

def send_state():
    global state
    for s in state:
        socketio.emit(f'send_data_{s}',
                      {'label': 'Server generated event',
                       'name': s,
                       'time': state[s][1],
                       'num': len(state[s][0]),
                       'data': state[s][0]})

# inits threads on first connect and maintains connected_users
@socketio.on("connect")
def connect_msg():
    global thread, thread_update, connected_users, ser

    connected_users += 1
    print(request.sid)
    print(f'Client is connected! Current users: {connected_users}')

    send_state()

    if thread_update is None:
        ser = MockSerialport()
        thread_update = socketio.start_background_task(update_data)

    with thread_lock:
        if thread is None:
            print("Starting background thread...")
            thread_event.set()
            thread = socketio.start_background_task(send_data, thread_event)
    socketio.emit('connected', {'data': f"id: {request.sid} is connected."})

# stops send_data thread if no users are connected
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

# example GET route
@api.route('/api/test')
def testroute():
    data = {
        "velocity": 1,
        "accel": 2
    }

    return data

socketio.run(api, debug=True, port=9999)
