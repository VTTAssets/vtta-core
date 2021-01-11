import DirectoryPicker from "./DirectoryPicker.mjs";
import ImageFilePicker from "./ImageFilePicker.mjs";

/**
 * Construct the global object
 */
const vtta = {
  settings: {
    DirectoryPicker,
    ImageFilePicker,
  },
};

/**
 * Assign the global object or expand it at least
 */
export default function () {
  // this s hooked in, we don't use all the data, so lets stop eslint complaining
  // eslint-disable-next-line no-unused-vars
  Hooks.on("renderSettingsApplication", (app, html, user) => {
    console.log("Processing HTML for Settings UI");
    ImageFilePicker.processHtml(html);
    DirectoryPicker.processHtml(html);
  });

  if (window.vtta) {
    window.vtta = Object.assign(window.vtta, vtta);
  } else {
    window.vtta = vtta;
  }
  console.log("Settings registered:");
  console.log(window.vtta);
}
