import registerGameSettings from "../modules/registerGameSettings.js";
import stopNagging from "../modules/removeMinimumScreenResolutionError.js";

import registerAvailabilityQueryHandler from "../modules/registerAvailabilityQueryHandler.js";
import registerLogger from "../modules/logger.js";
import registerSettings from "../modules/settings/index.js";
import registerUI from "../modules/ui/index.js";
import registerImageTools from "../modules/image/index.js";

const onceInit = () => {
  registerLogger();
  registerAvailabilityQueryHandler();
  registerSettings();
  registerUI();
  registerImageTools();

  registerGameSettings();

  stopNagging();
};

export default onceInit;
