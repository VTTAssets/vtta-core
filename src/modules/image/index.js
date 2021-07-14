import Download from "./Download.js";
import Upload from "./Upload.js";
/**
 * Construct the global object
 */
const vtta = {
  image: {
    download: Download,
    upload: Upload,
  },
};

/**
 * Assign the global object or expand it at least
 */
export default function () {
  if (window.vtta) {
    window.vtta = Object.assign(window.vtta, vtta);
  } else {
    window.vtta = vtta;
  }
}
