/** Remove the nagging "Your screen resolution is too low" when developing */

export default function () {
  if (game.world.name !== "dev") return;
  Hooks.on("renderNotifications", (app, html, options) => {
    if ($(html).text().indexOf("requires a minimum screen resolution")) {
      $(html).remove();
    }
  });
}
