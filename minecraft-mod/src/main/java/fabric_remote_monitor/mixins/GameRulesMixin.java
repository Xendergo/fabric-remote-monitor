package fabric_remote_monitor.mixins;

import java.util.Map;

import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Shadow;

import fabric_remote_monitor.fakes.GameRulesInterface;
import net.minecraft.world.GameRules;

@Mixin(GameRules.class)
public abstract class GameRulesMixin implements GameRulesInterface {
    @Shadow
    private Map<GameRules.Key<?>, GameRules.Rule<?>> rules;

    public Map<GameRules.Key<?>, GameRules.Rule<?>> getRules() {
        return rules;
    }
}
