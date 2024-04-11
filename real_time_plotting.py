import datetime as dt
import matplotlib.pyplot as plt
import matplotlib.animation as animation
from random import randint

# SEE MAIN FILE: test_rt_plotting.py
# Contents:
#   - class rt_plotter (plots a single real time graph)
#   - class multi_rt_plotter (plots multiple real time graphs in one window)
# This file is WIP:
#       - needs comments
#       - feel free to make improvements to code

class rt_plotter:

    def __init__(self, interval=50, max_iterations=200):
        self.interval = interval
        self.max_iterations = max_iterations

        self.iteration = 0
        self.sensor = 0

        self.xs = []
        self.ys = []

        self.fig = plt.figure()
        self.ax = self.fig.add_subplot(1, 1, 1)

        self.ani = animation.FuncAnimation(self.fig, self.animate, interval=self.interval, cache_frame_data=False)

    def animate(self, i):
        self.update_sensor()

        self.xs.append(dt.datetime.now().strftime('%H:%M:%S.%f'))
        self.ys.append(self.sensor)

        self.xs = self.xs[-20:]
        self.ys = self.ys[-20:]

        self.ax.clear()
        self.ax.plot(self.xs, self.ys)

        plt.xticks(rotation=45, ha='right')
        plt.subplots_adjust(bottom=0.30)
        plt.title(f'Current Interval: {self.interval} ms')
        plt.ylabel('Sensor Data (random)')

        if self.iteration > self.max_iterations:
            self.ani.event_source.stop()
            plt.close()
        else:
            self.iteration += 1

    def update_sensor(self):
        self.sensor += randint(-3, 6)

    def start(self):
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
            plt.subplots_adjust(bottom=0.30)
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
    rt1 = multi_rt_plotter(4, 2, 2, 40, 100)
    rt1.start()