from random import randint

SENSORS = [0xA1, 0xA2, 0xA3, 0xA4, 0xA5, 0xA6]

def generate(ser):
    n = randint(0, 6)
    rsensor = randint(0, 5)
    b = randint(1, 3)
    for i in range(n):
        data = bytes([
            SENSORS[rsensor],
            b
        ])
        for j in range(b):
            data += int(randint(0, 512)).to_bytes(2, "big")
        ser.write(data)