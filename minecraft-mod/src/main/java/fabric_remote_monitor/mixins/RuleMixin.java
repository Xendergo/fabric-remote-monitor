package fabric_remote_monitor.mixins;

import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Shadow;

import fabric_remote_monitor.fakes.RuleInterface;
import net.minecraft.world.GameRules.Rule;

@Mixin(Rule.class)
public abstract class RuleMixin implements RuleInterface {
    @Shadow
    public abstract void deserialize(String string);
}
