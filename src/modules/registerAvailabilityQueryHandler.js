import config from "../config/index.js";
import logger from "../util/logger.js";

import BugReport from "../apps/bugReport/index.js";

export default function () {
  /**
   * Reacting on other modules querying for core-existance
   */
  window.addEventListener(config.messaging.core.query, (event) => {
    logger.debug("[vtta-core] Received availability event", event);

    // let's grab the manifest Foundry provides for us
    const modInfo = game.modules.get(config.module.name).data;
    logger.debug("[vtta-core] Responding with verson number", modInfo.version);
    window.dispatchEvent(
      new CustomEvent(config.messaging.core.response, {
        detail: {
          version: modInfo.version,
        },
      })
    );
  });

  // register the default handler for all extension messages
  // window.addEventListener(config.messaging.extension.default, async (event) => {
  //   const message = event.detail.data;

  //   switch (message.type) {
  //     case "CONNECT":
  //       if (
  //         message.data &&
  //         message.data.user &&
  //         message.data.user.permissions &&
  //         Array.isArray(message.data.user.permissions) &&
  //         message.data.user.permissions.includes("reportBugs") === true
  //         //message.data.user.permissions.includes("none") === true
  //       ) {
  //         game.settings.set(
  //           config.module.name,
  //           "access_token",
  //           message.data.user.token
  //         );
  //         /**
  //          * Registering the bug report app
  //          */
  //         if (game.settings.menus.get("vtta-core.bug-report") === undefined) {
  //           game.settings.registerMenu(config.module.name, "bug-report", {
  //             type: BugReport,
  //             name: "BUGREPORT.vtta-core.name",
  //             label: "BUGREPORT.vtta-core.label",
  //             hint: "BUGREPORT.vtta-core.hint",
  //             restricted: true,
  //           });
  //         }
  //       }
  //       break;
  //   }
  // });
}
