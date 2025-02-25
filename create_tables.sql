-- Each launch will have its own table
CREATE TABLE all_launches (
   launch_id SERIAL PRIMARY KEY,
   timestamp TIMESTAMP NOT NULL -- Day and time
);


-- Table to store the metrics from each launch
CREATE TABLE launch_metrics (
   metric_id SERIAL PRIMARY KEY,
   launch_id INT NOT NULL,
   sensor_type VARCHAR(100) NOT NULL,
   sensor_id VARCHAR(20) NOT NULL,
   x_value INT, -- Three value column for each row since some metrics have (x,y,z) data
   y_value INT,
   z_value INT,
   sensor_unit VARCHAR(50),
   -- column named 'timestamp' that stores current time if none is provided
   timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- when the metric was recorded
   -- If a launch is deleted from all_launches, all related rows in launch_metrics will also be deleted
   FOREIGN KEY (launch_id) REFERENCES all_launches(launch_id) ON DELETE CASCADE
);
