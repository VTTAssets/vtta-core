import { semanticVersionCompare } from "./string.js";

const getAvailableVersion = async (manifestLink) => {
  return new Promise((resolve, reject) => {
    fetch(manifestLink)
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw response.statusCode;
        }
      })
      .then((json) => {
        if (json.version) {
          resolve(json.version);
        } else {
          reject("Version unavailable");
        }
      })
      .catch((error) => reject(error));
  });
};

const check = async (moduleName) => {
  // check version number only for GMs
  if (!game.user.isGM) return;

  const moduleInfo = game.modules.get(moduleName);
  if (moduleInfo !== undefined) {
    const installedVersion = moduleInfo.data.version;
    const manifest = moduleInfo.data.manifest;

    if (manifest) {
      try {
        const availableVersion = await getAvailableVersion(manifest);
        return semanticVersionCompare(availableVersion, installedVersion) === 1;
      } catch (error) {
        return false;
      }
    }
  } else {
    return false;
  }
};

export default { check };
