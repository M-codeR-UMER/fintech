import { getDefaultConfig } from "expo/metro-config";
import { withNativeWind } from "nativewind/metro";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const config = getDefaultConfig(__dirname);

export default withNativeWind(config, { input: "./global.css" });
