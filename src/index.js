import MyHooks from "./hooks/index.js";

Hooks.once("init", MyHooks.onceInit);
Hooks.once("ready", MyHooks.onceReady);
