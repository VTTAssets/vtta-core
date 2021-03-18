/**
 * Game Settings: DirectoryPicker
 */

class ImageFilePicker extends FilePicker {
  constructor(options = {}) {
    super(options);
  }

  _onSubmit(event) {
    event.preventDefault();
    console.log("[_onSubmit]");
    console.log(event);
    const url = event.target.file.value;

    const activeSource = this.activeSource;
    const bucket = event.target.bucket ? event.target.bucket.value : null;

    let filePath = url;

    if (activeSource === "s3") {
      const { protocol, hostname } = game.data.files.s3.endpoint;
      const prefix = `${protocol}://${bucket}.${hostname}`;
      filePath = filePath.substr(prefix.length);
    }

    this.field.value = ImageFilePicker.format({
      activeSource,
      bucket,
      filePath,
    });
    this.close();
  }

  static getUrl(filePath) {
    const options = ImageFilePicker.parse(filePath);
    switch (options.activeSource) {
      case "s3":
        const { protocol, hostname } = game.data.files.s3.endpoint;
        return `${protocol}//${options.bucket}.${hostname}/${options.current}`;
      case "forgevtt":
        return options.current;
      default:
        const { remote } = game.data.addresses;
        return `/${options.current}`;
        return `${remote}/${options.current}`;
    }
  }

  // returns the type "Directory" for rendering the SettingsConfig
  static ImageFile(val) {
    return val;
  }

  // formats the data into a string for saving it as a GameSetting
  static format(value) {
    console.log("[format] value: " + value);
    console.log(value);
    return value.bucket !== null
      ? `[${value.activeSource}:${value.bucket}] ${value.filePath}`
      : `[${value.activeSource}] ${value.filePath}`;
  }

  // parses the string back to something the FilePicker can understand as an option
  static parse(str) {
    let matches = str.match(/\[(.+)\]\s*(.+)/);
    if (matches) {
      let source = matches[1];
      const current = matches[2].trim();
      const [s3, bucket] = source.split(":");
      if (bucket !== undefined) {
        return {
          activeSource: s3,
          bucket: bucket,
          current: current,
        };
      } else {
        return {
          activeSource: s3,
          bucket: null,
          current: current,
        };
      }
    }
    // failsave, try it at least
    return {
      activeSource: "data",
      bucket: null,
      current: str,
    };
  }

  // Adds a FilePicker-Simulator-Button next to the input fields
  static processHtml(html) {
    $(html)
      .find(`input[data-dtype="ImageFile"]`)
      .each((index, element) => {
        // disable the input field raw editing
        $(element).prop("readonly", true);

        // if there is no button next to this input element yet, we add it
        if (!$(element).next().length) {
          let picker = new ImageFilePicker({
            field: $(element)[0],
            ...ImageFilePicker.parse($(element).val()),
          });
          let pickerButton = $(
            '<button type="button" class="file-picker" data-type="imagevideo" data-target="img" title="Pick image file"><i class="fas fa-file-import fa-fw"></i></button>'
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
    // $(html).find("ol.files-list").remove();
    // $(html).find("footer div").remove();
    // $(html).find("footer button").text("Select Directory");
  }
}

export default ImageFilePicker;
