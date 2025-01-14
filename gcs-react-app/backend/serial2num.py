import struct
"""
Processes binary serial data and converts it to a readable format using hexidecimal
(What I want to add: checksum,  more/better error handling, unit conversion, maybe calculate the difference for real time, also error logging)
(assume that a packet may look like: Header, Timestamp, Data1, Data2 ... Checksum)

Expected format:
- 1 byte: Sensor's starting key (in hexadeciaml)
- 1 byte(s): Number of data bytes following
- N bytes: Data values below

Sensors (in hexidecimal):
0xA1: IMU (6 bytes - 3 x 16-bit integer)
0xA2: High-G accelerometer (2 bytes - 1 x 16-bit integer)
0xA3: Low-G accelerometer (2 bytes - 1 x 16-bit integer)
0xA4: Gyroscope (6 bytes - 3 x 16-bit integers for x,y,z)
0xA5: Barometer (2 bytes - 1 x 16-bit integer)
0xA6: Magnetometer (6 bytes - 3 x 16-bit integers for x,y,z)
"""

SENSORS = {
        0xA1: "IMU",
        0xA2: "HIGH_G_ACCEL",
        0xA3: "LOW_G_ACCEL",
        0xA4: "GYROSCOPE",
        0xA5: "BAROMETER",
        0xA6: "MAGNETOMETER"
    }   

def serial2num(binary_file):

    processed_data = []

    with open(binary_file, 'rb') as file: # Opens a file in binary mode
        while True:
            # Reads for the sensor ID in the first byte
            sensor_id = file.read(1)
            if not sensor_id:
                break
            
            # read number of measurement values
            num_measurements = file.read(1)
            if not num_measurements:
                break

            # Reading the actual data
            # the data will be read in big-endian 
            # the int method below converts bytes into an integer
            # multiplied by two since the each data measurement is represented by two bytes
            data_length = int.from_bytes(num_measurements, 'big') * 2
            data_values = file.read(data_length) # reads the specified bytes by data_length from the file
            if len(data_values) < data_length: # checks if bytes being read is less than the expected data length
                break
            
            data_packet = sensor_id + num_measurements + data_values # creates a full packet of all the data read

            read_data = process_packet(data_packet) #puts the packet through error correction
            if read_data != None:
                processed_data.append(read_data)
    
    return processed_data


def binary_to_number(binary):
    # Function would convert 2 bytes to an integer (in a form working with raw binary data)
    # high_byte = holds the larger values as it is "shifted" to the left in binary representation
    # 16-bit integer:  10110101 01100010
    #                  High Byte   Low Byte
    # In this case, the function would shift the bits of a binary sequence to the left into high byte in 16-bit 
    # Dealing with big-endian data representation usually used from sensors 

    decimal = (binary[0] << 8) + binary[1] # High byte + Low byte 
    return decimal


def process_sensor_data(data):
    # The sensor ID helps know which sensor the data is coming from and tags each data point
    # Expects the input data to be a sequence of bytes
    # Let's say the first byte is the sensor ID to identify the specific sensor (which is in hexadecimal)
    sensor_id = data[0] 
    sensor_type = SENSORS.get(sensor_id, "unknown sensor") # Use the sensor ID to get the sensor type from dictionary
    num_measurements = data[1] # Second byte indicates the number of measurement values

    all_values = []
    if num_measurements == 1: # for single values
        measurement = binary_to_number(data[2:4]) # the next two bytes will be values that are reported from the sensor
        all_values.append(measurement)
    else:
        for i in range(num_measurements):
            starting_index = 2 + (i * 2)
            measurement = binary_to_number(data[starting_index:starting_index + 2]) # gives the data from the starting index
            all_values.append(measurement)

    return sensor_type, sensor_id, all_values


def process_packet(data):
    if len(data) < 3: # requires the sensor id and number of measurements
        return None
    
    sensor_id = data[0] # checks if the sensor_id is in the SENSORS dictionary
    if sensor_id not in SENSORS:
        return None
    
    num_measurements = data[1]
    if len(data) < (2 + num_measurements * 2): # Check if the data is enough
        return None
    
    else:
        return process_sensor_data(data) # returns the processed_sensor_data if passes the error checks


test_data = bytes([
    0xA1,  # Sensor ID for IMU
    0x03,  # Number of data values (3)
    0x00, 0x64,  # 100 (First value)
    0x00, 0xC8,  # 200 (Second value)
    0x01, 0x2C   # 300 (Third value)
])

# write to a binary file
with open('test_data.bin', 'wb') as f:
    f.write(test_data)

test = serial2num('test_data.bin')
print(test)