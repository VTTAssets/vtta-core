import config from "../../config/index.js";
import logger from "../../util/logger.js";
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
        reject(event);
      };
      image.src = url + "?cacheblock=true";
    });
  };

  const imageToDataUrl = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = (event) => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.getContext("2d").drawImage(img, 0, 0);
        resolve(canvas.toDataUrl("jpg"));
      };
      img.src = url;
    });
  };

  // if it's an internal URL, just load it and get on with life
  if (DirectoryPicker.isInternalURL(url)) {
    return loadImage(url);
  }

  const KNOWN_CORS_HOSTS = [
    "www.dndbeyond.com",
    "media.dndbeyond.com",
    "media-waterdeep.cursecdn.com",
  ];
  // if it's an external URL, try to load it and see what happens

  try {
    if (KNOWN_CORS_HOSTS.includes(new URL(url).host)) {
      throw "Known CORS Host, do not try to download it directly";
    } else {
      let img = await loadImage(url);
      return img;
    }
  } catch (error) {
    let proxy = game.settings.get(config.module.name, "custom-image-proxy");

    /**
     * If a custom image proxy is configured, will will use this and it's either hit or miss
     */
    if (!proxy || (typeof proxy === "string" && proxy.length === 0)) {
      // get the relevant VTTA proxy
      const PROXY_CONFIG = new Map([
        ["PRODUCTION", "https://i.vtta.io/dl/%URL%"],
        ["STAGING", "https://i.vtta.dev/dl/%URL%"],
      ]);
      proxy = PROXY_CONFIG.get(config.module.name, "environment");
      if (!proxy) proxy = PROXY_CONFIG.get("PRODUCTION");
    }

    const access_token = game.settings.get(config.module.name, "access_token");
    proxy += "?access_token=" + encodeURIComponent(access_token);

    url = encodeURIComponent(url);
    if (proxy.indexOf("%URL%") !== -1) {
      url = proxy.replace("%URL%", url);
    } else {
      url = proxy + url;
    }

    try {
      const img = await loadImage(url);
      return img;
    } catch (error) {
      logger.error(
        "[VTTA-CORE] Could not download the image from " + url,
        error
      );
      throw error;
    }
  }
};

export default download;
