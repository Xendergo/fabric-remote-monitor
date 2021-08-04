package fabric_remote_monitor;

import java.io.IOException;
import java.net.ConnectException;
import java.net.Socket;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;

import org.apache.logging.log4j.Level;

import fabric_remote_monitor.menus.Gamerules;
import net.fabricmc.fabric.api.networking.v1.PacketByteBufs;
import net.minecraft.nbt.NbtCompound;
import net.minecraft.network.PacketByteBuf;
import net.minecraft.server.MinecraftServer;

public class SocketReaderThread extends Thread {
    SocketReaderThread(ServerInterface serverInterface, int port, MinecraftServer server) {
        super();
        this.serverInterface = serverInterface;

        this.port = port;
        this.server = server;

        setName("Socket reader thread");
    }
    
    private Socket socket;
    private ServerInterface serverInterface;
    
    private int currentLengthIndex = 0;
    private byte[] lengthBuffer = new byte[4];

    private int currentBytesLeft = 0;
    private byte[] currentPacket = new byte[0];

    private int port;

    private MinecraftServer server;

    public void Close() {
        FabricRemoteMonitor.log(Level.INFO, "Closing socket");

        try {
            socket.close();

            socket = null;
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void run() {
        while (true) {
            while (socket != null && !socket.isClosed() && socket.isConnected()) {
                try {         
                    var nextByte = socket.getInputStream().read();

                    if (nextByte == -1) break;

                    onByte((byte) nextByte);
                } catch (IOException e) {
                    e.printStackTrace();
                    Close();
                }
            }

            currentLengthIndex = 0;
            currentBytesLeft = 0;

            await(1000);

            try {
                socket = new Socket("127.0.0.1", port);
            } catch (ConnectException e) {
                continue;
            } catch (IOException e) {
                FabricRemoteMonitor.log(Level.ERROR, "Failed to connect to connect to the web server, printing stack trace: ");
    
                e.printStackTrace();

                continue;
            }

            onConnect();
        }
    }

    private void onConnect() {
        Gamerules.onConnect(this, server);
    }

    private void await(long time) {
        try {
            Thread.sleep(time);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private void onByte(byte newByte) {
        FabricRemoteMonitor.log(Level.INFO, ((Byte) newByte).toString());

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

    public void sendMessage(String channel, NbtCompound data) {
        if (socket == null) return;

        data.putString("channel", channel);

        PacketByteBuf buf = PacketByteBufs.create();
        buf.writeNbt(data);

        var lenBuffer = ByteBuffer.allocate(4);
        lenBuffer.order(ByteOrder.BIG_ENDIAN);
        lenBuffer.putInt(0, buf.array().length);

        try {
            socket.getOutputStream().write(lenBuffer.array());
            socket.getOutputStream().write(buf.array());
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
