package fabric_remote_monitor.menus;

import fabric_remote_monitor.SocketReaderThread;
import fabric_remote_monitor.fakes.GameRulesInterface;
import fabric_remote_monitor.fakes.MinecraftServerInterface;
import fabric_remote_monitor.fakes.RuleInterface;
import net.minecraft.nbt.NbtCompound;
import net.minecraft.nbt.NbtList;
import net.minecraft.server.MinecraftServer;
import net.minecraft.world.GameRules;

public class Gamerules {
    private Gamerules() {}

    public static void onConnect(SocketReaderThread socket, MinecraftServer server) {
        var data = new NbtCompound();

        var gamerules = new NbtList();

        for (var rule : ((GameRulesInterface)server.getGameRules()).getRules().entrySet()) {
            var ruleData = new NbtCompound();

            ruleData.putString("name", rule.getKey().getName());
            ruleData.putString("default", rule.getValue().serialize());

            gamerules.add(ruleData);
        }

        data.put("gamerules", gamerules);

        socket.sendMessage("Gamerules", data);
    }

    public static void onRuleChange(NbtCompound data, MinecraftServer server) {
        var gamerule = data.getString("gamerule");
        var value = data.getString("value");

        GameRules.accept(new GameRules.Visitor() {
            @Override
            public <T extends GameRules.Rule<T>> void visit(GameRules.Key<T> key, GameRules.Type<T> type) {
				if (key.getName().equals(gamerule)) {
                    T rule = server.getGameRules().get(key);

                    try {
                        ((RuleInterface)rule).deserialize(value);
                    } finally {}

                    var serverAdditions = (MinecraftServerInterface)server;

                    var newData = new NbtCompound();

                    newData.putString("gamerule", gamerule);
                    newData.putString("value", rule.serialize());

                    serverAdditions.getServerInterface().sendMessage("ChangeGamerule", newData);
                }
			}
        });
    }
}
