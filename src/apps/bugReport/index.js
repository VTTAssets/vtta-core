import config from "../../config/index.js";
import Update from "../../util/update.js";

/**
 * Bug Report Application
 * Is called by an inserted menu button in game configuration after the user connected
 * with the extension to the Foundry server
 *
 * Allows easy bug reporting to Discord
 */
class BugReportApplication extends FormApplication {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 800,
      height: 800,
      classes: ["vtta", "ui", "settings"],
      title: "Report a bug",
    });
  }

  /* -------------------------------------------- */

  /** @override */
  get template() {
    return "modules/vtta-core/src/templates/bug-report.handlebars";
  }

  /** Not necessary, but needed to appear in the game settings */
  async _updateObject(event, formData) {
    event.preventDefault();
    this.close();
  }

  /**
   * Loads the user profile from the API
   * This ensures that we will not store any personal details in the game settings in order to protect the user's privacy
   * @returns stripped down user profile
   */
  async loadUserProfile() {
    const access_token = game.settings.get(config.module.name, "access_token");
    const environment = game.settings.get(config.module.name, "environment");

    const API_CONFIG = new Map([
      ["PRODUCTION", "https://api.vtta.io"],
      ["STAGING", "https://api.vtta.dev"],
    ]);
    let API_URL = API_CONFIG.get(config.module.name, "environment");
    if (!API_URL) API_URL = API_CONFIG.get("PRODUCTION");

    return new Promise((resolve, reject) => {
      fetch(`${API_URL}/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
        })
        .then((json) => resolve(json))
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * Collects all necessary data to display the bug report tool
   * @returns Date for display in the app
   */
  async getData() {
    const user = await this.loadUserProfile();
    const moduleNames = ["vtta-core", "vtta-ddb", "vtta-tokens"];

    const moduleInfo = await Promise.all(
      moduleNames.map(async (moduleName, index) => {
        const modInfo = game.modules.get(moduleName);

        // module is not installed
        if (modInfo === undefined) return Promise.resolve(undefined);

        const updateAvailable = await Update.check(moduleName);
        return {
          name: moduleName,
          title: modInfo.data.title,
          version: modInfo.data.version,
          updateAvailable: updateAvailable,
          label: `${modInfo.data.title} v${modInfo.data.version}: ${
            updateAvailable ? "Update available" : "Up-to-date"
          }`,
        };
      })
      // filter missing modules
    );

    const data = {
      versions: {
        dnd5e: game.system.data.version,
        fvtt: game.data.version,
      },
      user: user,
      modules: moduleInfo.filter((modInfo) => modInfo !== undefined),
    };

    return data;
  }

  /**
   * Reports the bug to the API, which forwards it to the Discord bot
   * @param {object} data Data collected from the user form
   * @returns { success, message, link }
   */
  submitBugReport(data) {
    const access_token = game.settings.get(config.module.name, "access_token");
    const API_URL = game.settings.get(config.module.name, "api");

    const request = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-type": "application/json",
      },
      body: JSON.stringify(data),
    };

    return new Promise((resolve, reject) => {
      fetch(`${API_URL}/bug/report`, request)
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
        })
        .then((json) => resolve(json))
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * Interactivity for the displayed form
   */
  activateListeners(html) {
    // Check if the top-most module requires an update
    const modInfo = $(html).find("select[name='module'] :selected");
    const data = $(modInfo).data();

    if (data.updateavailable === "yes") {
      $(html).find("#updateAvailableWarning").show();
      $(html).find("button[type='submit']").prop("disabled", true);
    } else {
      $(html).find("#updateAvailableWarning").hide();
      $(html).find("button[type='submit']").prop("disabled", false);
    }

    /**
     * Start submission?
     */
    $(html)
      .find("button")
      .on("click", async (event) => {
        const button = $(event.currentTarget);
        const type = button.prop("type");

        const selectedModule = $(html).find("select[name='module'] :selected");

        const affectedModule = {
          ...$(selectedModule).data(),
          name: $(selectedModule).attr("name"),
        };

        const data = {
          title: $(html).find("input[name='title']").val().trim(),
          text: $(html).find("textarea[name='text']").val(),
          hosting: $(html).find("select[name='hosting'] :selected").val(),
          affectedModule: affectedModule,
          environment: {
            dnd5e: game.system.data.version,
            fvtt: game.data.version,
            core: game.modules.get(config.module.name).data.version,
          },
        };

        switch (type) {
          case "reset":
            this.close();
            break;
          default:
            const result = await this.submitBugReport(data);
            if (result.success) {
              window.vtta.ui.Notification.show(
                "Bug report submitted",
                `<p>Thank you for improving the VTTA.io modules! Your report was posted on <a href="${result.link}">the VTTA.io Discord</a>.<p>`
              );
            } else {
              window.vtta.ui.Notification.show(
                "Bug report submission failed",
                "<p>" + result.message + "<p>"
              );
            }
            this.close();
            break;
        }
      });

    $(html)
      .find("select[name='module']")
      .on("change", function () {
        const data = $(this).find(":selected").data();
        const name = $(this).find(":selected").attr("name");

        if (data.updateavailable === "yes") {
          $(html).find("#updateAvailableWarning").show();
          $(html).find("button[type='submit']").prop("disabled", true);
        } else {
          $(html).find("#updateAvailableWarning").hide();
          $(html).find("button[type='submit']").prop("disabled", false);
        }
      });

    super.activateListeners(html);
  }
}

export default BugReportApplication;
