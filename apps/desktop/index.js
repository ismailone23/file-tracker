const path = require("path");
const fs = require("fs");
const http = require("http");
const { spawn } = require("child_process");
const { app, BrowserWindow } = require("electron");

const isDev = !app.isPackaged;
const prodPort = process.env.PORT || "3900";
let webServerProcess = null;

if (process.platform === "win32") {
  app.setAppUserModelId("com.filetracker.desktop");
}

function getStartUrl() {
  const cliUrlArg = process.argv.find((arg) => arg.startsWith("--url="));
  if (cliUrlArg) {
    return cliUrlArg.replace("--url=", "");
  }

  return isDev ? "http://localhost:3000" : `http://127.0.0.1:${prodPort}`;
}

function findStandaloneServerPath() {
  const base = path.join(process.resourcesPath, "web-dist", "standalone");
  const candidates = [
    path.join(base, "server.js"),
    path.join(base, "apps", "web", "server.js"),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate));
}

function waitForServer(url, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;

  return new Promise((resolve, reject) => {
    const attempt = () => {
      const req = http.get(url, (res) => {
        res.resume();
        resolve();
      });

      req.on("error", () => {
        if (Date.now() > deadline) {
          reject(new Error(`Timed out waiting for web server at ${url}`));
          return;
        }

        setTimeout(attempt, 250);
      });

      req.setTimeout(1000, () => {
        req.destroy();
      });
    };

    attempt();
  });
}

async function ensureProductionServer() {
  if (isDev || webServerProcess) {
    return;
  }

  const serverPath = findStandaloneServerPath();
  if (!serverPath) {
    throw new Error(
      "Could not find Next standalone server.js in packaged resources.",
    );
  }

  webServerProcess = spawn(process.execPath, [serverPath], {
    cwd: path.dirname(serverPath),
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
      NODE_ENV: "production",
      HOSTNAME: "127.0.0.1",
      PORT: String(prodPort),
    },
    stdio: "ignore",
    windowsHide: true,
  });

  webServerProcess.unref();
  await waitForServer(getStartUrl());
}

async function createWindow() {
  await ensureProductionServer();

  const iconPath = path.join(__dirname, "..", "web", "app", "favicon.ico");
  const resolvedIconPath = fs.existsSync(iconPath) ? iconPath : undefined;

  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1024,
    minHeight: 680,
    backgroundColor: "#0f172a",
    icon: resolvedIconPath,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  const startUrl = getStartUrl();
  win.loadURL(startUrl);

  if (isDev) {
    win.webContents.openDevTools({ mode: "detach" });
  }
}

app.whenReady().then(() => {
  createWindow().catch((error) => {
    // Fail fast if the packaged web server cannot start.
    process.stderr.write(`${error.message}\n`);
    app.quit();
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow().catch(() => {
        app.quit();
      });
    }
  });
});

app.on("before-quit", () => {
  if (webServerProcess && !webServerProcess.killed) {
    webServerProcess.kill();
    webServerProcess = null;
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
