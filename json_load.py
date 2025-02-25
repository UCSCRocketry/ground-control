import json
import psycopg2
from datetime import datetime

# Assuming JSON data will look something like this
# Also not totally sure about how the timestamp will be formatted
json_data = '''{
 "launch_id": 1,
 "metrics": [
   { "sensor_type": "IMU", "sensor_id": "A1", "values": [100, 200, 300], "unit": "m/s²" },
   { "sensor_type": "High-G Accelerometer", "sensor_id": "A2", "values": [500], "unit": "m/s²" },
   { "sensor_type": "Low-G Accelerometer", "sensor_id": "A3", "values": [250], "unit": "m/s²" },
   { "sensor_type": "Gyroscope", "sensor_id": "A4", "values": [50, -25, 100], "unit": "°/s" },
   { "sensor_type": "Barometer", "sensor_id": "A5", "values": [1013], "unit": "hPa" },
   { "sensor_type": "Magnetometer", "sensor_id": "A6", "values": [5, 10, -3], "unit": "µT" }
 ]
}'''

data = json.loads(json_data)
launch_id = data["launch_id"]

# Get current timestamp with date
current_datetime = datetime.now()
formatted_datetime = current_datetime.strftime("%Y-%m-%d %H:%M:%S")
timestamp = formatted_datetime

# Connect to PostgreSQL
connnection = psycopg2.connect("dbname=ground_control_systems user=postgres password=my_password host=localhost") # Change the password
cursor = connnection.cursor()

# Tries to insert the launch_id and our timestamp into the all_launches parent table
# But if the launch_id already exists in the table, don't do anything to avoid conflict
cursor.execute("INSERT INTO all_launches (launch_id, timestamp) VALUES (%s, %s) ON CONFLICT (launch_id) DO NOTHING", (launch_id, timestamp))

for metric in data["metrics"]: # loop through each metric source
   # extract sensor_type, sensor_id, values, and unit from each metric
   TODO
  
   # Make sure there is a value for each of the x, y, z columns
   # fill the empty column with None, and ensure there are no more than 3 values (x, y, z)
   x_value, y_value, z_value = (values + [None, None])[:3]

   # Insert (launch_id, sensor_type, sensor_id, x_value, y_value, z_value, unit) into the launch_metrics table
   TODO


# Commit and close
connnection.commit()
cursor.close()
connnection.close()