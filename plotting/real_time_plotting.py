import matplotlib.pyplot as plt
import matplotlib.animation as animation
import serial
from random import randint

# https://learn.sparkfun.com/tutorials/graph-sensor-data-with-python-and-matplotlib/plot-sensor-data

# TESTER FILE: test_rt_plotting.py (tests actual vs. theoretical intervals)
# Contents:
#   - class rt_plotter (plots a single real time graph)
#   - class multi_rt_plotter (plots multiple real time graphs in one window)
#   - class serial_port (mock serial port)
#   - class multi_rt_plotter_deprectated (old code)
# Feel free to make improvements to code

# TODO:
#   - implement async in serial port code?
#       - asyncio docs: https://docs.python.org/3/library/asyncio.html
#       - pySerial asyncio: https://pythonhosted.org/pyserial/pyserial_api.html#module-serial.aio
#       - matplotlib event loops: https://matplotlib.org/stable/users/explain/figure/interactive_guide.html
#       - state machine?
#   - write real serial port code (two systems connected via one port, send/receive data over port)
#   - make graphs prettier!

# inputs:
#   - mock serial port of class serial_port
#   - interval (default 50)
#   - max iterations (default 200)
# output:
#   - a real time graph with randomized data from a mock serial port (see update_sensor() method)
class rt_plotter:

    def __init__(self, serialport, interval=50, max_iterations=200):
        self.serialport = serialport

        self.interval = interval
        self.max_iterations = max_iterations

        self.iteration = 0
        self.sensor = 0

        self.xs = [0.1]                                                # Temporary solution for xlim and ylim. Need to replace with better solution.
        self.ys = [0.1]

        self.fig, self.ax = plt.subplots()
        self.ln, = self.ax.plot([], [])
        self.ax.set_ylabel('Sensor Data (random)')
        self.ax.set_xlabel('Iteration')
        self.ax.set_title(f'Current Interval: {self.interval} ms')

        # animation component. cache_frame_data=False suppresses warnings, should test other options
        #   like max_frames to find most efficient settings.
        self.ani = animation.FuncAnimation(self.fig, self.animate, interval=self.interval, cache_frame_data=False, blit=False)

    # called every {interval} milliseconds
    def animate(self, i):
        self.update_sensor()                                            # update sensor data

        if (self.iteration > self.max_iterations):
            self.stop()
        else:
            self.iteration += 1

        #self.xs.append(dt.datetime.now().strftime('%H:%M:%S.%f'))      # update x data
        self.xs.append(self.iteration)
        self.ys.append(self.sensor)                                     # update y data

        self.xs = self.xs[-20:]                                         # limit x data to last 20 entries
        self.ys = self.ys[-20:]                                         # limit y data

        self.ax.set_xlim(min(self.xs), max(self.xs))                    
        self.ax.set_ylim(min(self.ys), max(self.ys))

        self.ln.set_data(self.xs, self.ys)                              # update plot

        #print(self.ln,)
        #return self.ln,                                                # required for blit = True

    def update_sensor(self):
        try:
            self.sensor = self.serialport.read()
        except:
            self.stop()

    def start(self):
        plt.subplots_adjust(bottom=0.30)
        plt.show()

    def stop(self):
        self.ani.event_source.stop()
        plt.close()

# inputs:
#   - matplotlib figure
#   - matplotlib axs by row and col
#   - mock serial port of class serial_port
#   - interval (default 50)
#   - max iterations (default 100)
# output:
#   - a real time graph with randomized data from a mock serial port (see update_sensor() method)
#   - graph will be displayed along other multi_rt_plotter that have been initialized
class multi_rt_plotter:

    def __init__(self, fig, ax, serialport, interval=50, max_iterations=100):
        self.fig = fig
        self.ax = ax
        self.serialport = serialport
        self.interval = interval
        self.max_iterations = max_iterations

        self.iteration = 0
        self.sensor = 0

        self.xs = [0.1]
        self.ys = [0.1]
        
        self.ln, = self.ax.plot([], [])
        self.ax.set_ylabel('Sensor Data (random)')
        self.ax.set_xlabel('Iteration')
        self.ax.set_title(f'Current Interval: {self.interval} ms')

        self.ani = animation.FuncAnimation(self.fig, self.animate, interval=self.interval, cache_frame_data=False, blit=False)
    
    def animate(self, i):
        self.update_sensor()                                            # update sensor data

        if self.iteration > self.max_iterations:
            self.stop()
        else:
            self.iteration += 1

        #self.xs.append(dt.datetime.now().strftime('%H:%M:%S.%f'))      # update x data
        self.xs.append(self.iteration)
        self.ys.append(self.sensor)                                     # update y data

        self.xs = self.xs[-20:]                                         # limit x data to last 20 entries
        self.ys = self.ys[-20:]                                         # limit y data

        self.ax.set_xlim(min(self.xs), max(self.xs))                    
        self.ax.set_ylim(min(self.ys), max(self.ys))

        self.ln.set_data(self.xs, self.ys)                              # update plot

        #print(self.ln,)
        #return self.ln,                                                # required for blit = True

    def update_sensor(self):
        try:
            self.sensor = self.serialport.read()
        except:
            self.stop()

    def stop(self):
        self.ani.event_source.stop()
        plt.close()

# mock serial port
# generates random bytes and writes them to the port on initialization
# ideally it would write bytes asynchronously while plotter code is running, but this hasn't been implemented yet
# ^ (see https://pythonhosted.org/pyserial/pyserial_api.html#module-serial.aio and https://docs.python.org/3/library/asyncio.html)
class serial_port:

    def __init__(self, min= -6, max= 10, num= 1000):
        self.ser = serial.serial_for_url('loop://')
        random_num = int
        print(f'Writing {num} bytes to port...')
        for i in range(num):
            random_num = randint(min, max)
            self.ser.write(int.to_bytes(random_num, signed=True))

    def read(self, num_bytes=1):
        if not self.ser.in_waiting:
            raise Exception
        received = int.from_bytes(self.ser.read(num_bytes), signed=True)
        print(f'Received: {received}')
        return received

    def close(self):
        print(f'Remaining bytes in port: {self.ser.in_waiting}\nClosing port...')
        self.ser.close()


if __name__ == '__main__':

    # init mock serial port
    ser = serial_port()

    # one real time plot using one mock serial port
    #rt = rt_plotter(ser)
    #rt.start()

    # four real time plots using one mock serial port
    fig, axs = plt.subplots(2, 2)
    plot1 = multi_rt_plotter(fig, axs[0][0], ser)
    plot2 = multi_rt_plotter(fig, axs[0][1], ser)
    plot3 = multi_rt_plotter(fig, axs[1][0], ser)
    plot4 = multi_rt_plotter(fig, axs[1][1], ser)
    plt.show()

    ser.close()

class multi_rt_plotter_deprecated(rt_plotter):
    # use plt.subplot_mosaic() method instead?

    def __init__(self, rows, cols, interval=50, max_iterations=200):
        self.num_plots = rows * cols

        self.interval = interval
        self.max_iterations = max_iterations

        self.iteration = 0
        self.sensor = [0 for i in range(self.num_plots)]

        self.xs = [[] for i in range(self.num_plots)]                                                # Temporary solution for xlim and ylim. Need to replace with better solution.
        self.ys = [[] for i in range(self.num_plots)]

        self.fig, self.axs = plt.subplots(rows, cols)
        self.ax_list = [self.axs[r][c] for r in range(rows) for c in range(cols)]
        self.lns = [0 for i in range(self.num_plots)]
        for i in range(self.num_plots):
            self.lns[i], = self.ax_list[i].plot([], [])
            self.ax_list[i].set_ylabel('Sensor Data (random)')
            self.ax_list[i].set_xlabel('Iteration')
            self.ax_list[i].set_title(f'Current Interval: {self.interval} ms')

        # animation component. cache_frame_data=False suppresses warnings, should test other options
        #   like max_frames to find most efficient settings.
        self.ani = animation.FuncAnimation(self.fig, self.animate, interval=self.interval, cache_frame_data=False, blit=False)
    
    def animate(self, i):

        for p in range(self.num_plots):
            self.update_sensor(p)

            self.xs[p].append(self.iteration)           # x axis is iteration instead of date b/c date was too messy for now
            self.ys[p].append(self.sensor[p])

            self.xs[p] = self.xs[p][-20:]
            self.ys[p] = self.ys[p][-20:]

            self.ax_list[p].set_xlim(min(self.xs[p]), max(self.xs[p]))                    
            self.ax_list[p].set_ylim(min(self.ys[p]), max(self.ys[p]))

            self.lns[p].set_data(self.xs[p], self.ys[p])                              # update plot

        if self.iteration > self.max_iterations:
            self.ani.event_source.stop()
            plt.close()
        else:
            self.iteration += 1
    
    def update_sensor(self, id):
        self.sensor[id] += randint(-3, 6)