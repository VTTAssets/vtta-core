import { md, semanticVersionCompare } from "../util/string.js";

const onceReady = () => {
  // register new function
  Handlebars.registerHelper("markdown", function (str) {
    return md(str);
  });

  Handlebars.registerHelper("json", function (context) {
    return JSON.stringify(context);
  });

  /**
   * FOLLOWING:
   * Adjustments for 0.8.x
   */
  window.vtta.postEightZero =
    semanticVersionCompare("0.7.9", game.data.version) === -1;
};

export default onceReady;
