import Modal from "./Modal.mjs";
import Notification from "./Notification.mjs";

/**
 * Construct the global object
 */
const vtta = {
  ui: {
    Modal,
    Notification,
    BUTTON_OK: "OK",
    BUTTON_CANCEL: "CANCEL",
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
  console.log("UIs registered:");
  console.log(window.vtta);
}
