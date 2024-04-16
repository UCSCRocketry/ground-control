import matplotlib.pyplot as plt
import matplotlib.animation as animation
from random import randint

# SEE MAIN FILE: test_rt_plotting.py
# Contents:
#   - class rt_plotter (plots a single real time graph)
#   - class multi_rt_plotter (plots multiple real time graphs in one window)
# Feel free to make improvements to code

# TODO:
#   - Update multi_rt_plotter to use same animation code as rt_plotter
#   - Clean up & improve rt_plotter code

# inputs:
#   - interval (default 50)
#   - max iterations (default 200)
# output:
#   - a real time graph with randomized data (see update_sensor() method)
class rt_plotter:

    def __init__(self, interval=50, max_iterations=200):
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

        #self.xs.append(dt.datetime.now().strftime('%H:%M:%S.%f'))      # update x data
        self.xs.append(self.iteration)
        self.ys.append(self.sensor)                                     # update y data

        self.xs = self.xs[-20:]                                         # limit x data to last 20 entries
        self.ys = self.ys[-20:]                                         # limit y data

        self.ax.set_xlim(min(self.xs), max(self.xs))                    # TODO: replace min(), max() with more efficient functions
        self.ax.set_ylim(min(self.ys), max(self.ys))

        self.ln.set_data(self.xs, self.ys)                              # update plot

        if self.iteration > self.max_iterations:
            self.ani.event_source.stop()
            plt.close()
        else:
            self.iteration += 1

        return self.ln,

    def update_sensor(self):
        self.sensor += randint(-3, 6)

    def start(self):
        plt.subplots_adjust(bottom=0.30)
        plt.show()

class multi_rt_plotter(rt_plotter):
    # use plt.subplot_mosaic() method instead?

    def __init__(self, num_plots, rows, cols, interval=50, max_iterations=200):
        self.num_plots = num_plots
        
        self.interval = interval
        self.max_iterations = max_iterations

        self.iteration = 0
        self.sensor = []

        self.xs = [[] for i in range(num_plots)]
        self.ys = [[] for i in range(num_plots)]

        self.fig = plt.figure()
        self.ax_list = []
        for i in range(1, num_plots + 1):
            self.sensor.append(0)
            self.ax_list.append(self.fig.add_subplot(rows, cols, i))

        self.ani = animation.FuncAnimation(self.fig, self.animate, interval=self.interval, cache_frame_data=False)
    
    def animate(self, i):

        for i in range(self.num_plots):
            self.update_sensor(i)

            self.xs[i].append(self.iteration)           # x axis is iteration instead of date b/c date was too messy for now
            self.ys[i].append(self.sensor[i])

            self.xs[i] = self.xs[i][-20:]
            self.ys[i] = self.ys[i][-20:]

            self.ax_list[i].clear()
            self.ax_list[i].plot(self.xs[i], self.ys[i])

            #self.ax_list[i].set_xticks(ticks=self.ax_list[i].get_xticks(), rotation=45, ha='right')
            self.ax_list[i].set_title(f'Current Interval: {self.interval} ms')
            self.ax_list[i].set_ylabel('Sensor Data (random)')

        if self.iteration > self.max_iterations:
            self.ani.event_source.stop()
            plt.close()
        else:
            self.iteration += 1
    
    def update_sensor(self, id):
        self.sensor[id] += randint(-3, 6)


if __name__ == '__main__':
    #rt1 = multi_rt_plotter(4, 2, 2, 40, 100)
    rt1 = rt_plotter(40, 100)
    rt1.start()