const electron = require('electron')
const Menu = electron.Menu

var template = [{
  submenu: [{
    label: '退出',
    accelerator: 'CmdOrCtrl+Q',
    role: 'quit'
  }, {
    label: '重新加载',
    accelerator: 'CmdOrCtrl+R',
    role: 'reload'
  }
  ]
},
{
  label: '编辑',
  submenu: [{
    label: '撤销',
    accelerator: 'CmdOrCtrl+Z',
    role: 'undo'
  }, {
    label: '重做',
    accelerator: 'Shift+CmdOrCtrl+Z',
    role: 'redo'
  }, {
    type: 'separator'
  }, {
    label: '复制',
    accelerator: 'CmdOrCtrl+C',
    role: 'copy'
  }, {
    label: '粘贴',
    accelerator: 'CmdOrCtrl+V',
    role: 'paste'
  }, {
    label: '剪切',
    accelerator: 'CmdOrCtrl+X',
    role: 'cut'
  }, {
    label: '全选',
    accelerator: 'CmdOrCtrl+A',
    role: 'selectAll'
  }]
}, {
  label: '视图',
  submenu: [{
    label: '放大',
    accelerator: 'CmdOrCtrl+=',
    role: 'zoomin'
  },
  {
    label: '缩小',
    accelerator: 'CmdOrCtrl+-',
    role: 'zoomout'
  },
  {
    label: '重置缩放',
    accelerator: 'CmdOrCtrl+NumPad0',
    role: 'resetzoom'
  }
  ]
}
];

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)