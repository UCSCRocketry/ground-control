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

BARO_LEN = 1
GPS_LEN = 2
ACCEL_LEN = 4
GYRO_LEN = 2

PAYLOAD = {
    0x6261: BARO_LEN,
    0x6770: GPS_LEN,
    0x6163: ACCEL_LEN,
    0x726F: GYRO_LEN
}

CRC_DIVISOR = [1,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,1] #0b10001000000100001 (17 bits)
CRC_ZERO = [0 for i in range(16)] #0b0000000000000000 (16 bits)

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
        num_measurements = PAYLOAD.get(int.from_bytes(sensor_id, 'big'), None)
        if not num_measurements:
            break
        
        # Reading the actual data
        # the data will be read in big-endian 
        # the int method below converts bytes into an integer
        # multiplied by two since the each data measurement is represented by two bytes
        #data_length = int.from_bytes(num_measurements, 'big') * 2
        data_values = ser.read(num_measurements * 2) # reads the specified bytes by data_length from the file
        if len(data_values) < (num_measurements * 2): # checks if bytes being read is less than the expected data length
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

        data_packet = sensor_id + timestamp + data_values + crc # creates a full packet of all the data read

        read_data = process_packet(data_packet, num_measurements) #puts the packet through error correction
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
    for i in range(n):
        decimal += (binary[i] << (8 * (n - i - 1)))
        #print(f'D: {i}, {binary[i]}, {decimal}')
    return decimal


def process_sensor_data(data, num_measurements):
    # The sensor ID helps know which sensor the data is coming from and tags each data point
    # Expects the input data to be a sequence of bytes
    # Let's say the first byte is the sensor ID to identify the specific sensor (which is in hexadecimal)
    sensor_id = int.from_bytes(data[0:2], 'big') 
    sensor_type = SENSORS.get(sensor_id, "unknown sensor") # Use the sensor ID to get the sensor type from dictionary
    timestamp = int.from_bytes(data[2:6])

    all_values = []
    for i in range(num_measurements):
        starting_index = 6 + (i * 2)
        measurement = binary_to_number(data[starting_index:starting_index + 2], 2) # gives the data from the starting index
        all_values.append(measurement)

    return sensor_type, timestamp, num_measurements, all_values


def process_packet(data, num_measurements):
    print(len(data))
    if len(data) < 10: # requires the sensor id, timestamp, number of measurements and crc
        return None
    
    sensor_id = int.from_bytes(data[0:2]) # checks if the sensor_id is in the SENSORS dictionary
    if sensor_id not in SENSORS:
        return None
    
    if len(data) < (8 + num_measurements * 2): # Check if the data is enough
        return None
    
    if not crc_check(data):
        print("CRC ERROR!")
        return None
    
    else:
        return process_sensor_data(data, num_measurements) # returns the processed_sensor_data if passes the error checks

def crc_encode(data):
    bitarr = bytes_to_array(data)
    bitarr.extend(CRC_ZERO)
    #print(f'BEFORE ENCODE: {data}')
    offset = 0
    while (offset < len(bitarr) - 17):
        while (bitarr[offset] != 1 and offset < len(bitarr) - 17):
            offset += 1
        for j in range(17):
            bitarr[j + offset] = bitarr[j + offset] ^ CRC_DIVISOR[j]
        offset += 1
    #print(f'AFTER ENCODE: {datarr}')

    i = 0
    decimal_1 = 0
    decimal_2 = 0
    for j in range(7, -1, -1):
        decimal_1 += bitarr[-16 + i] * (2 ** j)
        decimal_2 += bitarr[-8 + i] * (2 ** j)
        i += 1

    crc = bytes()
    crc += decimal_1.to_bytes(1, 'big')
    crc += decimal_2.to_bytes(1, 'big')
    #print(f'AFTER ENCODE: {bytes_to_array(data)}')
    return crc

def crc_check(data):
    bitarr = bytes_to_array(data)
    #print(f'BEFORE CHECK: {bitarr}')
    offset = 0
    while (offset < len(bitarr) - 17):
        while (bitarr[offset] != 1 and offset < len(bitarr) - 17):
            offset += 1
        for j in range(17):
            bitarr[j + offset] = bitarr[j + offset] ^ CRC_DIVISOR[j]
        offset += 1
    #print(f'AFTER CHECK: {bitarr}')
    if (bitarr[-16::] == CRC_ZERO):
        return True
    
    return False

def bytes_to_array(data):
    arr = []
    for byte in data:
        for i in range(7, -1, -1):
            arr.append(1 if (byte & (1 << i)) != 0 else 0)
        #arr.append("BYTE END")
    return arr 
    