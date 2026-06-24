import { app, autoUpdater, dialog, shell } from "electron";
import { updateElectronApp, UpdateSourceType } from "update-electron-app";
import { getLogger } from "./logger";
import { getStateManager } from "./state";

/**
 * Setup the auto updater - DISABLED for localhost/LAN mode
 */
export function setupAutoUpdater() {
  getLogger().info("Auto-updater disabled - running in localhost/LAN mode");
  // Auto-updates are disabled to ensure 100% offline operation
  // and prioritize LAN access without external network calls
}

/**
 * Check if a new update is available
 *
 * @returns {Promise<boolean>} True if a new update is available, false otherwise
 */
export function getIsNewUpdateAvailable() {
  return new Promise((resolve, reject) => {
    if (!autoUpdater.getFeedURL()) {
      return reject(`The auto updater did not initialize with a feed URL`);
    }

    autoUpdater.once("update-available", () => {
      resolve(true);
    });

    autoUpdater.once("update-not-available", () => {
      resolve(false);
    });

    autoUpdater.checkForUpdates();
  });
}

/**
 * Check for updates - DISABLED for localhost/LAN mode
 *
 * @returns {Promise<void>}
 */
export async function checkForUpdates() {
  return dialog.showMessageBox({
    type: "info",
    title: "Updates Disabled",
    message:
      "Auto-updates are disabled in localhost/LAN mode. Clippy runs 100% offline for maximum privacy and LAN accessibility.",
  });
}

/**
 * Get the version comparison string
 *
 * @returns {Promise<string>} The version comparison string
 */
export async function getVersionComparisonString() {
  const latestVersionTagName = await getLatestVersionFromGitHub();
  const latestVersionString = latestVersionTagName
    ? `  The latest published version is ${latestVersionTagName}.`
    : "";

  return `You are on version ${app.getVersion()}.${latestVersionString}`;
}

/**
 * Get's the latest version's tag_name from GitHub. Returns null if it fails.
 *
 * @returns {Promise<string>} The latest version from GitHub
 */
export async function getLatestVersionFromGitHub(): Promise<string | null> {
  try {
    const response = await fetch(
      "https://api.github.com/repos/felixrieseberg/clippy/releases/latest",
    );
    const data = await response.json();
    return data.tag_name;
  } catch (error) {
    getLogger().warn("Failed to fetch latest version from GitHub", error);

    return null;
  }
}
