import MyHooks from "./hooks/index.js";

console.log(MyHooks);
Hooks.once("init", MyHooks.onceInit);
Hooks.once("ready", MyHooks.onceReady);
