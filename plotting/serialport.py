import serial
from random import randint

# init: opens a serial port at port_name, sets read timeout to read_timeout seconds (default 0, non-blocking)
# write: writes an integer to the paired serial port
# read:
#   - reads x amount of bytes from the paired serial port
#   - blocks for read_timeout seconds
#   - returns None if nothing received
#   - returns received bytes otherwise
# list: returns a string detailing in and out waiting bytes
# close: closes the serial port
class Serialport:

    def __init__(self, port_name, read_timeout=0):
        self.ser = serial.Serial(port_name, timeout=read_timeout)
        print(f'Initialized serial port {self.ser.name}')
        
    def write(self, bytes_to_send=None):
        if bytes_to_send == None:
            bytes_to_send = randint(-10, 10)
        print(f'{self.ser.name} Writing: {bytes_to_send}')
        self.ser.write(int.to_bytes(bytes_to_send, signed=True))

    def read(self, num_bytes=1):
        bytes_read = self.ser.read(num_bytes)
        if bytes_read == b'':
            print(f'{self.ser.name} Received: None')
            return None
        received = int.from_bytes(bytes_read, signed=True)
        print(f'{self.ser.name} Received: {received}')
        return received

    def list(self):
        return f'{self.ser.name} Remaining bytes in waiting: {self.ser.in_waiting}\n{self.ser.name} Remaining bytes out waiting: {self.ser.out_waiting}'

    def close(self):
        print(f'{self.list()}\nClosing port {self.ser.name}...')
        self.ser.close()