import Modal from "./Modal.js";
import Notification from "./Notification.js";

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
}
