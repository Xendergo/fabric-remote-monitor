package fabric_remote_monitor.mixins;

import java.util.UUID;
import java.util.function.Function;

import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Shadow;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

import fabric_remote_monitor.fakes.MinecraftServerInterface;

import org.spongepowered.asm.mixin.injection.At;

import net.minecraft.nbt.NbtCompound;
import net.minecraft.network.MessageType;
import net.minecraft.server.MinecraftServer;
import net.minecraft.server.PlayerManager;
import net.minecraft.server.network.ServerPlayerEntity;
import net.minecraft.text.Style;
import net.minecraft.text.Text;
import net.minecraft.text.TextColor;

@Mixin(PlayerManager.class)
public class PlayerManagerMixin {
    @Shadow
    private MinecraftServer server;

    @Inject(at = @At("HEAD"), method = "broadcastChatMessage")
    private void onChatMessage(Text message, MessageType type, UUID sender, CallbackInfo info) {
        SendToMirror(message);
    }
    
    @Inject(at = @At("HEAD"), method = "broadcast")
    private void onPlayerSendsMessage(Text serverMessage, Function<ServerPlayerEntity, Text> playerMessageFactory, MessageType playerMessageType, UUID sender, CallbackInfo info) {
        SendToMirror(serverMessage);
    }
    
    private void SendToMirror(Text message) {
        NbtCompound compound = new NbtCompound();
    
        compound.putString("message", message.getString());
    
        Style style = message.getStyle();
        
        int flags = 0;
    
        if (style != null) {
            flags |= style.isBold() ? 1 : 0;
            flags |= style.isItalic() ? 2 : 0;
            flags |= style.isUnderlined() ? 4 : 0;
            flags |= style.isStrikethrough() ? 8 : 0;
            flags |= style.isObfuscated() ? 16 : 0;
    
            TextColor color = style.getColor();
            flags |= color == null ? 0xffffff00 : color.getRgb() << 8;
        } else {
            flags = 0xffffff00;
        }
    
        compound.putInt("style", flags);
    
        ((MinecraftServerInterface)server).getServerInterface().SendMessage("MirrorMessage", compound);

    }
}
