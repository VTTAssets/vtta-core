import config from "./config/index.mjs";
import registerGameSettings from "./modules/registerGameSettings.mjs";
import stopNagging from "./modules/removeMinimumScreenResolutionError.mjs";

import registerAvailabilityQueryHandler from "./modules/registerAvailabilityQueryHandler.js";
import registerLogger from "./modules/logger.mjs";
import registerSettings from "./modules/settings/index.mjs";
import registerUI from "./modules/ui/index.mjs";
import registerImageTools from "./modules/image/index.mjs";

Handlebars.registerHelper("json", function (context) {
  return JSON.stringify(context);
});

Hooks.once("init", function () {
  CONFIG.debug.hooks = false;
  registerLogger();
  registerSettings();
  registerUI();
  registerImageTools();

  registerGameSettings();

  registerAvailabilityQueryHandler();

  stopNagging();
});

Hooks.once("ready", async function () {
  console.log("Showing MODAL");
  // const modal = new window.vtta.ui.Modal(
  //   "My title",
  //   $(
  //     '<div><p>This is a test</p><input type="text" name="range" /><p>This is a test</p><p><button class="vtta ui button" name="test">test</button></p><input type="range" min="0" max="100" step="5" name="transpacency" /></div>'
  //   ),
  //   ["OK", "CANCEL"]
  // );

  // let result = await modal.show();
  // console.log(result);
});
