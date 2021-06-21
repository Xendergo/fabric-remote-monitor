package fabric_remote_monitor;

import java.io.File;
import java.io.IOException;
import java.net.Socket;

import org.apache.logging.log4j.Level;

import net.fabricmc.fabric.api.networking.v1.PacketByteBufs;
import net.minecraft.nbt.NbtCompound;
import net.minecraft.network.PacketByteBuf;

public class ServerInterface {
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

        try {
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

    private Socket socket;
}
