class Setting {
  constructor(moduleName, key, label, hint, validation = null) {
    this.moduleName = moduleName;
    this.key = key;

    this.label = label;
    this.hint = hint;

    this.validation = validation;

    this.load();
  }

  toString() {
    return JSON.stringify({ value: this.value });
  }

  load() {
    const str = game.settings.get(this.moduleName, this.key);
    const obj = JSON.parse(str);
    if (obj && obj.value) this.value = obj.value;
    else this.value = str;
  }

  save() {
    // validate the result, if any
    const validationResult =
      this.validation !== null ? this.validation(this.value) : { status: "ok" };

    if (validationResult.status === "ok") {
      game.settings.set(
        this.moduleName,
        this.key,
        JSON.stringify({ value: this.value })
      );
    }
    return this.validation;
  }

  html() {
    if (typeof this.value === "string") {
      return `
        <div class="form-group">
            <label>${this.label}</label>
            <div class="form-fields">
                <input type="text" value="${this.value}" name="${this.moduleName}.${this.key}" />
            </div>
            <p class="notes">${this.hint}</p>
        </div>`;
    }
  }
}
