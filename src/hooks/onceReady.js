import { md } from "../util/string.js";

const onceReady = () => {
  // register new function
  Handlebars.registerHelper("markdown", function (str) {
    return md(str);
  });

  Handlebars.registerHelper("json", function (context) {
    return JSON.stringify(context);
  });
};

export default onceReady;
