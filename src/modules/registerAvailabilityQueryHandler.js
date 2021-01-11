import config from "../config/index.mjs";

export default function () {
  window.addEventListener(config.messaging.core.query, (event) => {
    console.log("[vtta-core] Received availability event", event);
    fetch("/modules/vtta-core/module.json")
      .then((response) => response.json())
      .then((json) => {
        console.log(
          "[vtta-core] Responding with verson number:" + json.version
        );
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
