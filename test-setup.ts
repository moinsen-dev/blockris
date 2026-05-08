// Test-time setup: register happy-dom globals (window, document,
// HTMLElement, KeyboardEvent, etc.) so DOM-touching modules can be
// tested with `bun test` without per-file boilerplate.
import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register();
