import random
from serial2num_PORT import Serial2Num

'''
SENSOR IDs:

BAROMETER:              ba  0x6261
HIGHG ACCELEROMETER:    ah  0x6168
LOWG ACCELEROMETER:     al  0x616C
GYROSCOPE:              ro  0x726F

'''

SENSORS = [0x6261, 0x6168, 0x616C, 0x726F]

timestamp = 0
seqid = 0
last_ba = 1013.25
last_ah = 1000
last_al = 1000
last_ro = {"X": 0, "Y": 0, "Z": 0}
ser2Num = Serial2Num(storePackets=False)

def generate(ser):
    global timestamp, seqid, last_ba, last_ah, last_al, last_ro, ser2Num
    n = random.choices([0, 1, 2, 3, 4, 5], weights=[10, 20, 40, 50, 50, 40])[0]
    timestamp += random.randint(1000, 10000)
    for i in range(n):
        seqid += (random.choices([1,2,3], weights=[90, 10, 5])[0])
        rsensor = random.randint(0, 3)
        sensorid = SENSORS[rsensor].to_bytes(length=2)
        timestamp += random.randint(50, 500)
        if rsensor == 3:    # ro
            payload = 0x000058.to_bytes(length=3)
            last_ro["X"] = max(0, last_ro["X"] + random.randint(-20, 20))
            last_ro["Y"] = max(0, last_ro["Y"] + random.randint(-20, 20))
            last_ro["Z"] = max(0, last_ro["Z"] + random.randint(-50, 50))
            rX = last_ro["X"].to_bytes(length=4)
            rY = last_ro["Y"].to_bytes(length=4)
            rZ = last_ro["Z"].to_bytes(length=4)
            payload += rX + 0x59.to_bytes(length=1) + rY + 0x60.to_bytes(length=1) + rZ
        elif rsensor == 0:  # ba
            last_ba = max(300, last_ba + random.uniform(-1.5, 1.5))
            payload = int(last_ba).to_bytes(length=17)
        else:   # ah, al
            if rsensor == 1:  # ah
                last_ah = max(0, last_ah + random.randint(-50, 50))
                payload = last_ah.to_bytes(length=17)
            else:  # al
                last_al = max(0, last_al + random.randint(-25, 25))
                payload = last_al.to_bytes(length=17)
        
        packet = bytes()
        packet += seqid.to_bytes(length=4) + sensorid + timestamp.to_bytes(length=4) + payload
        crc = ser2Num._crc_encode(packet)

        start = 0x21.to_bytes(length=1)
        end = 0x0D0A.to_bytes(length=2)

        packet = start + packet + crc + end
        ser.write(packet)
        # print(f'Writing: seqid: {seqid}, id: {sensorid}, timestamp: {timestamp}, payload: {payload}')
