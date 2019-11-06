var { ipcMain } = require('electron');

ipcMain.on('commun', (event, data)=>{
    console.log(data);
}) 

