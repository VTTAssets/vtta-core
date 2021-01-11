import DirectoryPicker from "../modules/settings/DirectoryPicker.mjs";

class SettingsApplication extends FormApplication {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 800,
      height: "auto",
      classes: ["vtta", "ui", "settings"],
      title: "VTTA Centralized Configuration",
    });
  }

  /* -------------------------------------------- */

  /** @override */
  get template() {
    return "modules/vtta-core/src/templates/settings.handlebars";
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
        window.vtta.logger.debug(
          "vtta-core",
          "Done collecting configurations",
          configurations
        );

        // Ordering the settings by module name
        configurations = configurations
          .sort((a, b) => (a.label < b.label ? -1 : a.label > b.label ? 1 : 0))
          .map((configuration) => {
            configuration.settings = configuration.settings
              .sort((a, b) => a.order - b.order)
              .map((setting) => {
                setting.isBoolean = setting.type.name === "Boolean";
                setting.isRange = setting.type.name === "Range";
                setting.isNumber = setting.type.name === "Number";
                if (setting.min && setting.max) {
                  setting.numberRange = `${setting.min} - ${setting.max}`;
                }
                return setting;
              });
            return configuration;
          });

        // add the public configuration from vtta-core, too
        console.log(configurations);

        resolve({ configurations: configurations });
      }, QUERY_TIMEOUT);

      // register an event listener listening for answers to our request
      window.addEventListener("vtta.configuration.submit", (event) => {
        window.vtta.logger.debug(
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
    console.log(formData);
    event.preventDefault();

    for (const prop in formData) {
      const [moduleName, key] = prop.split(".");
      const value = formData[prop];
      console.log("Setting: ", moduleName, key, value);
      await game.settings.set(moduleName, key, value);
    }

    this.close();
  }
}

export default SettingsApplication;
