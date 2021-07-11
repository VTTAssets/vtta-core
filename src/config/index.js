const config = {
  module: {
    name: "vtta-core",
    label: "VTTA Core",
  },
  messaging: {
    core: {
      query: "vtta-core.query",
      response: "vtta-core.available",
    },
    extension: {
      default: "CMD_SEND_FOUNDRY_MESSAGE",
      query: "vtta-ddb.query",
    },
  },
};

export default config;
