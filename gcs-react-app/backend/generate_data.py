from random import randint
from serial2num_PORT import PAYLOAD, crc_encode

'''
SENSOR IDs:

BAROMETER:      ba  0x6261
GPS:            gp  0x6770
ACCELOMETER:    ac  0x6163
GYROSCOPE:      ro  0x726F

'''

SENSORS = [0x6261, 0x6770, 0x6163, 0x726F]

timestamp = 0

def generate(ser):
    global timestamp
    n = randint(0, 4)
    timestamp += randint(1000, 10000)
    for i in range(n):
        rsensor = randint(0, 3)
        timestamp += randint(50, 500)
        b = PAYLOAD.get(SENSORS[rsensor])
        #data = bytes([0x21])
        data = SENSORS[rsensor].to_bytes(2, 'big')
        data += timestamp.to_bytes(4, 'big')
        for j in range(b):
            data += int(randint(0, 512)).to_bytes(2, "big")
        data += crc_encode(data)
        data = 0x21.to_bytes(1, 'big') + data
        data += (0x0D0A).to_bytes(2, 'big')
        print(data)
        ser.write(data)

def generateTest(ser):
    timestampTEST = 1002321
    data = bytes([0x21])
    data += SENSORS[0].to_bytes(2, 'big')
    data += timestampTEST.to_bytes(4, 'big')
    b = PAYLOAD.get(SENSORS[0])
    for j in range(b):
        data += int(417).to_bytes(2, 'big')
    data += (0x2A2B0D0A).to_bytes(4, 'big')
    print(data)
    for item in data:
        print(item, end=" ")
    print("")
    ser.write(data)