package fabric_remote_monitor.fakes;

import java.util.Map;

import net.minecraft.world.GameRules;

public interface GameRulesInterface {
    Map<GameRules.Key<?>, GameRules.Rule<?>> getRules();
}
