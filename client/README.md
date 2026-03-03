# Procedural WebFPS Demo (Client)

Run with a static server (recommended `http-server` or `npx serve`):

1. From the repository root:
   - `cd client`
   - `npx http-server -c-1 .`  (or `npx serve`)

2. Open the printed local URL in a mobile browser (Chrome Android recommended) or desktop.

This client uses only browser APIs; all assets are procedurally generated at runtime.

Controls:
- Left virtual joystick (touch) to move.
- Right swipe to look around.
- Buttons: Fire, Aim, Reload.
- On desktop: WASD + mouse to look, left-click fire, right-click aim, R reload.

Networking:
- By default client connects to ws://localhost:8080 (server). Edit ./js/multiplayerClient.js to change.