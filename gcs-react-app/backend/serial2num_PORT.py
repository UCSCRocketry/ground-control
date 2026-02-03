from Serialport import Serialport, MockSerialport
import datetime
import csv

#START_BYTES = ('!', '"', '#', '$')

class Serial2Num():

    def __init__(
        self,
        storePackets=True,
        header=('seqid', 'id', 'timestamp', 'payload')
    ):
        self.START_BYTE_MIN = 0x21.to_bytes(length=1)
        self.START_BYTE_MAX = 0x24.to_bytes(length=1)
        self.END_BYTES = 0x0D0A.to_bytes(length=2)
        self.SENSOR_IDS = ('ba', 'gp', 'al', 'ah', 'ro', 'sc', 'im')
        self.packets_received = 0

        if storePackets:
            self.dt = datetime.datetime
            self.dfilename = self.dt.now().strftime('run_%Y-%m-%dT%H%M.csv')
            self.header = header

            with open(self.dfilename, 'w', newline='') as f:
                writer = csv.DictWriter(f, header)
                writer.writeheader()

        else:
            self.dt = None
            self.dfilename = None
            self.header = None
        
        self.packets_stored = 0

    def get_packets(
        self,
        ser: Serialport | MockSerialport,
        max_packets: int = -1
    ) -> list[dict]:
        """Get `max_packets` packets waiting in `ser`.

        If left unspecified, `max_packets` defaults to -1 ("as many as possible").

        Args:
            ser: The open Serialport object.
            max_packets: The number of packets to get.
        Returns:
            packetlist: The list of read packets, where each packet is a dict.
        """
        packetlist = []
        n = 0
        while max_packets == -1 or n < max_packets:
            packet = self.serial2json(ser)

            if packet == None:
                break
            elif packet.get('exit') != None:
                print(f'get_packets(): Discarded message')
            elif packet.get('error') != None:
                print(f'get_packets(): Error: {packet}')
                continue

            packetlist.append(packet)
            self.packets_received += 1
            n += 1
        
        return packetlist

    def serial2json(
        self,
        ser: Serialport | MockSerialport
    ) -> dict | None:
        """Convert a serial packet into dictionary (json) form, if the packet exists.

        Invalid packets are converted into a dictionary containing the key "error" and
        a description.

        Args:
            ser: The open Serialport object.
        Returns:
            packetdict: A dictionary representation of the packet, or None.
        """
        try:
            start_byte = ser.read(1)
            while start_byte != None and ((start_byte < self.START_BYTE_MIN) or (start_byte > self.START_BYTE_MAX)):
                print('serial2json: Start byte not found.')
                start_byte = ser.read(1)
            
            if start_byte == None:
                return None

            packet = start_byte + ser.read(31)

            # TODO: handle reading bytes while packet is being transmitted
            # TODO?: validate correctness of stop bytes
            if not packet or len(packet) != 32:
                print('serial2json: Received bad packet.')
                return {'error': 'Received bad packet'}
            
            res = self._crc_validate(data=packet[0:28], crc=packet[28:30])
            if not res:
                print('serial2json: Packet failed CRC check.')
                return {'error': 'Packet failed CRC check'}

            packetdict = self._process_packet(packet)
            if packetdict.get('error') != None:
                return packetdict

            match packetdict['start']:
                case '$':
                    # response expected
                    msg = 0x220D0A.to_bytes(length=3)
                    ser.write(msg)
                case '#':
                    # discard message
                    print(packetdict)
                    packetdict = {'exit': 'Discarded message'}
                case '"' | '!':
                    # acknowledgement | no response expected
                    pass
            
            packetdict.pop('start')

            return packetdict
            
        except Exception as e:
            print(f'serial2json(): Encountered exception: {e}')
            return {'error': {e}}

    def store_packets(
        self,
        packetlist: list
    ) -> None:
        """
        """
        with open(self.dfilename, 'a', newline='') as f:
            writer = csv.DictWriter(f, self.header)
            writer.writerows([row for row in packetlist])

        self.packets_stored += 1

    def _process_packet(
        self,
        packet: bytes
    ) -> dict:
        """Process a byte packet into dictionary (json) form.

        Returns a dictionary containing the key "error" and a
        corresponding description if an exception occurs during
        processing.

        Args:
            packet: The packet (in bytes) to be processed.
        Returns:
            packetdict: The processed packet.
        """
        packetdict = dict()
        try:
            packetdict['start'] = packet[0:1].decode('ascii')
            packetdict['seqid'] = int.from_bytes(packet[1:5])
            packetdict['id'] = packet[5:7].decode('ascii')
            if packetdict['id'] not in self.SENSOR_IDS:
                raise ValueError('Invalid sensor ID')
            packetdict['timestamp'] = int.from_bytes(packet[7:11])

            # parse packet payload (depends on sensor id)
            match packetdict['id']:
                case 'ro':
                    packetdict['payload'] = {'X': int.from_bytes(packet[14:18]),
                                            'Y': int.from_bytes(packet[19:23]),
                                            'Z': int.from_bytes(packet[24:28])}
                    
                case 'ba':
                    bindata = int.from_bytes(packet[11:28])
                    exp = bindata % 10
                    bindata -= exp
                    fp = bindata % 100
                    bindata -= fp
                    digit = bindata

                    packetdict['payload'] = (digit + (fp/10)) * (10**exp)

                case 'al' | 'ah' | _:
                    packetdict['payload'] = int.from_bytes(packet[11:28])

            if packet[30:32] != self.END_BYTES:
                raise ValueError('Missing end bytes')
            
            return packetdict
            
        except Exception as e:
            print(f'Encountered exception: {e}')
            return {'error': f'Exception: {e}'}

    def _crc_validate(
        self,
        data: bytes,
        crc: bytes
    ) -> bool:
        """Check if a sequence of bytes is CRC-16-CCITT valid.

        Args:
            data: A bytes object.
            crc: The two CRC bytes accompanying `data`.
        Returns:
            out: True if CRC-16-CCITT valid, False otherwise.
        """
        return self._crc_compute(data) == crc

    def _crc_compute(
        self,
        data: bytes
    ) -> bytes:
        """Generate the CRC-16-CCITTT error correction bytes for a given bytes object.

        Args:
            data: A bytes object.
        Returns:
            crc: The CRC error correction bytes for `data`.
        """
        crc = 0xFFFF    # TODO: 0x1D0F instead?
        for b in data:
            crc ^= b << 8
            for _ in range(8):
                if crc & 0x8000:
                    crc = ((crc << 1) ^ 0x1021) & 0xFFFF
                else:
                    crc = (crc << 1) & 0xFFFF
        return crc.to_bytes(length=2)

def test():
    s2n_conv = Serial2Num()

    start = int.to_bytes(0x21)
    seqid = int.to_bytes(0x00000001, length=4)
    id = int.to_bytes(0x726F, length=2)
    timestamp = int.to_bytes(0x00001011, length=4)
    payload = int.to_bytes(0x00005800000001590000004F6000000352, length=17)
    crc = s2n_conv._crc_compute(start+seqid+id+timestamp+payload)
    end = int.to_bytes(0x0D0A, length=2)
    dummy_packet = start+seqid+id+timestamp+payload+crc+end
    print((dummy_packet))
    ser = MockSerialport()
    ser.write(dummy_packet)
    res = s2n_conv.serial2json(ser)
    print(res)
    ser.close()

if __name__ == '__main__':
    test()