from random import randint

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
        b = randint(1, 3)
        data = bytes([0x21])
        data += SENSORS[rsensor].to_bytes(2, 'big')
        data += timestamp.to_bytes(4, 'big')
        data += b.to_bytes(1, 'big')
        for j in range(b):
            data += int(randint(0, 512)).to_bytes(2, "big")
        data += (0x2A2B0D0A).to_bytes(4, 'big')
        ser.write(data)
