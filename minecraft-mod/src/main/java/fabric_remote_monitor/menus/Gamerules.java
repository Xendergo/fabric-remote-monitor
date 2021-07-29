package fabric_remote_monitor.menus;

import fabric_remote_monitor.ServerInterface;
import fabric_remote_monitor.fakes.GameRulesInterface;
import net.minecraft.nbt.NbtCompound;
import net.minecraft.nbt.NbtList;
import net.minecraft.server.MinecraftServer;

public class Gamerules {
    public static void onConnect(ServerInterface socket, MinecraftServer server) {
        var data = new NbtCompound();

        var gamerules = new NbtList();

        for (var rule : ((GameRulesInterface)server.getGameRules()).getRules().entrySet()) {
            var ruleData = new NbtCompound();

            ruleData.putString("name", rule.getKey().getName());
            ruleData.putString("default", rule.getValue().serialize());
        }

        data.put("gamerules", gamerules);

        socket.SendMessage("Gamerules", data);
    }
}
