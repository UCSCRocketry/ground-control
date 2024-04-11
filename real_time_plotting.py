import datetime as dt
import matplotlib.pyplot as plt
import matplotlib.animation as animation
from random import randint

# SEE MAIN FILE: test_rt_plotting.py
# This file is WIP:
#       - needs comments
#       - feel free to make improvements to code


class rt_plotter():

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

if __name__ == '__main__':
    rt1 = rt_plotter(10, 100)
    rt1.start()