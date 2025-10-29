from Serialport import Serialport, MockSerialport

#START_BYTES = ('!', '"', '#', '$')
START_BYTE_MIN = 0x21.to_bytes(length=1)
START_BYTE_MAX = 0x24.to_bytes(length=1)
END_BYTES = 0x0D0A.to_bytes(length=2)
SENSOR_IDS = ('ba', 'gp', 'al', 'ah', 'ro', 'sc', 'im')

def get_packets(
    ser: Serialport | MockSerialport,
    max_packets: int = -1
) -> list[dict]:
    """
    """
    packetlist = []
    n = 0
    while n > max_packets:
        packet = serial2json(ser)

        if packet == None:
            break
        elif packet.get('error') != None:
            print(f'get_packets(): Error: {packet}')
            continue

        packetlist.append(packet)
        n += 1
    
    return packetlist

def serial2json(
    ser: Serialport | MockSerialport
) -> dict | None:
    """
    """
    try:
        start_byte = ser.read(1)
        while start_byte != None and ((start_byte < START_BYTE_MIN) or (start_byte > START_BYTE_MAX)):
            print('serial2json: Start byte not found.')
            start_byte = ser.read(1)
        
        if start_byte == None:
            return None

        packet = start_byte + ser.read(31)

        # TODO: handle reading bytes while packet is being transmitted
        if not packet or len(packet) != 32:
            print('serial2json: Received bad packet.')
            return {'error': 'Received bad packet'}
        
        res = crc_check(packet[1:30])
        if not res:
            print('serial2json: Packet failed CRC check.')
            return {'error': 'Packet failed CRC check'}
        
        packetdict = process_packet(packet)
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

def process_packet(
    packet: bytes
) -> dict:
    """
    """
    packetdict = dict()
    try:
        packetdict['start'] = packet[0:1].decode('ascii')
        packetdict['seqid'] = int.from_bytes(packet[1:5])
        packetdict['id'] = packet[5:7].decode('ascii')
        if packetdict['id'] not in SENSOR_IDS:
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

        if packet[30:32] != END_BYTES:
            raise ValueError('Missing end bytes')
        
        return packetdict
        
    except Exception as e:
        print(f'Encountered exception: {e}')
        return {'error': f'Exception: {e}'}

def crc_check(
    data: bytes
) -> bool:
    """
    """
    bitarr = bytes_to_bitarr(data)
    #print(f'BEFORE CHECK: {bitarr}')
    crc_divisor = [1,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,1]
    offset = 0
    while (offset < len(bitarr) - 17):
        while (bitarr[offset] != 1 and offset < len(bitarr) - 17):
            offset += 1
        for j in range(17):
            bitarr[j + offset] = bitarr[j + offset] ^ crc_divisor[j]
        offset += 1
    #print(f'AFTER CHECK: {bitarr}')
    if (bitarr[-16::] == [0 for i in range(16)]):
        return True
    
    return False

def bytes_to_bitarr(
    data: bytes
) -> list[int]:
    """
    Big endian
    """
    bitarr = []
    for byte in data:
        for i in range(7, -1, -1):
            bitarr.append(1 if (byte & (1 << i)) != 0 else 0)
        #bitarr.append("BYTE END")
    return bitarr

def crc_encode(
    data: bytes
) -> bytes:
    """
    """
    bitarr = bytes_to_bitarr(data)
    crc_divisor = [1,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,1]
    bitarr.extend([0 for i in range(16)])

    offset = 0
    while (offset < len(bitarr) - 17):
        while (bitarr[offset] != 1 and offset < len(bitarr) - 17):
            offset += 1
        for j in range(17):
            bitarr[j + offset] = bitarr[j + offset] ^ crc_divisor[j]
        offset += 1

    i = 0
    decimal_1 = 0
    decimal_2 = 0
    for j in range(7, -1, -1):
        decimal_1 += bitarr[-16 + i] * (2 ** j)
        decimal_2 += bitarr[-8 + i] * (2 ** j)
        i += 1

    crc = bytes()
    crc += decimal_1.to_bytes(1, 'big')
    crc += decimal_2.to_bytes(1, 'big')
    return crc

def test():
    start = int.to_bytes(0x21)
    seqid = int.to_bytes(0x00000001, length=4)
    id = int.to_bytes(0x726F, length=2)
    timestamp = int.to_bytes(0x00001011, length=4)
    payload = int.to_bytes(0x00005800000001590000004F6000000352, length=17)
    crc = crc_encode(seqid+id+timestamp+payload)
    end = int.to_bytes(0x0D0A, length=2)
    dummy_packet = start+seqid+id+timestamp+payload+crc+end
    print((dummy_packet))
    ser = MockSerialport()
    ser.write(dummy_packet)
    res = serial2json(ser)
    print(res)
    ser.close()

if __name__ == '__main__':
    test()