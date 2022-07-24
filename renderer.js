"use strict";

const { app, BrowserWindow, Menu, ipcMain, dialog } = require("electron");
const path = require("path");
const {SerialPort} = require('serialport');
const Modbus = require('jsmodbus');
const matrix = require('matrix-js');
const val = require('./value');
const fs = require('fs');
// const unhandled = require('electron-unhandled');
// var portErr = null;
// const { execSync } = require('child_process');
// var master = null;
// var serialPort = null;
 
// unhandled.logError(Error, {
//   title: 'Title of the Box'
// });

const fsx = require('fs-extra');

var createFileStructure = function() {
  return new Promise(function(resolve, reject) {
      fsx.ensureDirSync('c:\\config');
      fsx.writeFileSync('c:\\config\\config.txt', 'COM2,localhost,rootx,ShaN@19960930,rex,150,150,150,1000', 'utf8');
      resolve();
  });
  };
  
  
  function create(){
  return new Promise(function(resolve, reject) {
      if(fsx.existsSync("c:\\config\\config.txt")) {
      console.log('File exist');
      }
      else{
      createFileStructure().then(function() {
          console.log("Creating file structure")
      })
      .catch(function(err) {
          reject("Error: " + err)
      });
      }
  
      resolve();
  });
}

create();

SerialPort.list().then(function(ports){
  ports.forEach(function(port){
    console.log("Port: ", port.path);
  })
});

const serialPort = new SerialPort({
  path: fs.readFileSync('C:\\config\\config.txt','utf8').split(",")[0],
  baudRate:19200,
  dataBits: 8,
  parity: "even",
  stopBits: 1,
  flowControl: false
}, false);

serialPort.on('error', function(err) { 
  const options = {
    type: 'error',
    title: 'Error!',
    buttons: ['Ok'],
    message: 'Modbus Connection Error!',
    detail: err.message
  };
  const response = dialog.showMessageBoxSync(null, options);
  console.log(response);
  if(response== 0){
    app.quit();
  }
});

// serialPort.on('open', function() { 
const master = new Modbus.client.RTU(serialPort, 1);
// });

function noOfTurnUpdate() {
    console.log(master.connectionState);
    master.readHoldingRegisters(41090, 5)
    .then(resp => {
      // console.log(resp);
      var data = resp.response._body._valuesAsArray.slice(0, 5);
      // console.log("updater", data[0], data[2], data[4]);  // curTrurns, turns, execute ack,
      if(mainWindow != null){
        mainWindow.webContents.send("updater", (data));
      }
      // else{
      //   clearInterval(noOfTurnUpdate);
      //   const options = {
      //     type: 'error',
      //     title: 'Error!',
      //     message: 'Modbus Connection Error!',
      //     detail: 'Please restart the application'
      //   };
    
      //   const response = dialog.showMessageBox(null, options);
      // }
      // if(data[4] ==  1){
      //   console.log("complete execution");
      // }
    })

    ///////////////// un comment
    // .catch(err => {
    //   console.error(err);
    //   // clearInterval(noOfTurnUpdate);
    //     const options = {
    //       type: 'error',
    //       title: 'Error!',
    //       buttons: ['Yes', 'No'],
    //       message: 'Modbus Connection Error!',
    //       detail: 'Please restart the application'
    //     };
  
    //     const response = dialog.showMessageBoxSync(null, options);
    //     console.log(response);
    //     if(response == 0){
    //       mainWindow.webContents.reloadIgnoringCache();
    //     }
    //     if(response == 1){
    //       app.quit();
    //     }
    // });
}

var turnUpdater = null;
// clearInterval(turnUpdater);
// turnUpdater = setInterval(noOfTurnUpdate, 1000);

const A = matrix(val.mat);
const Dis = matrix(val.dis);

// var color_data = [['green', 'black', 'black', 'blue', 'black', 'black', 'green'], [100, 200, 300, 300, 200, 100, 0]];

// Keep a global reference of the mainWindowdow object, if you don't, the mainWindowdow will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = null;
let loginWindow = null;
let subpy = null;

const PY_DIST_FOLDER = "dist-python"; // python distributable folder
const PY_SRC_FOLDER = "web_app"; // path to the python source
const PY_MODULE = "run_app.py"; // the name of the main module

const isRunningInBundle = () => {
  return require("fs").existsSync(path.join(__dirname, PY_DIST_FOLDER));
};

const getPythonScriptPath = () => {
  if (!isRunningInBundle()) {
    return path.join(__dirname, PY_SRC_FOLDER, PY_MODULE);
  }
  if (process.platform === "win32") {
    return path.join(
      __dirname,
      PY_DIST_FOLDER,
      PY_MODULE.slice(0, -3) + ".exe"
    );
  }
  return path.join(__dirname, PY_DIST_FOLDER, PY_MODULE);
};

const startPythonSubprocess = () => {
  let script = getPythonScriptPath();
  if (isRunningInBundle()) {
    subpy = require("child_process").execFile(script, []);
  } else {
    subpy = require("child_process").spawn("python", [script]);
  }
};

const killPythonSubprocesses = (main_pid) => {
  const python_script_name = path.basename(getPythonScriptPath());
  let cleanup_completed = false;
  const psTree = require("ps-tree");
  psTree(main_pid, function (err, children) {
    let python_pids = children
      .filter(function (el) {
        return el.COMMAND == python_script_name;
      })
      .map(function (p) {
        return p.PID;
      });
    // kill all the spawned python processes
    python_pids.forEach(function (pid) {
      process.kill(pid);
    });
    subpy = null;
    cleanup_completed = true;
  });
  return new Promise(function (resolve, reject) {
    (function waitForSubProcessCleanup() {
      if (cleanup_completed) return resolve();
      setTimeout(waitForSubProcessCleanup, 30);
    })();
  });
};

// const createMainWindow = () => {
//   // Create the browser mainWindow
//   mainWindow = new BrowserWindow({
//     width: 800,
//     height: 600,
//     // transparent: true, // transparent header bar
//     icon: __dirname + "/icon.png",
//     // fullscreen: true,
//     // opacity:0.8,
//     // darkTheme: true,
//     // frame: false,
//     resizeable: true,
//   });

//   // Load the index page
//   mainWindow.loadURL("http://localhost:4040/");

//   // Open the DevTools.
//   //mainWindow.webContents.openDevTools();

//   // Emitted when the mainWindow is closed.
//   mainWindow.on("closed", function () {
//     // Dereference the mainWindow object
//     mainWindow = null;
//   });
// };


///////////////////////////////////////////////////////////////////////////////////////////////////////////

const createLoginWindow = () => {
  loginWindow = new BrowserWindow({
      width: 1200,
      height: 720,
      minWidth: 1200,
      minHeight: 720,
      icon: __dirname+'/icon.png',
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      }
      // autoHideMenuBar: true,
      // useContentSize: true,
      // resizable: false,
  });

  loginWindow.webContents.openDevTools();
  // Load the index page
  loginWindow.loadURL("http://localhost:4040/login");

  // Emitted when the mainWindow is closed.
  loginWindow.on("closed", function () {
    // Dereference the mainWindow object
    loginWindow = null;
  });
}

const createMainWindow = () => {
  mainWindow = new BrowserWindow({
      width: 1200,
      height: 720,
      minWidth: 1200,
      minHeight: 720,
      icon: __dirname+'/icon.png',
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      }
      // autoHideMenuBar: true,
      // useContentSize: true,
      // resizable: false,
  });

  mainWindow.webContents.openDevTools();
  // Load the index page
  mainWindow.loadURL("http://localhost:4040/");

  // Emitted when the mainWindow is closed.
  mainWindow.on("closed", function () {
    // Dereference the mainWindow object
    mainWindow = null;
  });
}


ipcMain.handle('login', (event, obj) => {
  validatelogin(obj)
});

ipcMain.handle('test', (event, obj) => {
  console.log(obj);
});

// function validatelogin(obj) {
//   const { username, password} = obj;
//   if(username == "user1"){
//     createMainWindow();
//     mainWindow.show();
//     loginWindow.close();
//     let supv = Menu.buildFromTemplate(supv_menu);
//     Menu.setApplicationMenu(supv);
//   }
// }


function validatelogin(obj) {
  console.log(obj);
  const { username, password, role, login } = obj;

  // createWindow ();
  // win.show();
  // winlogin.close();
  // let supv = Menu.buildFromTemplate(supv_menu);
  // Menu.setApplicationMenu(supv);

  // const serialPort = new SerialPort({
  //   path: fs.readFileSync('C:\\config\\config.txt','utf8').split(",")[0],
  //   baudRate:19200,
  //   dataBits: 8,
  //   parity: "even",
  //   stopBits: 1,
  //   flowControl: false
  // }, false);

  // master = new Modbus.client.RTU(serialPort, 1);

  if(login == true){
    // serialPort = new SerialPort({
    //   path: fs.readFileSync('C:\\config\\config.txt','utf8').split(",")[0],
    //   baudRate:19200,
    //   dataBits: 8,
    //   parity: "even",
    //   stopBits: 1,
    //   flowControl: false
    // }, false);

    // master = new Modbus.client.RTU(serialPort, 1);

    
    
    turnUpdater = setInterval(noOfTurnUpdate, 1000);
    if(role == "admin"){
      createMainWindow();
      mainWindow.show();
      loginWindow.close();
      let supv = Menu.buildFromTemplate(supv_menu);
      Menu.setApplicationMenu(supv);
    }
    else if(role == "sup"){
      createMainWindow();
      mainWindow.show();
      loginWindow.close();
      let supv = Menu.buildFromTemplate(supv_menu);
      Menu.setApplicationMenu(supv);
    }
    else if(role == "opr"){
      createMainWindow();
      mainWindow.show();
      loginWindow.close();
      let opr = Menu.buildFromTemplate(opr_menu);
      Menu.setApplicationMenu(opr);
    }
    else if(role == "qa"){
      createMainWindow();
      mainWindow.show();
      loginWindow.close();
      let qa = Menu.buildFromTemplate(qa_menu);
      Menu.setApplicationMenu(qa);
    }

    // if(portErr == true){
    //   console.log("err");
    //   mainWindow.webContents.send('PortError', "error");
    // }
    // else{
    //   console.log("none");
    //   mainWindow.webContents.send('PortError', "none");
    // }
  }
  else if(login == false){
    // master = null;
    // serialPort = null;
    clearInterval(turnUpdater);
    const options = {
      type: 'error',
      title: 'Error!',
      message: 'Invalid Credential!',
      detail: 'Please check your username or password'
    };

    const response = dialog.showMessageBox(null, options);
  }

}

const supv_menu = [
  {
    label: 'Control Settings',
    submenu: [
      {
        label: 'Create A New File',
        click: function(){
          mainWindow.webContents.send('reply', "sub11");
        }
      },
      {
        label: 'Create Jigs',
        click: function(){
          mainWindow.webContents.send('reply', "sub12");
        }
      },
      {
        label: 'QA Status Change',
        click: function(){
          mainWindow.webContents.send('reply', "sub14");
        }
      },
      {
        label: 'Validation Status Report',
        click: function(){
          mainWindow.webContents.send('reply', "sub13");
        }
      }
    ]
  },

  // {
  //   label: 'Report',
  //   submenu: [
  //     {
  //       label: 'Generate',
  //       click: function(){
  //         mainWindow.webContents.send('reply', "sub31");
  //       }
  //     },
  //     {
  //       label: 'QA Updated History',
  //       click: function(){
  //         mainWindow.webContents.send('reply', "sub32");
  //       }
  //     },
  //   ]
  // },

  {
    label: 'Project',
    submenu: [
      {
        label: 'Order List',
        click: function(){
          mainWindow.webContents.send('reply', "sub21");
        }
      },
      {
        label: 'Execute',
        click: function(){
          mainWindow.webContents.send('reply', "sub22");
        }
      },
    ]
  },

  // {
  //   label: 'Report',
  //   submenu: [
  //     {
  //       label: 'Generate',
  //       click: function(){
  //         mainWindow.webContents.send('reply', "sub31");
  //       }
  //     },
  //     {
  //       label: 'QA Updated History',
  //       click: function(){
  //         mainWindow.webContents.send('reply', "sub32");
  //       }
  //     },
  //   ]
  // },

  {
    label: 'Tools',
    submenu: [
      // {
      //   label: 'Other Operations',
      //   click: function(){
      //     mainWindow.webContents.send('reply', "sub41");
      //   }
      // },
      {
        label: 'Operate Machine',
        click: function(){
          mainWindow.webContents.send('reply', "sub41");
        }
      },
      {
        label: 'Changed Password',
        click: function(){
          mainWindow.webContents.send('reply', "sub42");
        }
      },
      {
        label: 'Changed Config',
        click: function(){
          mainWindow.webContents.send('reply', "sub44");
        }
      },
      {
        label: 'About',
        click: function(){
          mainWindow.webContents.send('reply', "sub43");
        }
      }
    ]
  },

  {
    label: 'Reload',
    click: function(){
      mainWindow.webContents.reloadIgnoringCache();
      mainWindow.webContents.send('reply', "sub11");
    }
  },

  {
    label: 'Logout',
    click: function(){
      createLoginWindow();
      mainWindow.close();
      loginWindow.show();
      mainWindow = null;
    }
  }

];

const qa_menu = [
  {
    label: 'Control Settings',
    submenu: [
      {
        label: 'Create A New File',
        click: function(){
          mainWindow.webContents.send('reply', "sub11");
        }
      },
      {
        label: 'Create Jigs',
        click: function(){
          mainWindow.webContents.send('reply', "sub12");
        }
      },
      {
        label: 'Validation Status Report',
        click: function(){
          mainWindow.webContents.send('reply', "sub13");
        }
      }
    ]
  },

  {
    label: 'Logout',
    click: function(){
      createLoginWindow();
      mainWindow.close();
      loginWindow.show();
    }
  }
];

const opr_menu = [
  {
      label: 'Tools',
      submenu: [
        // {
        //   label: 'Other Operations',
        //   click: function(){
        //     win.webContents.send('reply', "sub41");
        //   }
        // },
        {
          label: 'Operate Machine',
          click: function(){
            mainWindow.webContents.send('reply', "sub41");
          }
        },
        {
          label: 'Changed Password',
          click: function(){
            mainWindow.webContents.send('reply', "sub42");
          }
        },
        {
          label: 'About',
          click: function(){
            mainWindow.webContents.send('reply', "sub43");
          }
        }
      ]
  },
  
  {
    label: 'Logout',
    click: function(){
      createLoginWindow();
      mainWindow.close();
      loginWindow.show();
    }
  }
];

//////////////////////////////////////////////// Auto Mode ////////////////////////////////////////////////

// Act Auto
ipcMain.on('actAuto', function () {
  console.log("actAuto");

  clearInterval(turnUpdater);
  master.readCoils(501, 1)
  .then(resp => {
    // console.log(resp);
    var data = resp.response._body._valuesAsArray.slice(0, 1);
    console.log(data[0]);
    var M501 = data[0];

    if(M501 == 1){
      const options = {
        type: 'error',
        title: 'Error',
        message: 'System in Home Mode',
        detail: 'Plese wait untill the Home Mode is completed'
      };

      const response = dialog.showMessageBox(null, options);
    }
    else{
      setTimeout(() => {
        master.readCoils(20482, 4)
        .then(resp => {
          // console.log(resp);
          var data = resp.response._body._valuesAsArray.slice(0, 4);
          console.log(data);
          // x2 x3 x4 x5
          if(data[0] == 0 || data[1] == 0 || data[2] == 0 || data[3] == 0){
            mainWindow.webContents.send('error', "sensorError");
          }else{
            mainWindow.webContents.send('error', "None");
            master.writeSingleCoil(500, false).then(function (resp) {
              // console.log(resp)
              turnUpdater = setInterval(noOfTurnUpdate, 1000);
            }, function (err) { 
              // console.log(err)
            });
          }
        })
        .catch(err => {
          // console.log(err);
        })
      }, 100);
    }

  })
  .catch(err => {
    const options = {
      type: 'error',
      title: 'Error',
      message: (err.err).toUpperCase(),
      detail: (err.message).toUpperCase()
    };
      const response = dialog.showMessageBox(null, options);
    });

});

ipcMain.handle('logout', (event, obj) => {
  console.log(obj);
  createLoginWindow();
  mainWindow.close();
  loginWindow.show();
});

ipcMain.handle('flash', (event, obj) => {
  // console.log(obj);
  var data = obj.replace(/&#39;/g,'').replace(/[\[\]']+/g,'').split(",");
  const options = {
    type: data[0],
    title: data[1],
    message: data[2],
    detail: data[3]
  };
  const response = dialog.showMessageBox(null, options);
});

// Start Auto mode Programme
// ipcMain.on('startPro', function () {
//   console.log("startPro");
//   for (let i = 0; i < color_data[0].length; i++) {
//     console.log(color_data[0][i]);
//     if(color_data[0][i] == 'green'){ // HD500 
//       console.log(A(i, 0));
//       console.log(const_data[1][0]);
//       // master.writeSingleRegister(A(i, 0), const_data[1][0]);

//       master.writeSingleRegister(A(i, 0), const_data[1][0]).then(function (resp) {
//         // console.log(resp);
//       }, function (err) {
//         console.log(err)
//       });
//     }
//     if(color_data[0][i] == 'blue'){ // HD700
//       console.log(A(i, 2));
//       console.log(const_data[1][1]);
//       // master.writeSingleRegister(A(i, 1), const_data[1][1]);

//       master.writeSingleRegister(A(i, 1), const_data[1][1]).then(function (resp) {
//         // console.log(resp);
//       }, function (err) {
//         console.log(err)
//       });
//     }
//     if(color_data[0][i] == 'black'){ // HD900
//       console.log(A(i, 1));
//       console.log(const_data[1][2]);
//       // master.writeSingleRegister(A(i, 2), const_data[1][2]);

//       master.writeSingleRegister(A(i, 2), const_data[1][2]).then(function (resp) {
//         // console.log(resp);
//       }, function (err) {
//         console.log(err)
//       });
//     }
    
//     console.log(color_data[1][i]);
//     // master.writeSingleRegister(Dis(i), color_data[1][i]);

//     master.writeSingleRegister(Dis(i), color_data[1][i]).then(function (resp) {
//       // console.log(resp);
//     }, function (err) {
//       console.log(err)
//     });
//   };

//   setTimeout(() => {
//     master.writeSingleCoil(2000, true).then(function (resp) {
//       // console.log(resp)
//     }, function (err) { 
//       // console.log(err)
//     });

//   }, 2000);

// });

/////////////////////////////////////////////////////////////////////////////////////

// function exechecker() {
//   master.readInputRegisters(41004, 1)
//   .then(resp => {
//     // console.log(resp);
//     var data = resp.response._body._valuesAsArray.slice(0, 1);
//     // console.log("turnUpdater",data[0]);
//     mainWindow.webContents.send("exechecker", data[0])
//   })
//   .catch(err => {
//     console.error(err)
//   })
// }

// setInterval(exechecker, 30);

/////////////////////////////////////////////////////////////////////////////////////

function clearData(){
  clearInterval(turnUpdater);

  master.writeMultipleRegisters(41090, [0, 0, 0, 0, 0]).then(function (resp) {

      // master.writeSingleCoil(2000, false).then(function (resp) {
      //   // console.log(resp)
      // }, function (err) { 
      //   console.log(err)
      // });
      
      for (let i = 0; i < 100; i++) {

        master.writeSingleRegister(A(i, 0), 0).then(function (resp) {
          // console.log(resp);
        }, function (err) {
          // console.log(err)
        });

        master.writeSingleRegister(A(i, 1), 0).then(function (resp) {
          // console.log(resp);
        }, function (err) {
          // console.log(err)
        });

        master.writeSingleRegister(A(i, 2), 0).then(function (resp) {
          // console.log(resp);
        }, function (err) {
          // console.log(err)
        });

        master.writeSingleRegister(Dis(i), 0).then(function (resp) {
          // console.log(resp);
        }, function (err) {
          // console.log(err)
        });

      }

      master.writeSingleCoil(102, true).then(function (resp) {
        console.log("M102 True")
        master.writeSingleCoil(102, false).then(function (resp) {
          console.log("M102 False")
          console.log("Done");
          turnUpdater = setInterval(noOfTurnUpdate, 1000);
          mainWindow.webContents.send('reply', "sub11");
        }, function (err) { 
          // console.log(err)
        });
      }, function (err) { 
        // console.log(err)
      });

  }, function (err) {
    console.log(err)
  });
}

// Start Auto mode Programme
ipcMain.handle('startPro', (event, obj) => {
  // mainWindow.setMenuBarVisibility(false);

  var { obj, trn } = obj;
  clearInterval(turnUpdater);

  var addData = function() {
    return new Promise(function(resolve, reject) {
      master.writeMultipleRegisters(41090, [0, 0, trn, 0, 1]).then(function (resp) {
      
        var rotVal = fs.readFileSync('C:\\config\\config.txt','utf8').split(",").slice(5, 8).map(Number);
        var const_data = [['green', 'black', 'blue'], rotVal];

        var arr = obj.replace(/[{(',')}]/g, '').split(" ");

        const n = 3;
        const chunk = (arr, size) => {
          const res = [];
          for(let i = 0; i < arr.length; i++) {
              if(i % size === 0){
                res.push([arr[i]]);
              }
              else{
                res[res.length-1].push(arr[i]);
              };
          };
          return res;
        };

        var out = chunk(arr, n);

        for (let i = 0; i < out.length; i++) {
          console.log(out[i][1]);

          if(out[i][1] == 'green'){

            master.writeSingleRegister(A(i, 0), const_data[1][0]).then(function (resp) {
              // console.log(resp);
              console.log(A(i, 0));
              console.log(const_data[1][0]);
            }, function (err) {
              console.log(A(i, 0), " err")
            });
          }
          if(out[i][1] == 'black'){
            
            master.writeSingleRegister(A(i, 1), const_data[1][1]).then(function (resp) {
              // console.log(resp);
              console.log(A(i, 1));
              console.log(const_data[1][1]);
            }, function (err) {
              console.log(A(i, 1), " err")
            });
          }
          if(out[i][1] == 'blue'){
            
            master.writeSingleRegister(A(i, 2), const_data[1][2]).then(function (resp) {
              // console.log(resp);
              console.log(A(i, 2));
              console.log(const_data[1][2]);
            }, function (err) {
              console.log(A(i, 2), " err")
            });
          }

          
          master.writeSingleRegister(Dis(i), parseInt(out[i][2])).then(function (resp) {
            // console.log(resp);
            console.log(parseInt(out[i][2]));
          }, function (err) {
            console.log(out[i][2], " err")
          });
        }

        // bed distance tresh hold
        var beddis = fs.readFileSync('C:\\config\\config.txt','utf8').split(",").slice(8, 9).map(Number);
        master.writeSingleRegister(Dis(out.length), parseInt(beddis[0])).then(function (resp) {
          // console.log(resp);
          console.log(parseInt(beddis[0]));
        }, function (err) {
          console.log((out.length+1), " err")
        });
      });
      resolve();
    });
  }

  addData().then(function () {
    master.writeMultipleCoils(2000, [true, false], 2).then(function (resp) {
      console.log("2000 true");
      turnUpdater = setInterval(noOfTurnUpdate, 1000);

        // master.writeMultipleCoils(2000, [false, false], 2).then(function (resp) {
        //   console.log("2000 false");
        //   turnUpdater = setInterval(noOfTurnUpdate, 1000);
        // }, function (err) { 
        //   // console.log(err)
        // });
    }, function (err) { 
      // console.log(err)
    });
  });

  // master.writeMultipleRegisters(41090, [0, 0, trn, 0, 1]).then(function (resp) {
    
  //     var rotVal = fs.readFileSync('C:\\config\\config.txt','utf8').split(",").slice(5, 8).map(Number);
  //     var const_data = [['green', 'black', 'blue'], rotVal];

  //     var arr = obj.replace(/[{(',')}]/g, '').split(" ");

  //     const n = 3;
  //     const chunk = (arr, size) => {
  //       const res = [];
  //       for(let i = 0; i < arr.length; i++) {
  //           if(i % size === 0){
  //             res.push([arr[i]]);
  //           }
  //           else{
  //             res[res.length-1].push(arr[i]);
  //           };
  //       };
  //       return res;
  //     };

  //     var out = chunk(arr, n);

  //     for (let i = 0; i < out.length; i++) {
  //       console.log(out[i][1]);

  //       if(out[i][1] == 'green'){

  //         master.writeSingleRegister(A(i, 0), const_data[1][0]).then(function (resp) {
  //           // console.log(resp);
  //           console.log(A(i, 0));
  //           console.log(const_data[1][0]);
  //         }, function (err) {
  //           console.log(A(i, 0), " err")
  //         });
  //       }
  //       if(out[i][1] == 'black'){
          
  //         master.writeSingleRegister(A(i, 1), const_data[1][1]).then(function (resp) {
  //           // console.log(resp);
  //           console.log(A(i, 1));
  //           console.log(const_data[1][1]);
  //         }, function (err) {
  //           console.log(A(i, 1), " err")
  //         });
  //       }
  //       if(out[i][1] == 'blue'){
          
  //         master.writeSingleRegister(A(i, 2), const_data[1][2]).then(function (resp) {
  //           // console.log(resp);
  //           console.log(A(i, 2));
  //           console.log(const_data[1][2]);
  //         }, function (err) {
  //           console.log(A(i, 2), " err")
  //         });
  //       }

        
  //       master.writeSingleRegister(Dis(i), parseInt(out[i][2])).then(function (resp) {
  //         // console.log(resp);
  //         console.log(parseInt(out[i][2]));
  //       }, function (err) {
  //         console.log(out[i][2], " err")
  //       });
  //     }

  //     // bed distance tresh hold
  //     var beddis = fs.readFileSync('C:\\config\\config.txt','utf8').split(",").slice(8, 9).map(Number);
  //     master.writeSingleRegister(Dis(out.length), parseInt(beddis[0])).then(function (resp) {
  //       // console.log(resp);
  //       console.log(parseInt(beddis[0]));
  //     }, function (err) {
  //       console.log((out.length+1), " err")
  //     });

  //     setTimeout(() => {
  //       // master.writeMultipleCoils(2000, [true, false], 2).then(function (resp) {
  //       //   // console.log(resp)
  //       // }, function (err) { 
  //       //   console.log(err)
  //       // });

  //       master.writeMultipleCoils(2000, [true, false], 2).then(function (resp) {
  //         console.log("2000 true");
  //           master.writeMultipleCoils(2000, [false, false], 2).then(function (resp) {
  //             console.log("2000 false");
  //             turnUpdater = setInterval(noOfTurnUpdate, 1000);
  //           }, function (err) { 
  //             // console.log(err)
  //           });
  //       }, function (err) { 
  //         // console.log(err)
  //       });

  //       // turnUpdater = setInterval(noOfTurnUpdate, 1000);

  //     }, 1000);

  // // console.log(resp);
  // }, function (err) {
  //   // console.log(err)
  // });

});

// Pause Auto mode Programme
ipcMain.on('pauseRun', function () {
  console.log("pauseRun");
  clearInterval(turnUpdater);

  master.writeSingleCoil(104, true).then(function (resp) {
    console.log("M104 True")
    master.writeSingleCoil(104, false).then(function (resp) {
      console.log("M104 False")
      console.log("Done");
      turnUpdater = setInterval(noOfTurnUpdate, 1000);
    }, function (err) { 
      // console.log(err)
    });
  }, function (err) { 
    // console.log(err)
  });
  
});

// Clear Auto mode Programme
ipcMain.on('stopRun', function () {
  console.log("stopRun");
  // mainWindow.setMenuBarVisibility(true);

  master.writeMultipleCoils(400, [true]).then(function (resp) {
    console.log("M400 True")
    master.writeMultipleCoils(400, [false]).then(function (resp) {
      console.log("M400 False")
      console.log("Done");
      clearData();
    }, function (err) { 
      // console.log(err)
    });
  }, function (err) { 
    // console.log(err)
  });

});

// Act Manual
ipcMain.on('actManual', function () {
  console.log("actManual");
  clearInterval(turnUpdater);

  master.readCoils(500, 2)
  .then(resp => {
    // console.log(resp);
    var data = resp.response._body._valuesAsArray.slice(0, 2);
    // console.log(data);
    var M500 = data[0];
    var M501 = data[1];

    if(M500 == 0 && M501 == 0){
      const options = {
        type: 'warning',
        buttons: ['Yes', 'No'],
        defaultId: 0,
        cancelId: 1,
        title: 'Warning!',
        message: 'Machine in Auto Mode',
        detail: 'Do you want to change it to Manual Mode?'
      };

      dialog.showMessageBox(null, options).then(result =>{
        if (result.response == 0) {
          setTimeout(() => {
            master.writeSingleCoil(500, true).then(function (resp) {
              // console.log(resp)
            }, function (err) { 
              // console.log(err)
            });
          }, 1000);
          mainWindow.webContents.send('manualError', "None");
        }
      });
    }
    else if(M500 == 1 && M501 == 0){
      mainWindow.webContents.send('manualError', "None");
    }
    else if (M500 == 0 && M501 == 1 || (M500 == 1 && M501 == 1)){
      const options = {
        type: 'error',
        title: 'Error',
        message: 'System in Home Mode',
        detail: 'Plese wait untill the Home Mode is completed'
      };

      const response = dialog.showMessageBox(null, options);
      mainWindow.webContents.send('manualError', "Error");
    }

  })
  .catch(err => {
    const options = {
      type: 'error',
      title: 'Error',
      message: (err.err).toUpperCase(),
      detail: (err.message).toUpperCase()
    };
    const response = dialog.showMessageBox(null, options);
  });

});

// read colis function
var reader = null;
function colisRead() {
  master.readCoils(1004, 1)
  .then(resp => {
    // console.log(resp);
    var data = resp.response._body._valuesAsArray.slice(0, 1);
    console.log(data[0]);
    var M1004 = data[0];

    if(M1004 == 1){
      clearInterval(reader);
      master.writeMultipleCoils(501, [false, false], 2).then(function (resp) {
        console.log("501 false");
        turnUpdater = setInterval(noOfTurnUpdate, 1000);
        if(mainWindow != null && M1004 == 1){
          mainWindow.webContents.send('error', "None");
        }
      }, function (err) { 
        // console.log(err)
      });
    }

  })
  .catch(err => {
    console.error(err)
  })
}

// Act Home
ipcMain.on('actHome', function () {
  console.log("actHome");
  // M1004 home done
  clearInterval(turnUpdater);
  master.writeMultipleCoils(501, [true, true], 2).then(function (resp) {
    console.log("501 502 true");
    setTimeout(() => {
      master.writeMultipleCoils(502, [false, false], 2).then(function (resp) { // M400
        console.log("502 false");
        reader = setInterval(colisRead, 1000);
      }, function (err) { 
        // console.log(err)
      });
    }, 500);
  }, function (err) { 
    // console.log(err)
  });

});

//////////////////////////////////////////////// Manual Mode ////////////////////////////////////////////////

// Main Roll
ipcMain.on('upMainRoll', function () {
  console.log("upMainRoll");
  master.writeSingleCoil(22, true).then(function (resp) {
    console.log(resp)

  }, function (err) {
    // console.log(err)
  });
});
ipcMain.on('downMainRoll', function () {
  console.log("downMainRoll");
  master.writeSingleCoil(22, false);
});

// Guid Board
ipcMain.on('pullGuidBoard', function () {
  console.log("pullGuidBoard");
  master.writeSingleCoil(24, true).then(function (resp) {
    console.log(resp)
  }, function (err) {
    // console.log(err)
  });
});
ipcMain.on('resetGuidBoard', function () {
  console.log("resetGuidBoard");
  master.writeSingleCoil(24, false);
});

// Cutter Fwd
ipcMain.on('cutterFwd', function () {
  console.log("cutterFwd");

  master.writeSingleCoil(12, true).then(function (resp) {
    // console.log(resp)
  }, function (err) {
    // console.log(err)
  });

});
ipcMain.on('stpCutter1', function () {
  console.log("stpCutter1");
  master.writeMultipleCoils(12, [false]).then(function (resp) {
    // console.log(resp)
  }, function (err) {
    // console.log(err)
  });
});

// Cutter Rvs
ipcMain.on('cutterRvs', function () {
  console.log("cutterRvs");

  master.writeSingleCoil(34, true).then(function (resp) {
    // console.log(resp)
  }, function (err) {
    // console.log(err)
  });

});
ipcMain.on('stpCutter2', function () {
  console.log("stpCutter2");
  master.writeMultipleCoils(34, [false]).then(function (resp) {
    // console.log(resp)
  }, function (err) {
    // console.log(err)
  });
});

// Cutter Blade
ipcMain.on('bladeon', function () {
  console.log("bladeon");

  master.writeSingleCoil(30, true).then(function (resp) {
    // console.log(resp)
  }, function (err) {
    // console.log(err)
  });

});
ipcMain.on('bladeoff', function () {
  console.log("bladeoff");
  master.writeMultipleCoils(30, [false]).then(function (resp) {
    // console.log(resp)
  }, function (err) {
    // console.log(err)
  });
});

// Preprint1
ipcMain.on('preprint1', function () {
  console.log("preprint1");

  master.writeSingleCoil(14, true).then(function (resp) {
    // console.log(resp)
  }, function (err) {
    // console.log(err)
  });

});
ipcMain.on('stppreprint1', function () {
  console.log("stppreprint1");
  master.writeMultipleCoils(14, [false, false, false, false, false]).then(function (resp) {
    // console.log(resp)
  }, function (err) {
    // console.log(err)
  });
});

// Preprint2
ipcMain.on('preprint2', function () {
  console.log("preprint2");

  master.writeSingleCoil(16, true).then(function (resp) {
    // console.log(resp)
  }, function (err) {
    // console.log(err)
  });

});
ipcMain.on('stppreprint2', function () {
  console.log("stppreprint2");
  master.writeMultipleCoils(16, [false, false, false, false, false]).then(function (resp) {
    // console.log(resp)
  }, function (err) {
    // console.log(err)
  });
});

// Preprint3
ipcMain.on('preprint3', function () {
  console.log("preprint3");

  master.writeSingleCoil(18, true).then(function (resp) {
    // console.log(resp)
  }, function (err) {
    // console.log(err)
  });

});
ipcMain.on('stppreprint3', function () {
  console.log("stppreprint3");
  master.writeMultipleCoils(18, [false, false, false, false, false]).then(function (resp) {
    // console.log(resp)
  }, function (err) {
    // console.log(err)
  });
});

// Braid Out
ipcMain.on('getBaridOut', function () {
  console.log("getBaridOut");
  master.writeMultipleCoils(32, [true, null, null, null, null, null, null, null, true]).then(function (resp) {
    // console.log(resp)
  }, function (err) {
    // console.log(err)
  });
});
ipcMain.on('resetgetBaridOut', function () {
  console.log("resetgetBaridOut");
  master.writeMultipleCoils(32, [false, null, null, null, null, null, null, null, false]).then(function (resp) {
    // console.log(resp)
  }, function (err) {
    // console.log(err)
  });
});

// Braid In
ipcMain.on('dragBaraidIn', function () {
  console.log("dragBaraidIn");
  master.writeSingleCoil(32, true).then(function (resp) {
    console.log(resp)
  }, function (err) {
    // console.log(err)
  });
});
ipcMain.on('resetdragBaraidIn', function () {
  console.log("resetdragBaraidIn");
  master.writeSingleCoil(32, false);
});


// Dragging Roll
ipcMain.on('releaseDraggingRoll', function () {
  console.log("releaseDraggingRoll");
  master.writeSingleCoil(28, true).then(function (resp) {
    console.log(resp)
  }, function (err) {
    // console.log(err)
  });
});
ipcMain.on('setDraggingRoll', function () {
  console.log("setDraggingRoll");
  master.writeSingleCoil(28, false);
});

// Set Heat Seal
ipcMain.on('setHeat', function () {
  console.log("setHeat");
  master.writeSingleCoil(10, true).then(function (resp) {
    console.log(resp)
  }, function (err) {
    // console.log(err)
  });
});
ipcMain.on('resetsetHeat', function () {
  console.log("resetsetHeat");
  master.writeSingleCoil(10, false);
});

// Ink Roll
ipcMain.on('runInkRoll', function () {
  console.log("runInkRoll");
  master.writeSingleCoil(33, true).then(function (resp) {
    console.log(resp)
  }, function (err) {
    // console.log(err)
  });
});
ipcMain.on('stopInkRoll', function () {
  console.log("stopInkRoll");
  master.writeSingleCoil(33, false).then(function (resp) {
    console.log(resp)
  }, function (err) {
    // console.log(err)
  });
});

///////////////////////////////////////////////////////////////////

var readerManual = null;
function colisReadManual() {
  master.readCoils(1004, 1)
  .then(resp => {
    // console.log(resp);
    var data = resp.response._body._valuesAsArray.slice(0, 1);
    console.log(data[0]);
    var M1004 = data[0];

    if(M1004 == 1){
      clearInterval(readerManual);
      master.writeMultipleCoils(501, [false, false], 2).then(function (resp) {
        console.log("501 false");
        turnUpdater = setInterval(noOfTurnUpdate, 1000);
        if(mainWindow != null && M1004 == 1){
          mainWindow.webContents.send('reply', "sub11");
        }
      }, function (err) { 
        // console.log(err)
      });
    }

  })
  .catch(err => {
    console.error(err)
  })
}

ipcMain.on('btnactHomeManual', function () {
  console.log("btnactHomeManual");

  master.writeMultipleCoils(501, [true, true], 2).then(function (resp) {
    console.log("501 502 true");
    setTimeout(() => {
      master.writeMultipleCoils(502, [false, false], 2).then(function (resp) { // M400
        console.log("502 false");
        readerManual = setInterval(colisReadManual, 1000);
      }, function (err) { 
        // console.log(err)
      });
    }, 500);
  }, function (err) { 
    // console.log(err)
  });

});

ipcMain.handle('showmodal', (event, obj) => {
  console.log(obj);
  const options = {
    type: 'none',
    title: 'Modal!',
    message: 'Modal'
  };

  const response = dialog.showMessageBox(null, options);
});























///////////////////////////////////////////////////////////////////////////////////////////////////////////


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", function () {
  // start the backend server
  startPythonSubprocess();
  // createMainWindow();
  createLoginWindow();
});


// disable menu
app.on("browser-window-created", function (e, window) {
  window.setMenu(null);
});

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  app.quit();
  if (process.platform !== "darwin") {
    let main_process_pid = process.pid;
    killPythonSubprocesses(main_process_pid).then(() => {
      app.quit();
    });
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (subpy == null) {
    startPythonSubprocess();
  }
  if (win === null) {
    createMainWindow();
  }
});

const {exec} = require('child_process');
const find = require('find-process');

app.on("quit", function (event) {
  // do some additional cleanup

  ipcMain.removeAllListeners();
  let main_process_pid = process.pid;
  // process.kill(main_process_pid, 'ready');
  killPythonSubprocesses(main_process_pid).then(() => {
    app.quit();
  });

  // execSync('taskkill /f /im  electron.exe');
  // execSync('taskkill /f /im  Runtime Broker.exe');
  // execSync('taskkill /f /im  run_app.exe');
  // execSync('taskkill /f /im  python.exe');

  exec(`taskkill /f /im Python.exe /t`, (err, stdout, stderr) =>{
    if(err){
      throw err
    }
    console.log('stdout', stdout);
    console.log('err', err);
  });

  find('name', 'electron', true)
  .then(function (list) {
    if(list.length != 0){
      exec(`taskkill /f /im electron.exe /t`, (err, stdout, stderr) =>{
        if(err){
          throw err
        }
        console.log('stdout', stdout);
        console.log('err', err);
      });
    }
  });

  find('name', 'run_app', true)
  .then(function (list) {
    if(list.length != 0){
      exec(`taskkill /f /im run_app.exe /t`, (err, stdout, stderr) =>{
        if(err){
          throw err
        }
        console.log('stdout', stdout);
        console.log('err', err);
      });
    }
  });

  // find('name', 'Runtime Broker', true)
  // .then(function (list) {
  //   if(list.length != 0){
      exec(`taskkill /f /im RuntimeBroker.exe /t`, (err, stdout, stderr) =>{
        if(err){
          throw err
        }
        console.log('stdout', stdout);
        console.log('err', err);
      });
  //   }
  // });

  mainWindow = null;
  loginWindow = null;

});



////////////////////////////////////////////////////////////////////////////////////////

// unhandled({
//   logger: (err) => {
//     console.error();
//     console.log(err.message);
//     if (err.name == "Error") {
//       portErr = true;
//     }
//     else{
//       portErr = false;
//     }
//   },
//   showDialog: true,
//   // reportButton: (error) => {
//   //     console.log('Report Button Initialized');
//   // },

// });