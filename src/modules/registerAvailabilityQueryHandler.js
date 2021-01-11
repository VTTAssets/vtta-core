import config from "../config/index.mjs";
import GameSettings from "../apps/settings.mjs";

export default function () {
  window.addEventListener(config.messaging.core.query, (event) => {
    fetch("/modules/vtta-core/module.json")
      .then((response) => response.json())
      .then((json) => {
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
