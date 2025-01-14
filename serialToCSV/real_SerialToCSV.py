import serial
import csv

def RealSerialToCSV(port, baudrate, csv_filename):
    ser = serial.Serial(port, baudrate)   # creates a serial object with the specified port and baudrate
                                          # baudrate is how fast data is sent between the computer and the serial device. Common rates: 9600, 115200, and 57600
    with open(csv_filename, mode='w', newline='') as csv_file:
        writer = csv.writer(file)
        writer.writerow(["Date", "Time", "Temperature", "Speed"])   # writes the column names of the CSV file. Can be changed to whatever we need

        while True:
            if ser.in_waiting:   # if there is data waiting to be read from the serial port
                data = ser.readline().decode().strip()   # reads the data from the serial port and decodes it from bytes to a string and removes any leading/trailing whitespace
                dayAndTime = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())   # defines the current date and time in the format YYYY-MM-DD HH:MM:SS

                writer.writerow([timestamp, data])   # writes the serial data to the CSV file
                print(f"Logged data: {timestamp}, {data}")

read_serial_to_csv('COM3', 9600, 'serial_data.csv')   # will change as we need to test different ports and baudrates, and to write to different CSV files