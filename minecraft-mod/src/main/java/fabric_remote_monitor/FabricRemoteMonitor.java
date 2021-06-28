package fabric_remote_monitor;

import net.fabricmc.api.ModInitializer;
import net.fabricmc.fabric.api.event.lifecycle.v1.ServerLifecycleEvents;
import net.minecraft.server.MinecraftServer;
import net.minecraft.text.Text;

import org.apache.logging.log4j.Level;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import fabric_remote_monitor.fakes.MinecraftServerInterface;
import fabric_remote_monitor.util.Messages;

public class FabricRemoteMonitor implements ModInitializer {

    public static Logger LOGGER = LogManager.getLogger();

    public static final String MOD_ID = "fabric-remote-monitor";
    public static final String MOD_NAME = "fabric-remote-monitor";

    @Override
    public void onInitialize() {
        log(Level.INFO, "Initializing");

        ServerLifecycleEvents.SERVER_STARTED.register((MinecraftServer server) -> {
            log(Level.INFO, "YEEEE");

            MinecraftServerInterface serverAdditions = (MinecraftServerInterface)server;

            serverAdditions.constructServerInterface();

            ServerInterface serverInterface = serverAdditions.getServerInterface();

            serverInterface.Listen("MirrorMessage", (compound) -> {
                String text = compound.getString("message");
                Messages.BroadcastText(server, Text.of(text));
            });

            
        });

        ServerLifecycleEvents.SERVER_STOPPING.register((MinecraftServer server) -> {
            ((MinecraftServerInterface) server).getServerInterface().Close();
        });
    }

    public static void log(Level level, String message){
        LOGGER.log(level, "[{}] {}", MOD_NAME, message);
    }
}