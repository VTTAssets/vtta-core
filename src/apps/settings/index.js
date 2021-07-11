import logger from "../../util/logger.js";

class SettingsApplication extends FormApplication {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 800,
      height: 800,
      classes: ["vtta", "ui", "settings"],
      title: "Virtual Tabletop Assets (VTTA) Configuration",
    });
  }

  /* -------------------------------------------- */

  /** @override */
  get template() {
    return "modules/vtta-core/src/templates/settings.sections.handlebars";
  }

  getData() {
    const data = this.queryConfigurations();
    return data;
  }

  queryConfigurations() {
    let configurations = [];
    const QUERY_TIMEOUT = 500;

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        logger.debug(
          "vtta-core",
          "Done collecting configurations",
          configurations
        );

        const DEFAULT_SECTION = "default";
        // Ordering the settings by section, then order name
        const settings = configurations
          .map((configuration) => {
            return configuration.settings.map((setting) => {
              if (setting.section === undefined)
                setting.section = DEFAULT_SECTION;
              setting.usedBy = configuration.name;
              setting.isBoolean = setting.type.name === "Boolean";
              setting.isRange = setting.type.name === "Range";
              setting.isNumber = setting.type.name === "Number";
              setting.isSelect = setting.choices !== undefined;
              if (setting.min && setting.max) {
                setting.numberRange = `${setting.min} - ${setting.max}`;
              }
              return setting;
            });
          })
          .flat(1);

        const buttons = configurations
          .filter(
            (configuration) =>
              configuration.buttons !== undefined &&
              Array.isArray(configuration.buttons) &&
              configuration.buttons.length
          )
          .map((configuration) => configuration.buttons)
          .flat(1);

        const sections = settings
          .reduce(
            (sections, setting) => {
              if (!sections.includes(setting.section))
                sections.push(setting.section);
              return sections;
            },
            [DEFAULT_SECTION]
          )
          .map((section) => {
            const sectionSettings = settings.filter(
              (setting) => setting.section === section
            );
            if (sectionSettings.length) {
              return {
                label: game.i18n.localize(`SETTING.SECTION.${section}.label`),
                description: game.i18n.localize(
                  `SETTING.SECTION.${section}.description`
                ),
                settings: settings.filter(
                  (setting) => setting.section === section
                ),
              };
            } else {
              // do not display empty sections
              return undefined;
            }
          })
          .filter((section) => section !== undefined);
        console.log("Configurations collected", {
          sections: sections,
          buttons: buttons,
        });

        this.buttons = buttons;

        resolve({ sections: sections, buttons: buttons });
      }, QUERY_TIMEOUT);

      // Ordering the settings by module name
      // configurations = configurations
      //     .sort((a, b) => {
      //       if (a.section && b.section) {
      //         return a.section < b.section
      //           ? -1
      //           : a.section > b.section
      //           ? 1
      //           : a.label < b.label
      //           ? -1
      //           : a.label > b.label
      //           ? 1
      //           : 0;
      //       } else {
      //         return a.label < b.label ? -1 : a.label > b.label ? 1 : 0;
      //       }
      //     })
      //     .map((configuration) => {
      //       configuration.settings = configuration.settings
      //         .sort((a, b) => a.order - b.order)
      //         .map((setting) => {
      //           setting.isBoolean = setting.type.name === "Boolean";
      //           setting.isRange = setting.type.name === "Range";
      //           setting.isNumber = setting.type.name === "Number";
      //           setting.isSelect = setting.choices !== undefined;
      //           if (setting.min && setting.max) {
      //             setting.numberRange = `${setting.min} - ${setting.max}`;
      //           }
      //           return setting;
      //         });
      //       return configuration;
      //     });
      //   resolve({ configurations: configurations });
      // }, QUERY_TIMEOUT);

      // register an event listener listening for answers to our request
      window.addEventListener("vtta.configuration.submit", (event) => {
        logger.debug(
          "Received configuration from " + event.detail.name,
          event.detail
        );
        configurations.push(event.detail);
      });

      // start the query for configs
      window.dispatchEvent(new Event("vtta.configuration.query"));
    });
  }

  /**
   * This method is called upon form submission after form data is validated
   * @param event {Event}       The initial triggering submission event
   * @param formData {Object}   The object of validated form data with which to update the object
   * @returns {Promise}         A Promise which resolves once the update operation has completed
   * @abstract
   */
  async _updateObject(event, formData) {
    event.preventDefault();

    for (const prop in formData) {
      const [moduleName, key] = prop.split(".");
      const value = formData[prop];
      logger.debug(
        `Updating setting for module ${moduleName}: ${key} = ${value}`
      );
      await game.settings.set(moduleName, key, value);
    }

    this.close();
  }

  activateListeners(html) {
    $(html)
      .find("button")
      .on("click", async (event) => {
        const button = $(event.currentTarget);
        const type = button.prop("type");
        console.log("Type: " + type);

        if (type === "button") {
          event.preventDefault();
          // check if it a button added by a module
          const { key } = $(event.currentTarget).data();
          if (key) {
            console.log("Button with key: " + key);
            const button = this.buttons.find((button) => button.key === key);
            if (button) {
              button.callback(event);
            }
          }
        }
      });

    super.activateListeners(html);
  }
}

export default SettingsApplication;
