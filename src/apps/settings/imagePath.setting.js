import Setting from "./setting.js";

class ImagePathSetting extends Setting {
  constructor(moduleName, key, label, hint, validation = null) {
    validation = (path) => {
      // check if the path exists
    };
    super(moduleName, key, label, hint, validation);
  }
  html() {
    return `
        <div class="form-group">
            <label>${this.label}</label>
            <div class="form-fields">
                <input type="text" value="${this.value}" name="${this.moduleName}.${this.key}" />
                <input type="button" name="${this.moduleName}.${this.key}.pathPicker" data-type="image" data-extensions="jpg,jpeg,png"><i class="fas fa-folder"></i></input>
            </div>
            <p class="notes">${this.hint}</p>
        </div>`;
  }
}

export default ImagePathSetting;
