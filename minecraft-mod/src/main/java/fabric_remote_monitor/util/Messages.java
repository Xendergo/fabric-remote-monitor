package fabric_remote_monitor.util;

import net.minecraft.server.MinecraftServer;
import net.minecraft.server.network.ServerPlayerEntity;
import net.minecraft.text.Text;
import net.minecraft.util.Util;

public class Messages {
    public static void BroadcastText(MinecraftServer server, Text msg) {
        for (ServerPlayerEntity player : server.getPlayerManager().getPlayerList()) {
            player.sendSystemMessage(msg, Util.NIL_UUID);
        }
    }
}
