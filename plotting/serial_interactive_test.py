from serialport import Serialport

# REQUIRES TWO CONNECTED SERIAL PORTS
# You can use virtual serial ports (Windows/Mac: https://freevirtualserialports.com/, Linux: https://stackoverflow.com/questions/52187/virtual-serial-port-for-linux)
# Run two instances of this program, each should open 1 serial port
# Send and receive bytes using write and read commands

port_name = input('Enter the name of the port you want to open: ').strip().upper()

ser = Serialport(port_name)
print('Enter a command and an input (if applicable), separated by a space. "help" to see list of commands:')
while True:
    user_input = input().strip().lower()
    split_input = user_input.split()
    if user_input == 'q' or user_input == 'quit':
        break
    elif user_input == 'help':
        print('\nquit (or q): closes port\nwrite: writes input bytes (e.g. "write 3", writes "3")\nread: reads n bytes in port (e.g. "read 1", reads 1 byte\nlist: lists in and out waiting bytes\n')
    elif user_input == 'list':
        print(ser.list())
    elif split_input[0] == 'write':
        if len(split_input) > 1:
            bytes_to_send = int(split_input[1])
            ser.write(bytes_to_send)
        else:
            ser.write()
    elif split_input[0] == 'read':
        if len(split_input) > 1:
            bytes_to_read = int(split_input[1])
            ser.read(bytes_to_read)
        else:
            ser.read()

ser.close()
