package fabric_remote_monitor;

import java.io.File;
import java.util.function.Consumer;

import net.minecraft.nbt.NbtCompound;
import net.minecraft.server.MinecraftServer;

public class ServerInterface {
    public ServerInterface(File configFolder, MinecraftServer server) {
        var config = ParseConfig.parseConfig(configFolder);

        var portMaybeNull = config.get("port");

        if (portMaybeNull == null) {
            port = 8080;
        } else {
            try {
                port = Integer.parseInt(portMaybeNull);
            } catch (Exception e) {
                port = 8080;
            }
        }

        thisThread = new SocketReaderThread(port, server);
        thisThread.start();
    }

    public void Close() {
        thisThread.Close();
    }

    public void listen(String channel, Consumer<NbtCompound> callback) {
        thisThread.listen(channel, callback);
    }

    public void sendMessage(String channel, NbtCompound data) {
        thisThread.sendMessage(channel, data);
    }

    private SocketReaderThread thisThread;
    private int port;
}
