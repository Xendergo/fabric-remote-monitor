package fabric_remote_monitor;

import java.io.File;
import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ParseConfig {
    public static Map<String, String> parseConfig(File configFolder) {
        File file = new File(configFolder, "FabricRemoteMonitor/config.txt");

        List<String> text;
        try {
            text = Files.readAllLines(file.toPath(), Charset.defaultCharset());
        } catch (IOException e) {
            e.printStackTrace();

            return new HashMap<>();
        }

        HashMap<String, String> ret = new HashMap<>();

        for (String line : text) {
            String[] split = Arrays.stream(line.split("\\s")).filter((str) -> str != "").toArray(String[]::new);

            if (split.length < 2) continue;

            ret.put(split[0].toLowerCase(), split[1]);
        }

        return ret;
    }
}
