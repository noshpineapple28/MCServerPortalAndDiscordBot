package nam6711.continuum.discordMessageApi;

import org.bukkit.damage.DamageSource;
import org.bukkit.entity.LivingEntity;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.entity.EntityDeathEvent;
import org.bukkit.event.entity.EntityPickupItemEvent;
import org.bukkit.event.entity.PlayerDeathEvent;
import org.bukkit.event.player.AsyncPlayerChatEvent;
import org.bukkit.event.player.PlayerAdvancementDoneEvent;

public class DiscordListener implements Listener {

    @EventHandler
    public void onPlayerAdvancementDoneEvent(PlayerAdvancementDoneEvent event) {
        String info = "DISCORDCONTINUUM;ADVANCEMENT;";
        info += event.getPlayer().getDisplayName();
        info += ";";
        info += event.getAdvancement().getDisplay().getTitle();
        info += ";";
        info += event.getAdvancement().getDisplay().getDescription();
        System.out.println(info);
    }

    @EventHandler
    public void onPlayerDeathEvent(PlayerDeathEvent event) {
        String info = "DISCORDCONTINUUM;DEATH;";
        info += event.getEntity().getDisplayName();
        info += ";";
        info += event.getDeathMessage();
        System.out.println(info);
    }

    @EventHandler
    public void onPlayerMessageEvent(AsyncPlayerChatEvent event) {
        String info = "DISCORDCONTINUUM;MESSAGE;";
        info += event.getPlayer().getDisplayName();
        info += ";";
        info += event.getMessage();
        System.out.println(info);
    }

    @EventHandler
    public void onEntityDeathEvent(EntityDeathEvent event) {
        String info = "DISCORDCONTINUUM;ENTITYKILLEVENT;";
        info += event.getEntity().getName();
        info += ";";
        info += event.getDamageSource().getCausingEntity().getName();
        System.out.println(info);
    }

    @EventHandler
    public void onEntityPickupItemEvent(EntityPickupItemEvent event) {
        String info = "DISCORDCONTINUUM;ENTITYITEMPICKUPEVENT;";
        info += event.getEntity().getName();
        info += ";";
        info += event.getItem().getName();
        System.out.println(info);
    }
}
