/**
 * Game Settings: DirectoryPicker
 * ROUTE_PREFIX
 */

const log = (message, data = null) => {
  if (data) {
    console.log(`[DirectoryPicker] ${message}`, data);
  } else {
    console.log(`[DirectoryPicker] ${message}`);
  }
};

class DirectoryPicker extends FilePicker {
  constructor(options = {}) {
    super(options);

    this.isForgeHosted = new URL(document.URL).hostname.endsWith(
      "forge-vtt.com"
    );
  }

  /**
   * ======================================================================
   * Regular FilePicker behaviour, overriden to support directory selection
   * ======================================================================
   */

  /**
   * Stringifies the input selected on the form and set's this field's value to
   * that
   * @param {event} event
   */
  _onSubmit(event) {
    event.preventDefault();
    const path = event.target.target.value;
    const activeSource = this.activeSource;
    const bucket = event.target.bucket ? event.target.bucket.value : null;

    const data = {
      activeSource,
      bucket,
      path,
    };

    log("_onSubmit: User submitted data", data);

    this.field.value = DirectoryPicker.stringify(data);

    log("_onSubmit: Stringified value", this.field.value);
    this.close();
  }

  // Stringifies the Filepicker options into a string
  static stringify(options) {
    log("Stringifying options", options);
    if (options.path && !options.current) {
      // we need to use the path since this comes in from the FilePicker instance used to select the path in the settings pane
      // do not use .current!
      options.current = options.path;
      delete options.path;
    }
    return DirectoryPicker.descriptorFromOptions(options);
  }

  // Creates Filepicker options from the serialized string
  static parse(descriptor) {
    return DirectoryPicker.optionsFromDescriptor(descriptor);
  }

  static get isForgeHosted() {
    // ref: https://discord.com/channels/687213225225355296/694659543052976268/824378131212664844
    // return new URL(document.URL).hostname.endsWith("forge-vtt.com");
    return typeof ForgeVTT !== "undefined" && ForgeVTT.usingTheForge;
  }

  // returns the type "Directory" for rendering the SettingsConfig
  static Directory(val) {
    return val;
  }

  static get default() {
    if (DirectoryPicker.isForgeHosted) {
      return {
        activeSource: "forgevtt",
        bucket: null,
        current: "",
      };
    } else {
      const s3Host =
        game.data.files.s3 &&
          game.data.files.s3 &&
          game.data.files.s3.endpoint &&
          game.data.files.s3.endpoint.host
          ? game.data.files.s3.endpoint.host
          : "";

      if (s3Host === "") {
        return {
          activeSource: "user",
          bucket: null,
          current: "",
        };
      } else {
        return {
          activeSource: "s3",
          bucket: game.data.files.s3.buckets[0],
          current: "",
        };
      }
    }
  }

  // Adds a FilePicker-Simulator-Button next to the input fields
  static processHtml(html) {
    $(html)
      .find(`input[data-dtype="Directory"]`)
      .each((index, element) => {
        // disable the input field raw editing
        $(element).prop("readonly", true);

        // if there is no button next to this input element yet, we add it
        if (!$(element).next().length) {
          let picker;
          if (DirectoryPicker.isForgeHosted) {
            const pickerOptions = {
              field: $(element)[0],
              ...DirectoryPicker.parse($(element).val()),
            };

            log("Picker options", pickerOptions);
            picker = new DirectoryPicker(pickerOptions);

            // remove the public directory
            delete picker.sources.public;
            picker.activeSource = "forgevtt";
            delete picker.sources.user;
            delete picker.sources["forge-bazaar"];
          } else {
            const pickerOptions = {
              field: $(element)[0],
              ...DirectoryPicker.parse($(element).val()),
            };

            log("Picker options", pickerOptions);
            picker = new DirectoryPicker(pickerOptions);

            // remove the public directory
            delete picker.sources.public;
          }

          let pickerButton = $(
            '<button type="button" class="file-picker" data-type="imagevideo" data-target="img" title="Pick directory"><i class="fas fa-file-import fa-fw"></i></button>'
          );
          pickerButton.on("click", () => {
            picker.render(true);
          });
          $(element).parent().append(pickerButton);
        }
      });
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // remove unnecessary elements
    $(html).find("ol.files-list").remove();
    $(html).find("footer div").remove();
    $(html).find("footer button").text("Select Directory");
  }

  /**
   * ======================================================================
   * Utility helpers
   * ======================================================================
   */

  static isServerURL(url) {
    const compare = new URL(url, location.origin);
    return compare.host === location.host;
  }

  /**
   * Checks if a given URL is pointing to a ressource residing in the configured storage
   * @param url URL to check
   * @returns
   */
  static isS3URL(url) {
    const filename = url.split("/").pop();
    const [source, current] = new FilePicker()._inferCurrentDirectory(url);
    if (["s3", "forgetvtt", "forge-bazar"].includes(source)) {
      return {
        activeSource: source,
        bucket: null,
        current: current,
      };
    }
    return false;
    if (DirectoryPicker.isForgeHosted) {
      const tUrl = new URL(url);
      if (tUrl.host.toLowerCase() === "assets.forge-vtt.com") {
        return {
          activeSource: "forgevtt",
          bucket: null,
          cdocsurrent: tUrl.pathname.substring(1),
        };
      } else {
        return false;
      }
    } else {
      const s3Host =
        game.data.files.s3 &&
          game.data.files.s3 &&
          game.data.files.s3.endpoint &&
          game.data.files.s3.endpoint.host
          ? game.data.files.s3.endpoint.host
          : "";

      if (s3Host === "") return false;

      const regex = new RegExp("http[s]?://([^.]+)?.?" + s3Host + "(.+)");
      const matches = regex.exec(url);

      const activeSource = matches ? "s3" : null; // can be data or remote
      const bucket = matches && matches[1] ? matches[1] : null;
      const current = matches && matches[2] ? matches[2] : null;

      if (activeSource === "s3") {
        return {
          activeSource,
          bucket,
          current,
        };
      } else {
        return false;
      }
    }
  }

  static isInternalURL(url) {
    return DirectoryPicker.isServerURL(url) || DirectoryPicker.isS3URL(url);
  }

  static isExternalURL(url) {
    return !DirectoryPicker.isInternalURL(url);
  }

  /**
   * ======================================================================
   * Upload helper
   * ======================================================================
   */
  static async uploadToPath(path, file) {
    const options = DirectoryPicker.parse(path);
    options.current =
      options.current.indexOf("/") === 0
        ? options.current.substring(1)
        : options.current;
    return FilePicker.upload(options.activeSource, options.current, file, {
      bucket: options.bucket,
    });
  }

  /**
   * ======================================================================
   * Transformation methods:
   * - Stringified field value to FilePicker options
   * - Stringified field value to URL
   * - FilePicker options to stringified field value
   * - FilePicker options to URL
   * - URL to stringified field value
   * - URL to Filepicker options
   * ======================================================================
   */
  static descriptorFromURL(url) {
    const options = DirectoryPicker.optionsFromURL(url);
    if (options.activeSource !== null) {
      return DirectoryPicker.descriptorFromOptions(options);
    } else {
      return url;
    }
  }

  static descriptorFromOptions(options) {
    return options.bucket !== null
      ? `[${options.activeSource}:${options.bucket}] ${options.current}`
      : `[${options.activeSource}] ${options.current}`;
  }

  static optionsFromURL(url) {
    if (DirectoryPicker.isExternalURL(url)) {
      return {
        activeSource: null,
        bucket: null,
        current: url,
      };
    } else {
      const filename = url.split("/").pop();
      const fp = new FilePicker();
      const [activeSource, current] = fp._inferCurrentDirectory(url);
      if (activeSource === "s3") {
        // try to find the bucket
        return {
          activeSource,
          bucket: fp.sources.s3.s3bucket,
          current: `${current}/${filename}`,
        };
      }

      return {
        activeSource,
        bucket: null,
        current: `${current}/${filename}`,
      };
    }

    // local URL
    if (DirectoryPicker.isServerURL(url)) {
      return {
        activeSource: "data",
        bucket: null,
        current: url,
      };
    }

    const s3Options = DirectoryPicker.isS3URL(url);
    if (s3Options) return s3Options;

    return {
      activeSource: null,
      bucket: null,
      current: url,
    };
  }

  static optionsFromDescriptor(descriptor) {
    let matches = descriptor.match(/^\[(.+)\]\s*(.+)/);
    if (matches) {
      const source = matches[1];
      const current = matches[2].trim();
      const [activeSource, bucket] = source.split(":");

      const VALID_ACTIVE_SOURCES = ["data", "s3", "forgevtt"];
      if (VALID_ACTIVE_SOURCES.includes(activeSource)) {
        return {
          activeSource: activeSource,
          bucket: bucket !== undefined ? bucket : null,
          current: current,
        };
      }
    }
    // It's not a descriptor, so probably a remote URL
    return {
      activeSource: null,
      bucket: null,
      current: descriptor,
    };
  }

  //   static URLFromOptions(options) {
  //     // always prepend the current part with a leading slash
  //     const current =
  //       options.current.indexOf("/") === 0
  //         ? options.current
  //         : "/" + options.current;

  //     switch (options.activeSource) {
  //       case "s3":
  //         const config =
  //           game.data.files && game.data.files.s3 && game.data.files.s3
  //             ? game.data.files.s3
  //             : null;
  //         // failsave
  //         if (config === null) return current;
  //         if (options.bucket) {
  //           return `${config.protocol}://${config.bucket}.${config.host}${config.path}${current}`;
  //         } else {
  //           return `${config.protocol}://${config.host}${config.path}${current}`;
  //         }
  //       case "data":
  //         return current;
  //       default:
  //         return current;
  //     }
  //   }

  //   static URLFromDescriptor(descriptor) {
  //     const options = DirectoryPicker.optionsFromDescriptor(descriptor);
  //     return DirectoryPicker.URLFromOptions(options);
  //   }
}

export default DirectoryPicker;
