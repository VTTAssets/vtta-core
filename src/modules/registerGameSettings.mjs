import config from "../config/index.mjs";
import GameSettings from "../apps/settings.mjs";

//const DEFAULT_IMAGE_PROXY = "https://vttassets.eu.ngrok.io/dl/%URL%";
const DEFAULT_IMAGE_PROXY = "https://i.vtta.io/dl/%URL%";

export default function () {
  /**
   * Registering the settings menu for VTTA
   */
  game.settings.registerMenu(config.module.name, "settings", {
    type: GameSettings,
    name: "SETTINGS.name",
    label: "SETTINGS.label",
    hint: "SETTINGS.hint",
    retricted: true,
  });

  /**
   * Image Download Proxy
   * If you want to use your own image download CORS proxy, set a config in-game manually:
   * game.settings.set('vtta-core', 'proxy', 'https://someproxy.ru/get?url=%URL%');
   *
   * The downloadable URL will be url encoded and appended to the configured host
   * at %URL%
  //  */
  // game.settings.register(config.module.name, "proxy", {
  //   type: String,
  //   retricted: true,
  //   scope: "world",
  //   config: false,
  //   default: DEFAULT_IMAGE_PROXY,
  // });

  // game.settings.register(config.module.name, "access_token", {
  //   type: String,
  //   retricted: true,
  //   scope: "world",
  //   config: false,
  //   default: "anonymous",
  // });

  // public settings
  const settings = [
    {
      key: "proxy",
      type: String,
      public: false,
      scope: "world",
      config: false,
      default: DEFAULT_IMAGE_PROXY,
    },
    {
      key: "access_token",
      type: String,
      public: false,
      scope: "world",
      config: false,
      default: "anonymous",
    },
    {
      key: "actorImageDirectory",
      type: window.vtta.settings.DirectoryPicker.Directory,
      default: "[data] uploads/avatars",
      scope: "world",
      config: false,
      public: true,
    },
  ];

  // register all settings internally
  settings.forEach((setting, index) => {
    setting.order = index;
    game.settings.register(config.module.name, setting.key, setting);
  });

  // answer to the call of the settings dialog
  window.addEventListener("vtta.configuration.query", () => {
    const reply = new CustomEvent("vtta.configuration.submit", {
      detail: {
        name: config.module.name,
        label: game.i18n.localize(`SETTINGS.sharedSettings.label`),
        settings: settings
          .filter((setting) => setting.public === true)
          .map((setting) =>
            Object.assign(setting, {
              label: game.i18n.localize(`SETTING.${setting.key}.label`),
              hint: game.i18n.localize(`SETTING.${setting.key}.hint`),
              value: game.settings.get(config.module.name, setting.key),
            })
          ),
      },
    });
    window.dispatchEvent(reply);
  });
}
