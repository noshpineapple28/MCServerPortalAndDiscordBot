package nam6711.continuum.discordMessageApi;

import org.bukkit.plugin.java.JavaPlugin;

public final class DiscordMessageApi extends JavaPlugin {

    @Override
    public void onEnable() {
        // Plugin startup logic
        System.out.println("DISCORDCONTINUUM;Started!");
        getServer().getPluginManager().registerEvents(new DiscordListener(), this);
    }

    @Override
    public void onDisable() {
        // Plugin shutdown logic
        System.out.println("DISCORDCONTINUUM;Ended!");
    }
}
