/**
 * Shows notifcations and hints to the user
 */
const MARGIN = 10;

const registerNotifications = () => {
  // register the notification global object

  if ($("#vtta-notifications").length === 0) {
    $("body").append(`<div id="vtta-notifications" class="vtta"></div>`);
  }
  if ($("#vtta-hints").length === 0) {
    $("body").append(`<div id="vtta-hints" class="vtta"></div>`);
  }
};

registerNotifications();

const notification = {
  clear: () => {
    $("#vtta-notifications div").fadeOut(200, () => {
      $("#vtta-notifications").empty();
    });
  },
  show: (message, timeout = 4000) => {
    $("#vtta-notifications").css("left", $("#players").css("left"));
    // prettier-ignore
    $("#vtta-notifications").css("bottom", $("#players").height() + (2 * MARGIN));

    let note = $(`<div class="ui" style="display: none"></div>`).append(
      message
    );
    $("#vtta-notifications").append(note);
    $(note).fadeIn(200);

    if (timeout)
      setTimeout(() => {
        $(note).fadeOut(200, () => {
          $(note).remove();
        });
      }, timeout);
    else
      $(note).append(
        '<p style="text-align: center; color: #7e7e7e; margin: 0px;"><small>Click to close</small>'
      );

    $(note).on("click", () => {
      $(note).fadeOut(200, () => {
        $(note).remove();
      });
    });
  },
};

export default notification;
