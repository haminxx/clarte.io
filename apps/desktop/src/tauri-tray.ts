/**
 * System tray setup: minimize to tray on window close, show on tray click.
 */
import { getCurrentWindow } from "@tauri-apps/api/window"
import { TrayIcon } from "@tauri-apps/api/tray"
import { defaultWindowIcon } from "@tauri-apps/api/app"
import { Menu } from "@tauri-apps/api/menu"

export async function setupTray() {
  const appWindow = getCurrentWindow()

  const menu = await Menu.new({
    items: [
      { id: "show", text: "Show Clarte" },
      { id: "quit", text: "Quit" },
    ],
  })

  menu.on("click", (event) => {
    if (event.id === "show") {
      appWindow.show()
      appWindow.setFocus()
    }
    if (event.id === "quit") {
      appWindow.close()
    }
  })

  const icon = await defaultWindowIcon()
  const tray = await TrayIcon.new({
    ...(icon && { icon }),
    tooltip: "Clarte",
    menu,
    menuOnLeftClick: false,
  })

  tray.on("click", () => {
    appWindow.show()
    appWindow.setFocus()
  })

  appWindow.on("close-requested", async (e) => {
    e.preventDefault()
    appWindow.hide()
  })
}
