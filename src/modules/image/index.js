import Download from "./Download.js";
/**
 * Construct the global object
 */
const vtta = {
  image: {
    download: Download,
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
  console.log("Image utilities registered:");
  console.log(window.vtta);
}
