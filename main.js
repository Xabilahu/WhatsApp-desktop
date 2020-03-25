const { app, Tray, nativeImage, Menu, BrowserWindow } = require('electron')
fs = require('fs')
pimage = require('pureimage')

var iconPath = './res/icon.png'
var iconBalloonPath = './res/iconBalloon.png'
var iconUpdated = false

function createWindow() {
    win = new BrowserWindow({
        width: 1200,
        height: 800,
        title: 'WhatsApp',
        autoHideMenuBar: true, 
        webPreferences: {
            nodeIntegration: true
        }
    })

    configureTray()

    win.loadURL('http://web.whatsapp.com', {userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.100 Safari/537.36'})

    win.on('page-title-updated', (_, title, x) => {
        let re = /\d+/
        let match = re.exec(title)
        if (match) {
            drawBalloon(match[0])
            win.icon = iconBalloonPath
            tr.setImage(iconBalloonPath)
        } else {
            win.icon = iconPath
            tr.setImage(iconPath)
        }
    })

    win.on('closed', () => {
        win = null
    })

}

function configureTray() {
    tr = new Tray(nativeImage.createFromPath(iconPath))
    let contextMenu = Menu.buildFromTemplate([
        {label : 'Dark Theme', click : function(){
            win.darkTheme = true
        }},
        {type : 'separator'},
        {label : 'Close', click : function(){
            app.quit()
        }}
    ])
    tr.setToolTip('WhatsApp')
    tr.setContextMenu(contextMenu)
}

function drawBalloon(n) {

    pimage.decodePNGFromStream(fs.createReadStream(iconPath)).then((img) => {
        var fnt = pimage.registerFont('./res/Helvetica.ttf','Helvetica');
        fnt.load(() => {
            let canvas = pimage.make(480, 480)
            let cv = canvas.getContext('2d')

            cv.drawImage(img)
            cv.beginPath();
            cv.arc(362, 112, 78, 0, 2 * Math.PI, false);
            cv.fillStyle = '#f70201'; //red
            cv.fill();
            cv.lineWidth = 2;
            cv.strokeStyle = '#ffffff';
            cv.stroke();

            cv.fillStyle = '#ffffff'
            cv.font = "72px Helvetica"
            let text = n
            let xCoord = 318

            if (n > 99) text = "99"
            else if (n < 10) xCoord = 342

            cv.fillText(text, xCoord, 130)
            pimage.encodePNGToStream(canvas, fs.createWriteStream(iconBalloonPath)).then(() => {})
        })
    })
}

app.allowRendererProcessReuse = true

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
})
  
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})