import config from "./config/index.js";
import registerGameSettings from "./modules/registerGameSettings.js";
import stopNagging from "./modules/removeMinimumScreenResolutionError.js";

import registerAvailabilityQueryHandler from "./modules/registerAvailabilityQueryHandler.js";
import registerLogger from "./modules/logger.js";
import registerSettings from "./modules/settings/index.js";
import registerUI from "./modules/ui/index.js";
import registerImageTools from "./modules/image/index.js";

Handlebars.registerHelper("json", function (context) {
  return JSON.stringify(context);
});

Hooks.once("init", function () {
  CONFIG.debug.hooks = false;
  registerLogger();
  registerAvailabilityQueryHandler();
  registerSettings();
  registerUI();
  registerImageTools();

  registerGameSettings();

  stopNagging();
});

Hooks.once("ready", async function () {});
