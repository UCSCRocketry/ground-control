import csv

UTILS_CSV_STATE = 0

def packetlist_to_csv(outfile, header, packetlist):

    if UTILS_CSV_STATE > 0: 
        with open(outfile, 'a', newline='') as f:
                writer = csv.DictWriter(f, header)
                writer.writerows([row for row in packetlist])
    else:
         with open(outfile, 'w', newline='') as f:
                writer = csv.DictWriter(f, header)
                writer.writeheader()
                writer.writerows([row for row in packetlist])

    UTILS_CSV_STATE += 1