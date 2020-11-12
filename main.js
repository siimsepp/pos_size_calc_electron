const { app, BrowserWindow, Menu, ipcMain } = require('electron')

process.env.NODE_ENV = 'production'
// process.env.NODE_ENV = 'development'

const isDev = process.env.NODE_ENV !== 'production' ? true : false
const isMac = process.platform === 'darwin' ? true : false

let mainWindow
let aboutWindow

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: 'Position Size Calculator',
    width: isDev ? 700 : 620,
    height: 620,
    icon: `${__dirname}/assets/icons/icon.png`,
    resizable: isDev ? true : false,
    backgroundColor: 'white',
    webPreferences: {
      nodeIntegration: true,
    },
  })

  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.loadFile('./app/index.html')
}

function createAboutWindow() {
  aboutWindow = new BrowserWindow({
    title: 'About Position Size Calculator',
    width: 360,
    height: 440,
    icon: `${__dirname}/assets/icons/icon.png`,
    resizable: false,
    backgroundColor: 'white',
  })

  aboutWindow.setMenuBarVisibility(false)
  aboutWindow.loadFile('./app/about.html')
}

app.on('ready', () => {
  createMainWindow()

  const mainMenu = Menu.buildFromTemplate(menu)
  Menu.setApplicationMenu(mainMenu)
})

const menu = [
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            {
              label: 'About',
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
  {
    role: 'fileMenu',
  },
  ...(!isMac
    ? [
        {
          label: 'Help',
          submenu: [
            {
              label: 'About',
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
  ...(isDev
    ? [
        {
          label: 'Developer',
          submenu: [{ role: 'reload' }, { role: 'forcereload' }, { type: 'separator' }, { role: 'toggledevtools' }],
        },
      ]
    : []),
]

// Kuulame eventi rendererilt
ipcMain.on('andmed:form', (e, args) => {
  console.log(args)
  const tulemus = arvutaVastus(args)

  // Saadame tagasi rendererile
  e.sender.send('vastus', tulemus)
})

app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow()
  }
})

function arvutaVastus(andmedVormilt) {
  const maxLoss = (andmedVormilt.portfolioAmt * andmedVormilt.riskAmt) / 100
  const stocks = maxLoss / Math.abs(andmedVormilt.stopAmt - andmedVormilt.priceAmt)
  const posiSize = stocks * andmedVormilt.priceAmt
  const posiSizeStocks = posiSize / andmedVormilt.priceAmt
  return { posiSize, posiSizeStocks }
}
