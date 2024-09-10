# Author: Dane
# This file produces artificial serial data for the purposes of simulating while we wait for real serial data
# (I could not find any samples of serial data online)

import random
import time
from time import strftime
from time import localtime
import serial
import csv

# This function produces one line of serial data in the format "MM/DD/YYYY, HH:MM:SS, temperature, speed" each time it is called
def produce_serial_line():
    date = strftime("%m/%d/%Y")   # defines the current date in the format MM/DD/YYYY (ex. 09/09/2024)
    current_time = strftime("%H:%M:%S", localtime())   # defines the current time in the format HH:MM:SS (ex. 23:59:59)
    random_temperature = round(random.uniform(0, 100), 2)   # defines the temperature as a random float between 0 and 100, rounded to 2 decimals
    random_speed = round(random.uniform(0, 700), 2)   # defines the speed as a random float between 0 and 700, rounded to 2 decimals
    
    data = f"{date}, {current_time}, {random_temperature}, {random_speed}\n" 
    return date, current_time, random_temperature, random_speed
        

def serialToCSV(csv_filename, date, current_time, random_temperature, random_speed):
    with open(csv_filename, mode='w', newline='') as csv_file:
        writer = csv.writer(csv_file)  # creates a CSV writer object
        writer.writerow(["Date", "Time", "Temperature", "Speed"])   # writes the column names of the CSV file
    
        time_to_end_loop = time.time() + 60 * 5   # sets a time limit of 5 minutes from current time 
        while time.time() < time_to_end_loop:   # while the current time is less than the time limit
            date, current_time, random_temperature, random_speed = produce_serial_line()   # assign the values of the serial data produced earlier to our variables
            writer.writerow([date, current_time, random_temperature, random_speed])  # writes the serial data to the CSV file
            time.sleep(1)   # waits 1 second before producing the next line of serial data

date, current_time, random_temperature, random_speed = produce_serial_line() 
serialToCSV('simulated_serial.csv', date, current_time, random_temperature, random_speed)  