import eventlet
#eventlet.monkey_patch()

from flask import Flask, request
from flask_cors import CORS
from flask_socketio import SocketIO
from threading import Lock, Event
from Serialport import MockSerialport, Serialport
from serial2num_PORT import Serial2Num
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
state = {"ba": [],      # barometer
         "ah": [],      # high-g accel
         "al": [],      # low-g accel
         "ro": []}      # gyroscope
gcs_seqid = 1

ser2Num = Serial2Num()

queue = []
connected_users = 0

# TODO:
# - change update_data() to start on backend start, rather than first user connect
# - clean up backend structure (https://hackersandslackers.com/flask-application-factory/)
# - customize callsign and send callsign out every so often

# generates randomized data from a serialport every 2 seconds
def update_data():
    global ser, queue
    while True:
        socketio.sleep(0.1)
        #print("Updated data!")
        #generate(ser)
        data = ser2Num.get_packets(ser, max_packets=-1)
        if len(data) > 0:
            #utils.packetlist_to_csv(DATAFILE, ('seqid', 'id', 'timestamp', 'payload'), data)
            ser2Num.store_packets(data)
        for packet in data:
            queue.insert(0, packet)

# sends any data waiting in the queue to the frontend
def send_data(event):
    global thread, queue, state
    #count = 0
    try:
        while event.is_set():
            socketio.sleep(0.250)
            send_data_ba = []
            send_data_ah = []
            send_data_al = []
            send_data_ro = []
            while len(queue) > 0:
                #count += 1
                packet = queue.pop()
                match packet['id']:
                    case 'ba':
                        send_data_ba.append(packet)
                    case 'ah':
                        send_data_ah.append(packet)
                    case 'al':
                        send_data_al.append(packet)
                    case 'ro':
                        send_data_ro.append(packet)
                    case _:
                        print('Unknown sensor id')
            
            # Update state and limit to last 10 packets
            state['ba'].extend(send_data_ba)
            state['ba'] = state['ba'][-10:]
            state['ah'].extend(send_data_ah)
            state['ah'] = state['ah'][-10:]
            state['al'].extend(send_data_al)
            state['al'] = state['al'][-10:]
            state['ro'].extend(send_data_ro)
            state['ro'] = state['ro'][-10:]

            with api.test_request_context('/'):
                num_ba = len(send_data_ba)
                num_ah = len(send_data_ah)
                num_al = len(send_data_al)
                num_ro = len(send_data_ro)
                if num_ba > 0:
                    print(f'Sending {num_ba} ba packets...')
                    socketio.emit(f'send_data_ba', send_data_ba)
                if num_ah > 0:
                    print(f'Sending {num_ah} ah packets...')
                    socketio.emit(f'send_data_ah', send_data_ah)
                if num_al > 0:
                    print(f'Sending {num_al} al packets...')
                    socketio.emit(f'send_data_al', send_data_al)
                if num_ro > 0:
                    print(f'Sending {num_ro} ro packets...')
                    socketio.emit(f'send_data_ro', send_data_ro)

    finally:
        event.clear()
        thread = None

def send_state():
    global state
    for key in state:
        for packet in state[key]:
            socketio.emit(f'send_data_{key}', packet)

@socketio.on('send_ping')
def send_ping():
    global ser, gcs_seqid
    packet = 0x24.to_bytes(length=1) + gcs_seqid.to_bytes(length=4) + 0x7072.to_bytes(length=2) + 0x0.to_bytes(length=4) + 0x0.to_bytes(length=17)
    gcs_seqid += 1
    crc = Serial2Num._crc_compute(packet)
    packet += crc + 0x0D0A.to_bytes(length=2)
    ser.write(packet)

@socketio.on('send_arm')
def send_arm():
    global ser, gcs_seqid
    packet = 0x24.to_bytes(length=1) + gcs_seqid.to_bytes(length=4) + 0x736D.to_bytes(length=2) + 0x0.to_bytes(length=4) + 0x1.to_bytes(length=17)
    gcs_seqid += 1
    crc = Serial2Num._crc_compute(packet)
    packet += crc + 0x0D0A.to_bytes(length=2)
    ser.write(packet)

@socketio.on('send_disarm')
def send_disarm():
    global ser, gcs_seqid
    packet = 0x24.to_bytes(length=1) + gcs_seqid.to_bytes(length=4) + 0x736D.to_bytes(length=2) + 0x0.to_bytes(length=4) + 0x0.to_bytes(length=17)
    gcs_seqid += 1
    crc = Serial2Num._crc_compute(packet)
    packet += crc + 0x0D0A.to_bytes(length=2)
    ser.write(packet)

# inits threads on first connect and maintains connected_users
@socketio.on("connect")
def connect_msg():
    global thread, thread_update, connected_users, ser

    connected_users += 1
    print(request.sid)
    print(f'Client is connected! Current users: {connected_users}')

    send_state()

    if thread_update is None:
        ser = Serialport('COM1', baud=57600)
        #ser = MockSerialport()
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
