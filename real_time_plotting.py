import datetime as dt
import matplotlib.pyplot as plt
import matplotlib.animation as animation
from random import randint

# SEE MAIN FILE: test_rt_plotting.py
# This file is WIP:
#       - needs comments
#       - feel free to make improvements to code

def read_sensor():
    global sensor
    sensor += randint(-3, 6)
    return sensor

# This function is called periodically from FuncAnimation
def animate(i, xs, ys, plot_interval, max_iterations):
    global ani, ax, iteration, sensor, time_end

    # Read sensor data
    sensor_data = read_sensor()

    # Add x and y to lists
    xs.append(dt.datetime.now().strftime('%H:%M:%S.%f'))
    ys.append(sensor_data)

    # Limit x and y lists to 20 items
    xs = xs[-20:]
    ys = ys[-20:]

    # Draw x and y lists
    ax.clear()
    ax.plot(xs, ys)

    # Format plot
    plt.xticks(rotation=45, ha='right')
    plt.subplots_adjust(bottom=0.30)
    plt.title(f'Current Interval: {plot_interval} ms')
    plt.ylabel('Sensor Data (random)')

    if iteration > max_iterations:
        time_end = dt.datetime.now()
        ani.event_source.stop()
        plt.close()
    else:
        iteration += 1

def init_visualizer(plot_interval, max_iterations=500):
    global ani, ax, sensor, iteration, time_start, time_end

    fig = plt.figure()
    ax = fig.add_subplot(1, 1, 1)
    xs = []
    ys = []
    sensor = 0
    iteration = 0

    time_start = dt.datetime.now()

    # Set up plot to call animate() function periodically
    ani = animation.FuncAnimation(fig, animate, fargs=(xs, ys, plot_interval, max_iterations), interval=plot_interval, cache_frame_data=False)
    plt.show()

    avg_time = (time_end - time_start ) / iteration
    #print(f'INTERVAL: {plot_interval}   AVERAGE: {avg_time}')
    return (plot_interval, avg_time)

if __name__ == '__main__':
    init_visualizer(100)
