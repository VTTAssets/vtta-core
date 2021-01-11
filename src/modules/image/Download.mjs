import config from "../../config/index.mjs";

const getS3Config = () => {
  const s3Endpoint =
    game.data.files.s3 &&
    game.data.files.s3 &&
    game.data.files.s3.endpoint &&
    game.data.files.s3.endpoint.href
      ? game.data.files.s3.endpoint.href
      : null;

  return s3Endpoint;
};

const isS3URL = (url) => {
  const config = getS3Config();
  if (config === null) return false;

  const compare = new URL(url, config.href);
  return compare.host === config.hostname;
};

const isServerURL = (url) => {
  const compare = new URL(url, location.origin);
  return compare.host === location.host;
};

const requiresProxy = (url) => {
  if (isServerURL(url) || isS3URL(url)) {
    return false;
  } else {
    return true;
  }
};

const download = (url) => {
  if (requiresProxy(url)) {
    let proxy = game.settings.get(config.module.name, "proxy");
    // if using VTTA proxy, add the access token to it
    const VTTA_OWNED_PROXIES = ["i.vtta.io", "vttassets.eu.ngrok.io"];
    const isVTTAOwnedProxy = VTTA_OWNED_PROXIES.reduce(
      (isVTTAOwned, hostname) => isVTTAOwned || proxy.search(hostname) !== -1,
      false
    );

    if (isVTTAOwnedProxy) {
      try {
        const access_token = game.settings.get(
          config.module.name,
          "access_token"
        );
        proxy += "?access_token=" + encodeURIComponent(access_token);
      } catch (error) {
        // We are not using a proxy and trying to access the image without one
        // download the image from this proxy
        return new Promise((resolve, reject) => {
          const image = new Image();
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
      }
    }

    url = encodeURIComponent(url);
    if (proxy.indexOf("%URL%") !== -1) {
      url = proxy.replace("%URL%", url);
    } else {
      url = proxy + url;
    }
  }

  // download the image from this proxy
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "Anonymous";
    image.onload = (event) => {
      resolve(image);
    };
    image.onerror = (event) => reject(event);
    image.src = url;
  });
};

export default download;
