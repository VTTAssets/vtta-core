import DirectoryPicker from "../settings/DirectoryPicker.js";
import logger from "../../util/logger.js";

const upload = async (targetPath, filename, data, overwriteExisting = true) => {
  if (overwriteExisting === false) {
    const url = DirectoryPicker.URLFromDescriptor(targetPath + "/" + filename);
    let fileExists = false;
    try {
      fileExists = await srcExists(url);
    } catch (error) {
      fileExists = false;
    }
    if (fileExists) {
      return {
        status: "success",
        path: url,
      };
    }
  }

  // inspect the target path
  const details = DirectoryPicker.parse(targetPath);
  // traverse all subdirectories for user data store and create them, if they are missing
  if (details.activeSource === "data") {
    // create the directory structure, if it does not exist already
    let subdirectories = details.current
      .split("/")
      .filter((subdirectory) => subdirectory.length > 0);

    let subdirectory = "";
    while (subdirectories.length) {
      subdirectory += "/" + subdirectories.shift();
      try {
        await FilePicker.createDirectory("data", subdirectory);
        logger.info(`[data] ${subdirectory} created`);
      } catch (error) {
        if (error.indexOf("EEXIST") === 0) {
          logger.info(`[data] ${subdirectory} already exists`);
        }
      }
    }
  }

  // do the actual upload and return the result straight from the upload
  let file = new File([data], filename, { type: data.type });
  return window.vtta.settings.DirectoryPicker.uploadToPath(targetPath, file);
};

export default upload;
