"""
Expected format:

Sensors:
Barometer:      ba  0x6261
GPS:            gp  0x6770
Accelometer:    ac  0x6163
Gyroscope:      ro  0x726F
"""

SENSORS = {
        0x6261: "BARO",
        0x6770: "GPS",
        0x6163: "ACCEL",
        0x726F: "GYRO"
    }

def serial2num(ser):

    processed_data = []    
    
    while True:
        # reads for the start byte
        start = ser.read(1)
        if not start:
            break
        start_int = int.from_bytes(start, 'big')
        if 0x21 > start_int or start_int > 0x24:
            break

        # read sensor id
        sensor_id = ser.read(2)
        if not sensor_id:
            break

        # read timestamp
        timestamp = ser.read(4)
        if not timestamp:
            break

        # read number of measurement values
        num_measurements = ser.read(1)
        if not num_measurements:
            break
        
        # Reading the actual data
        # the data will be read in big-endian 
        # the int method below converts bytes into an integer
        # multiplied by two since the each data measurement is represented by two bytes
        data_length = int.from_bytes(num_measurements, 'big') * 2
        data_values = ser.read(data_length) # reads the specified bytes by data_length from the file
        if len(data_values) < data_length: # checks if bytes being read is less than the expected data length
            break
        
        #print(f's:{int.from_bytes(sensor_id)}, n:{int.from_bytes(num_measurements)}, d:{data_values}')

        # read crc bytes
        crc = ser.read(2)
        if not crc:
            break
        
        # read end bytes
        end = ser.read(2)
        if not end:
            break

        endint = int.from_bytes(end, 'big')
        if endint != 0x0D0A:
            break

        data_packet = sensor_id + timestamp + num_measurements + data_values + crc # creates a full packet of all the data read

        read_data = process_packet(data_packet) #puts the packet through error correction
        if read_data != None:
            processed_data.append(read_data)
    
    return processed_data


def binary_to_number(binary, n):
    # Function would convert n bytes to an integer (in a form working with raw binary data)
    # high_byte = holds the larger values as it is "shifted" to the left in binary representation
    # 16-bit integer:  10110101 01100010
    #                  High Byte   Low Byte
    # In this case, the function would shift the bits of a binary sequence to the left into high byte in 16-bit 
    # Dealing with big-endian data representation usually used from sensors 

    decimal = 0
    for i in range(n - 1, -1, -1):
        decimal += (binary[i] << (8 * i))
    return decimal


def process_sensor_data(data):
    # The sensor ID helps know which sensor the data is coming from and tags each data point
    # Expects the input data to be a sequence of bytes
    # Let's say the first byte is the sensor ID to identify the specific sensor (which is in hexadecimal)
    sensor_id = int.from_bytes(data[0:2], 'big') 
    sensor_type = SENSORS.get(sensor_id, "unknown sensor") # Use the sensor ID to get the sensor type from dictionary
    timestamp = int.from_bytes(data[2:6])
    num_measurements = data[6] # Second byte indicates the number of measurement values

    all_values = []
    if num_measurements == 1: # for single values
        measurement = binary_to_number(data[7:9], 2) # the next two bytes will be values that are reported from the sensor
        all_values.append(measurement)
    else:
        for i in range(num_measurements):
            starting_index = 7 + (i * 2)
            measurement = binary_to_number(data[starting_index:starting_index + 2], 2) # gives the data from the starting index
            all_values.append(measurement)

    return sensor_type, timestamp, num_measurements, all_values


def process_packet(data):
    if len(data) < 11: # requires the sensor id, timestamp, number of measurements and crc
        return None
    
    sensor_id = int.from_bytes(data[0:2]) # checks if the sensor_id is in the SENSORS dictionary
    if sensor_id not in SENSORS:
        return None
    
    num_measurements = data[6]
    if len(data) < (9 + num_measurements * 2): # Check if the data is enough
        return None
    
    crc = data[-2:]
    if crc != b'*+':
        print("CRC ERROR!")
        return None
    
    else:
        return process_sensor_data(data) # returns the processed_sensor_data if passes the error checks