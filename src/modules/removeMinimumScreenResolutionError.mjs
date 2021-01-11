export default function () {
  Hooks.on("renderNotifications", (app, html, options) => {
    if ($(html).text().indexOf("requires a minimum screen resolution")) {
      $(html).remove();
    }
  });
}
