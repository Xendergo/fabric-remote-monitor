package fabric_remote_monitor.fakes;

import fabric_remote_monitor.ServerInterface;
import net.minecraft.server.MinecraftServer;

public interface MinecraftServerInterface {
    public void constructServerInterface(MinecraftServer server);
    public ServerInterface getServerInterface();
}
