import real_time_plotting as rt_plt
import datetime as dt
import matplotlib.pyplot as plt

# READ:
# Use this file to compare different intervals for the animate method used in real_time_plotting.py
# Testing can easily take 5-15+ minutes, depending on settings.
# For a quick test run (~ 1 min), try:
#       - list_intervals = [10, 20, 30, 50, 75, 100]        (default)
#       - iterations = 100
#       - trials = 1

# I will try to add comments to both this file and real_time_plotting.py in the near future. -Michael Wu

# --- SETTINGS ---

list_intervals = [10, 20, 30, 50, 75, 100]          # a list of animate intervals to test, in milliseconds (ms)
iterations = 100                                    # num of times animate is called per trial
trials = 1                                          # num of trials per interval

# --- END OF SETTINGS ---

graph_data = []                                 # stores collected data from real_time_plotting.py


test_start = dt.datetime.now()

for interval in list_intervals:
    trial_avg = 0
    for i in range(trials):
        rt = rt_plt.rt_plotter(interval, iterations)
        trial_start = dt.datetime.now()
        rt.start()
        trial_end = dt.datetime.now()
        trial_avg += ((trial_end - trial_start).total_seconds() * 1000) / iterations
    trial_avg = round(trial_avg / trials, 5)

    print('INTERVAL: {0:<4} ms      AVERAGE: {1:<7} ms'.format(interval, trial_avg))

    graph_data.append(trial_avg)

test_end = dt.datetime.now()

print(f'Test complete. Time taken: {(test_end - test_start).total_seconds() / 60} minutes.')

fig = plt.figure()
ax = fig.add_subplot(1, 1, 1)
ax.plot(list_intervals, graph_data)

plt.title('Theoretical Interval vs Real Interval')
plt.ylabel('Real Interval (ms)')
plt.xlabel('Theoretical Interval (ms)')
plt.show()