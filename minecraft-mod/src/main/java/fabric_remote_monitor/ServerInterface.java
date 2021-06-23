package fabric_remote_monitor;

import java.io.File;
import java.io.IOException;
import java.net.Socket;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.HashMap;
import java.util.function.Consumer;

import org.apache.logging.log4j.Level;

import net.fabricmc.fabric.api.networking.v1.PacketByteBufs;
import net.minecraft.nbt.NbtCompound;
import net.minecraft.network.PacketByteBuf;

public class ServerInterface implements Runnable {
    public ServerInterface(File configFolder) {
        var config = ParseConfig.parseConfig(configFolder);

        var portMaybeNull = config.get("port");
        int port;

        if (portMaybeNull == null) {
            port = 8080;
        } else {
            try {
                port = Integer.parseInt(portMaybeNull);
            } catch(Exception e) {
                port = 8080;
            }
        }

        try {
            socket = new Socket("127.0.0.1", port);

            FabricRemoteMonitor.log(Level.INFO, "CONNECTED!!!!");

            thisThread = new Thread(this);
            thisThread.start();
        } catch (IOException e) {
            FabricRemoteMonitor.log(Level.ERROR, "Failed to connect to connect to the config server, printing stack trace: ");

            e.printStackTrace();
        }
    }

    public void SendMessage(String channel, NbtCompound data) {
        if (socket == null) return;

        data.putString("channel", channel);

        PacketByteBuf buf = PacketByteBufs.create();
        buf.encode(NbtCompound.CODEC, data);

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

    public void Close() {
        try {
            socket.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public void run() {
        while (socket.isConnected()) {
            FabricRemoteMonitor.log(Level.INFO, "OEOFFFF");
            try {                
                for (byte newByte : socket.getInputStream().readAllBytes()) {
                    onByte(newByte);
                }
            } catch (IOException e) {
                Close();
                return;
            }
        }
    }

    private int currentLengthIndex = 0;
    private byte[] lengthBuffer = new byte[4];

    private int currentBytesLeft = 0;
    private byte[] currentPacket = new byte[0];

    private void onByte(byte newByte) {
        FabricRemoteMonitor.log(Level.INFO, "" + newByte);
        if (currentBytesLeft == 0) {
            if (currentLengthIndex != 4) {
                lengthBuffer[currentLengthIndex] = newByte;
                currentLengthIndex++;
            } else {
                currentLengthIndex = 0;

                var buffer = ByteBuffer.wrap(lengthBuffer);
                buffer.order(ByteOrder.BIG_ENDIAN);
                currentBytesLeft = buffer.getInt();

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
        var compound = buffer.decode(NbtCompound.CODEC);

        FabricRemoteMonitor.log(Level.INFO, compound.asString());
    }

    private Socket socket;
    private Thread thisThread;
    private HashMap<String, Consumer<String>> listeners = new HashMap<>();
}
