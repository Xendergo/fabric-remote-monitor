package fabric_remote_monitor;

import java.io.IOException;
import java.net.Socket;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;

import org.apache.logging.log4j.Level;

import net.fabricmc.fabric.api.networking.v1.PacketByteBufs;

public class SocketReaderThread extends Thread {
    SocketReaderThread(Socket socket, ServerInterface serverInterface) {
        super();
        this.socket = socket;
        this.serverInterface = serverInterface;

        setName("Socket reader thread");
    }
    
    private Socket socket;
    private ServerInterface serverInterface;
    
    private int currentLengthIndex = 0;
    private byte[] lengthBuffer = new byte[4];

    private int currentBytesLeft = 0;
    private byte[] currentPacket = new byte[0];

    public void Close() {
        FabricRemoteMonitor.log(Level.INFO, "Closing socket");
        try {
            socket.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void run() {
        while (!socket.isClosed()) {
            try {                
                onByte((byte)socket.getInputStream().read());
            } catch (IOException e) {
                e.printStackTrace();
                Close();
                return;
            }
        }
    }

    private void onByte(byte newByte) {
        if (currentBytesLeft == 0) {
            if (currentLengthIndex != 4) {
                lengthBuffer[currentLengthIndex] = newByte;
                currentLengthIndex++;
            } 
            
            if (currentLengthIndex == 4) {
                currentLengthIndex = 0;

                var buf = ByteBuffer.wrap(lengthBuffer);
                buf.order(ByteOrder.BIG_ENDIAN);
                currentBytesLeft = buf.getInt(0);

                currentPacket = new byte[currentBytesLeft];
            }
        } else {
            currentPacket[currentPacket.length - currentBytesLeft] = newByte;
            currentBytesLeft--;
    
            if (currentBytesLeft == 0) {
                onPacket(currentPacket);
            }
        }
    }

    private void onPacket(byte[] packet) {
        var buffer = PacketByteBufs.create();

        buffer.capacity(packet.length);
        buffer.setBytes(0, packet);
        buffer.setIndex(0, packet.length);
        var compound = buffer.readNbt();

        FabricRemoteMonitor.log(Level.INFO, compound.asString());

        serverInterface.OnPacket(compound);
    }
}
