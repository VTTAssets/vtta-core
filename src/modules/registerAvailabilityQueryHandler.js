import config from "../config/index.js";
import logger from "../util/logger.js";

export default function () {
  window.addEventListener(config.messaging.core.query, (event) => {
    logger.debug("[vtta-core] Received availability event", event);
    fetch("/modules/vtta-core/module.json")
      .then((response) => response.json())
      .then((json) => {
        logger.debug("[vtta-core] Responding with verson number", json.version);
        window.dispatchEvent(
          new CustomEvent(config.messaging.core.response, {
            detail: {
              version: json.version,
            },
          })
        );
      });
  });
}
