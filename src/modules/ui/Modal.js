class Modal {
  constructor(id, title, content, buttons) {
    this.html = $(
      `<div class="vtta"><div class="vtta-modal" id="${id}">
        <div class="container">
          <header class="window-header"></header>
          <section class="window-content"></section>
          <footer class="buttons"></footer>
        </div>
      </div>`
    );

    this.title = $(this.html).find("header.window-header");
    $(this.title).html(title);

    this.content = $(this.html).find("section.window-content");
    $(this.content).append(content);

    this.buttons = $(this.html).find("footer.buttons");
    buttons.forEach((button) => {
      this.buttons.append(
        `<button name="${button}">${game.i18n.localize(
          "UI.BUTTON." + button
        )}</button>`
      );
    });

    this.data = {};
  }

  activateListeners(resolve) {
    const updateData = (event) => {
      const input = $(event.target);
      const name = $(input).attr("name");
      const value = $(input).val();
      this.data[name] = value;
    };

    const submit = (event) => {
      const button = $(event.target);
      const name = $(button).attr("name");

      // remove the UI, doesn't matter which button was pressed actually
      $(this.html).fadeOut(100, () => {
        resolve({
          button: name,
          data: this.data,
        });
        $(this.html).remove();
      });
    };

    // listen to changes in inputs on the content, if any
    $(this.content)
      .find("input")
      .on("change", (event) => updateData(event));
    $(this.content)
      .find("input")
      .on("input", (event) => updateData(event));
    $(this.buttons)
      .find("button")
      .on("click", (event) => submit(event));
  }

  show() {
    return new Promise((resolve, reject) => {
      $("body").append(this.html);
      $(this.html).fadeIn(100, () => {
        this.activateListeners(resolve);
      });
    });
  }
}

export default Modal;
