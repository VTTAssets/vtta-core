import config from "../../config/index.js";
import DirectoryPicker from "../settings/DirectoryPicker.js";

const download = async (url) => {
  const loadImage = (url) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = "Anonymous";
      image.onload = (event) => {
        resolve(image);
      };

      image.onerror = (event) => {
        console.log("Error on downloading the image");
        console.log(event);
        reject(event);
      };
      image.src = url;
    });
  };

  // if it's an internal URL, just load it and get on with life
  if (DirectoryPicker.isInternalURL(url)) {
    return loadImage(url);
  }

  // if it's an external URL, try to load it and see what happens
  try {
    console.log("[VTTA-CORE] Downloading image, 1st try...");
    let img = await loadImage(url);
    console.log("[VTTA-CORE] That worked");
    return img;
  } catch (error) {
    console.log("[VTTA-CORE] Failed, try using the proxy...");
    // try to load it by using the proxy

    let proxy = game.settings.get(config.module.name, "proxy");
    // if using VTTA proxy, add the access token to it
    const VTTA_OWNED_PROXIES = ["i.vtta.io", "vttassets.eu.ngrok.io"];
    const isVTTAOwnedProxy = VTTA_OWNED_PROXIES.reduce(
      (isVTTAOwned, hostname) => isVTTAOwned || proxy.search(hostname) !== -1,
      false
    );

    if (isVTTAOwnedProxy) {
      const access_token = game.settings.get(
        config.module.name,
        "access_token"
      );
      proxy += "?access_token=" + encodeURIComponent(access_token);
    }

    url = encodeURIComponent(url);
    if (proxy.indexOf("%URL%") !== -1) {
      url = proxy.replace("%URL%", url);
    } else {
      url = proxy + url;
    }

    console.log("[VTTA-CORE] URL: " + url);
    try {
      const img = await loadImage(url);
      console.log("[VTTA-CORE] No error yet, returning the image");
      return img;
    } catch (error) {
      console.log("[VTTA-CORE] That's an error, too");
      console.log(error);
      throw error;
    }
  }
};

export default download;
