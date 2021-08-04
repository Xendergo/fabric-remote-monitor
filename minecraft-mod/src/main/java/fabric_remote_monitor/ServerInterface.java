package fabric_remote_monitor;

import java.io.File;
import java.util.HashMap;
import java.util.HashSet;
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

        thisThread = new SocketReaderThread(this, port, server);
        thisThread.start();
    }

    public void Close() {
        thisThread.Close();
    }

    public void Listen(String channel, Consumer<NbtCompound> callback) {
        listeners.computeIfAbsent(channel, key -> new HashSet<>());

        listeners.get(channel).add(callback);
    }

    public void OnPacket(NbtCompound compound) {
        String channel = compound.getString("channel");

        if (!listeners.containsKey(channel)) return;

        for (Consumer<NbtCompound> consumer : listeners.get(channel)) {
            consumer.accept(compound);
        }
    }

    private SocketReaderThread thisThread;
    private HashMap<String, HashSet<Consumer<NbtCompound>>> listeners = new HashMap<>();
    private int port;
}
