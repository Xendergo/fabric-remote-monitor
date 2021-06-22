package fabric_remote_monitor.mixins;

import java.io.File;

import org.spongepowered.asm.mixin.Mixin;

import fabric_remote_monitor.ServerInterface;
import fabric_remote_monitor.fakes.MinecraftServerInterface;
import net.minecraft.server.MinecraftServer;

@Mixin(MinecraftServer.class)
public class MinecraftServerMixin implements MinecraftServerInterface {
    ServerInterface serverInterface;

    public void constructServerInterface() {
        serverInterface = new ServerInterface(new File("config"));
    }

    public ServerInterface getServerInterface() {
        return serverInterface;
    }
}
