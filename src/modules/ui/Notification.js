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
  if ($("#vtta-progress").length === 0) {
    $("body").append(`<div id="vtta-progress" class="vtta"></div>`);
  }
};

registerNotifications();

const notification = {
  clear: () => {
    $("#vtta-notifications div").fadeOut(200, () => {
      $("#vtta-notifications").empty();
    });
  },
  show: (title, text, timeout = 4000) => {
    $("#vtta-notifications").css("left", $("#players").css("left"));
    // prettier-ignore
    $("#vtta-notifications").css("bottom", $("#players").height() + (2 * MARGIN));

    const message = `<h2>${title}</h2><div>${text}</div>`;

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

const hint = {
  clear: () => {
    $("#vtta-hints div").fadeOut(200, () => {
      $("#vtta-hints").empty();
    });
  },
  show: (message, options = {}) => {
    return new Promise((resolve) => {
      $("#vtta-hints").css("width", options.width ? options.width : 300);

      // construct the note
      let note = $(`<div class="ui" style="display: none"></div>`).append(
        message
      );
      $(note).append('<div class="buttons"></div>');
      $("#vtta-hints").append(note);
      $(note).fadeIn(200);

      if (!options.align) options.align = options.element ? "RIGHT" : "CENTER";

      let anchor = {
        width: 0,
        height: 0,
        top: Math.round(window.innerHeight / 2),
        left: Math.round(window.innerWidth / 2),
      };

      if (options.element) {
        anchor = Object.assign(
          {
            width: $(options.element).width(),
            height: $(options.element).height(),
          },
          $(options.element).offset()
        );
      }

      const noteInfo = Object.assign(
        { width: $("#vtta-hints").width(), height: $("#vtta-hints").height() },
        $("#vtta-hints").position()
      );

      switch (options.align) {
        case "RIGHT":
          $("#vtta-hints").css("top", anchor.top);
          $("#vtta-hints").css("left", anchor.left + anchor.width + MARGIN);
          break;
        case "LEFT":
          $("#vtta-hints").css("top", anchor.top);
          $("#vtta-hints").css("left", anchor.left - noteInfo.width - MARGIN);
          break;
        case "TOP":
          $("#vtta-hints").css("top", anchor.top - noteInfo.height - MARGIN);
          $("#vtta-hints").css("left", anchor.left);
          break;
        case "BOTTOM":
          $("#vtta-hints").css("top", anchor.top + anchor.height + MARGIN);
          $("#vtta-hints").css("left", anchor.left);
          break;

        default:
          // eslint-disable-next-line no-mixed-operators
          $("#vtta-hints").css(
            "top",
            anchor.top - Math.round(noteInfo.height / 2)
          );
          // eslint-disable-next-line no-mixed-operators
          $("#vtta-hints").css(
            "left",
            anchor.left - Math.round(noteInfo.width / 2)
          );
      }

      if (options.buttons) {
        for (let name of options.buttons) {
          let btn = $("<button>" + name + "</button>");
          $("div.buttons", note).append(btn);
          $(btn).on("click", () => {
            $(note).remove();
            resolve(name);
            // $(note).fadeOut(100, () => {
            //   $(note).remove();
            //   resolve(name);
            // });
          });
        }
      } else {
        $(note).find("div.buttons").css("display", "none");
      }
      if (options.hide) {
        const hideFn = () => {
          $(options.hide.selector).on(options.hide.event, hideFn);
          $(note).remove();
          resolve(true);
          // $(note).fadeOut(100, () => {
          //   $(note).remove();
          //   resolve(true);
          // });
        };
        $(options.hide.selector).on(options.hide.event, hideFn);
      }
    });
  },
};

// const createCounter = (
//     title: string,
//     target: number,
//     count?: number
//   ): string => {
//     const id = uuid();
//     const element = $(
//       `<div id="count-${id}" data-target="${target}" data-count=${
//         count ? count : 0
//       }" class="timer">
//         <div class="header">${title}</div>
//         <div class="bar">
//             <div class="tick" style="width: 0%"></div>
//         </div>
//     </div>
//   </div>`
//     );
//     $("body").find("div.vtta.statusBar div.messages").append(element);

//     let percent = count ? Math.round((100 / target) * count) : 0;
//     $(element).find(".tick").css("width", `${percent}%`);
//     return id;

const progress = {
  clear: () => {
    $("#vtta-progress div").fadeOut(200, () => {
      $("#vtta-progress").empty();
    });
  },
  show: (title, value, target, timeout = 4000) => {
    const id = randomID();
    // $("#vtta-progress").css("left", $("#players").css("left"));
    // prettier-ignore
    // $("#vtta-progress").css("bottom", $("#players").height() + (2 * MARGIN));

    let bar = $(`<div id="counter-${id}" data-target="${target}" data-value=${
      value ? value : 0
    }" class="timer" class="ui" style="display: none">
              <div class="header">${title}</div>
              <div class="bar">
                  <div class="tick" style="width: 0%"></div>
              </div>
          </div>
        </div>`);

    $("#vtta-progress").append(bar);
    $(bar).fadeIn(200);

    let anchor = {
      width: 0,
      height: 0,
      top: Math.round(window.innerHeight / 2),
      left: Math.round(window.innerWidth / 2),
    };

    // const noteInfo = Object.assign(
    //   {
    //     width: $("#vtta-progress").width(),
    //     height: $("#vtta-progress").height(),
    //   },
    //   $("#vtta-progress").position()
    // );

    // // eslint-disable-next-line no-mixed-operators
    // $("#vtta-progress").css(
    //   "top",
    //   anchor.top - Math.round(noteInfo.height / 2)
    // );
    // // eslint-disable-next-line no-mixed-operators
    // $("#vtta-progress").css(
    //   "left",
    //   anchor.left - Math.round(noteInfo.width / 2)
    // );

    if (value && value !== 0) {
      let percent = Math.min(
        100,
        value ? Math.round((100 / target) * value) : 0
      );
      $("#vtta-progress")
        .find(`#counter-${id} .tick`)
        .css("width", `${percent}%`);
    }

    return id;
  },
  hide: (id, timeout = 200) => {
    const progressBar = $("#vtta-progress").find("#counter-" + id);
    if (progressBar) {
      $(progressBar).fadeOut(timeout, () => {
        $(progressBar).remove();
      });
    }
  },
  setValue: (id, value) => {
    const progressBar = $("#vtta-progress").find("#counter-" + id);
    if (progressBar) {
      // set the new value
      $(progressBar).attr("data-value", value);
      // get the target
      const target = parseInt($(progressBar).attr("data-target"));

      let percent = Math.min(
        100,
        value ? Math.round((100 / target) * value) : 0
      );
      $(progressBar).find(".tick").css("width", `${percent}%`);
      if (percent > 10) {
        $(progressBar).find(".tick").html(`${value}/${target}`);
      } else {
        $(progressBar).find(".tick").empty();
      }
    }
  },
  setTarget: (id, target) => {
    const progressBar = $("#vtta-progress").find("#counter-" + id);
    if (progressBar) {
      // set the new value
      $(progressBar).attr("data-target", target);
      // get the target
      const value = parseInt($(progressBar).attr("data-value"));

      let percent = Math.min(
        100,
        value ? Math.round((100 / target) * value) : 0
      );
      $(progressBar).find(".tick").css("width", `${percent}%`);
      if (percent > 10) {
        $(progressBar).find(".tick").html(`${value}/${target}`);
      } else {
        $(progressBar).find(".tick").empty();
      }
    }
  },
  addValue: (id, value) => {
    const progressBar = $("#vtta-progress").find("#counter-" + id);
    if (progressBar) {
      // set the new value
      value += parseInt($(progressBar).attr("data-value"));
      $(progressBar).attr("data-value", value);
      // get the target
      const target = parseInt($(progressBar).attr("data-target"));

      let percent = Math.min(
        100,
        value ? Math.round((100 / target) * value) : 0
      );
      $(progressBar).find(".tick").css("width", `${percent}%`);
      if (percent > 10) {
        $(progressBar).find(".tick").html(`${value}/${target}`);
      } else {
        $(progressBar).find(".tick").empty();
      }
    }
  },
  addTarget: (id, target) => {
    const progressBar = $("#vtta-progress").find("#counter-" + id);
    if (progressBar) {
      // set the new value
      target += parseInt($(progressBar).attr("data-target"));
      // get the value
      const value = parseInt($(progressBar).attr("data-value"));

      let percent = Math.min(
        100,
        value ? Math.round((100 / target) * value) : 0
      );
      $(progressBar).find(".tick").css("width", `${percent}%`);
      if (percent > 10) {
        $(progressBar).find(".tick").html(`${value}/${target}`);
      } else {
        $(progressBar).find(".tick").empty();
      }
    }
  },
};

export { notification, hint, progress };
