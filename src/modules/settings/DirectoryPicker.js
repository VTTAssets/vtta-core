/**
 * Game Settings: DirectoryPicker
 */

class DirectoryPicker extends FilePicker {
  constructor(options = {}) {
    super(options);
  }

  _onSubmit(event) {
    event.preventDefault();
    const path = event.target.target.value;
    const activeSource = this.activeSource;
    const bucket = event.target.bucket ? event.target.bucket.value : null;
    this.field.value = DirectoryPicker.format({
      activeSource,
      bucket,
      path,
    });
    this.close();
  }

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

  // returns the type "Directory" for rendering the SettingsConfig
  static Directory(val) {
    return val;
  }

  // formats the data into a string for saving it as a GameSetting
  static format(options) {
    if (options.path && !options.current) {
      // we need to use the path since this comes in from the FilePicker instance used to select the path in the settings pane
      // do not use .current!
      options.current = options.path;
      delete options.path;
    }
    return DirectoryPicker.descriptorFromOptions(options);
  }

  // parses the string back to something the FilePicker can understand as an option
  static parse(descriptor) {
    return DirectoryPicker.optionsFromDescriptor(descriptor);
  }

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

  static URLFromOptions(options) {
    // always prepend the current part with a leading slash
    const current =
      options.current.indexOf("/") === 0
        ? options.current
        : "/" + options.current;

    switch (options.activeSource) {
      case "s3":
        const config =
          game.data.files && game.data.files.s3 && game.data.files.s3
            ? game.data.files.s3
            : null;
        // failsave
        if (config === null) return current;
        if (options.bucket) {
          return `${config.protocol}://${config.bucket}.${config.host}${config.path}${current}`;
        } else {
          return `${config.protocol}://${config.host}${config.path}${current}`;
        }
      case "data":
        return current;
      default:
        return current;
    }
  }

  static URLFromDescriptor(descriptor) {
    const options = DirectoryPicker.optionsFromDescriptor(descriptor);
    return DirectoryPicker.URLFromOptions(options);
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
          let picker = new DirectoryPicker({
            field: $(element)[0],
            ...DirectoryPicker.parse($(element).val()),
          });
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
}

export default DirectoryPicker;
