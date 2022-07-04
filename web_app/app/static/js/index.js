var { ipcRenderer, remote } = require("electron");
var users = null;
var index = null;
const fs = require('fs');

function myFunc(vars) {
    users = vars;
    console.log(users);
}

window.onload = function() {
    var username = document.getElementById("InputName");
    var password = document.getElementById("InputPassword");
    var btnlogin = document.getElementById("loginbtn");

    // console.log(username.value, password.value);
    btnlogin.onclick = function(){

            for(const property in users){
                var result = users[property].includes(username.value) && users[property].includes(password.value);
                if(result == true){
                    index = property;
                }
            }
    
            if(index != null){
                if(users[index][0] == username.value && users[index][1] == password.value){
                    console.log("done");
                    const obj = {username:username.value, password:password.value, role:users[index][2], login:true};
                    ipcRenderer.invoke("login", obj);
                }
                else{
                    const obj = {username:null, password:null, role:null, login:false};
                    ipcRenderer.invoke("login", obj);
                }
            }
            // else{
            //     const obj = {username:null, password:null, role:null, login:false};
            //     ipcRenderer.invoke("login", obj);
            // }
        

        // const obj = {username:username.value, password:password.value, role:"admin", login:true};
        // ipcRenderer.invoke("login", obj);
    }
}

function hideAll() {
    document.getElementById('file-container').style.display = 'none';
    document.getElementById('jigs-container').style.display = 'none';
    document.getElementById('report-container').style.display = 'none';
    document.getElementById('about-container').style.display = 'none';
    document.getElementById('change-pswd-container').style.display = 'none';
    document.getElementById('change-config-container').style.display = 'none';
    document.getElementById('operate-container').style.display = 'none';
    document.getElementById('list-container').style.display = 'none';
    document.getElementById('execute-container').style.display = 'none';
    document.getElementById('execute-error-container').style.display = 'none';
    document.getElementById('operate-error-container').style.display = 'none';
    document.getElementById('qa-status-container').style.display = 'none';
}

ipcRenderer.on("reply", (event, data)=>{
    console.log(data);
    if(data == 'sub11'){
        hideAll();
        document.getElementById('file-container').style.display = 'block';
    }
    if(data == 'sub12'){
        hideAll();
        document.getElementById('jigs-container').style.display = 'block';     
    }
    if(data == 'sub13'){
        hideAll();
        document.getElementById('report-container').style.display = 'block';
    }
    if(data == 'sub14'){
        hideAll();
        document.getElementById('qa-status-container').style.display = 'block';
    }

    if(data == 'sub21'){
        hideAll();
        document.getElementById('list-container').style.display = 'block';
    }
    if(data == 'sub22'){
        hideAll();
        document.getElementById('execute-error-container').style.display = 'block';
    }

    // if(data == 'sub31'){
    //     hideAll();
    //     document.getElementById('generate-container').style.display = 'block';
    // }
    // if(data == 'sub32'){
    //     hideAll();
    //     document.getElementById('qa-report-container').style.display = 'block';
    // }

    // if(data == 'sub41'){
    //     hideAll();
    //     document.getElementById('other-container').style.display = 'block';
    // }

    if(data == 'sub41'){
        hideAll();
        document.getElementById('operate-error-container').style.display = 'block';
    }
    if(data == 'sub42'){
        hideAll();
        document.getElementById('change-pswd-container').style.display = 'block';
        // updatebtn.onclick = function(){
        //     var username = document.getElementById("InputUserName");
        //     var password = document.getElementById("InputUserPassword");
        //     var newpassword = document.getElementById("InputNewPassword");

        //     const obj = {username:username.value, password:password.value, newpassword:newpassword.value};
        //     ipcRenderer.invoke("test", obj);
        // }
    }
    if(data == 'sub43'){
        hideAll();
        document.getElementById('about-container').style.display = 'block';
    }
    if(data == 'sub44'){
        hideAll();
        document.getElementById('change-config-container').style.display = 'block';

        var fileData = fs.readFileSync('c:\\config\\config.txt','utf8').split(",");
        document.getElementsByName('rpm1')[0].value = fileData[5];
        document.getElementsByName('rpm2')[0].value = fileData[6];
        document.getElementsByName('rpm3')[0].value = fileData[7];
        document.getElementsByName('ltresh')[0].value = fileData[8];

    }
});



ipcRenderer.on("error", (event, data)=>{
    console.log(data);
    if(data == "None"){
        hideAll();
        document.getElementById('execute-container').style.display = 'block';
        document.getElementById('execute-error-container').style.display = 'none';
        document.getElementById('error-code').style.display = 'none';
        document.getElementById('btnActHome').style.display = 'none';
    }
    else{
        hideAll();
        document.getElementById('execute-container').style.display = 'none';
        document.getElementById('execute-error-container').style.display = 'block';
        document.getElementById('error-code').style.display = 'block';
        document.getElementById('btnActHome').style.display = 'block';
    }
});

ipcRenderer.on("manualError", (event, data)=>{
    console.log(data);
    if(data == "None"){
        hideAll();
        document.getElementById('operate-container').style.display = 'block';
        document.getElementById('operate-error-container').style.display = 'none';
    }
    else{
        hideAll();
        document.getElementById('operate-container').style.display = 'none';
        document.getElementById('operate-error-container').style.display = 'block';
    }
});

ipcRenderer.on("PortError", (event, data)=>{
    console.log(data);
});

// Auto Mode
btnActAuto.addEventListener('click', actAuto);
function actAuto() {
    ipcRenderer.send('actAuto');
}

// Manual Mode
btnActManual.addEventListener('click', actManual);
function actManual() {
    console.log('actManual');
    ipcRenderer.send('actManual');
}

btnActHome.addEventListener('click', actHome);
function actHome() {
    ipcRenderer.send('actHome');
}

btnStart.addEventListener('click', startPro);
function startPro() {
    // ipcRenderer.send('clearRun');
    ipcRenderer.send('startPro');
}

function pauseRun(){
    ipcRenderer.send('pauseRun');
}

function stopRun(){
    ipcRenderer.send('stopRun');
    // ipcRenderer.send('actHome');
}

btnactHomeManual.addEventListener('click', actHomeManual);
function actHomeManual() {
    ipcRenderer.send('btnactHomeManual');
}

// Main Roll
btnUpMainRoll.addEventListener('click', upMainRoll);
function upMainRoll() {
    ipcRenderer.send('upMainRoll');
    document.getElementById('btnUpMainRoll').style.display = 'none';
    document.getElementById('btnDownMainRoll').style.display = 'block';
}
btnDownMainRoll.addEventListener('click', downMainRoll);
function downMainRoll() {
    ipcRenderer.send('downMainRoll');
    document.getElementById('btnUpMainRoll').style.display = 'block';
    document.getElementById('btnDownMainRoll').style.display = 'none';
}

// Guid Board
btnPullGuidBoard.addEventListener('click', pullGuidBoard);
function pullGuidBoard() {
    ipcRenderer.send('pullGuidBoard');
    document.getElementById('btnPullGuidBoard').style.display = 'none';
    document.getElementById('btnResetGuidBoard').style.display = 'block';
}
btnResetGuidBoard.addEventListener('click', resetGuidBoard);
function resetGuidBoard() {
    ipcRenderer.send('resetGuidBoard');
    document.getElementById('btnPullGuidBoard').style.display = 'block';
    document.getElementById('btnResetGuidBoard').style.display = 'none';
}

// Cutter Fwd
btnCutterFwd.addEventListener('click', cutterFwd);
function cutterFwd() {
    ipcRenderer.send('cutterFwd');
    document.getElementById('btnCutterFwd').style.display = 'none';
    document.getElementById('btnStpCutter1').style.display = 'block';
}
btnStpCutter1.addEventListener('click', stpCutter1);
function stpCutter1() {
    ipcRenderer.send('stpCutter1');
    document.getElementById('btnCutterFwd').style.display = 'block';
    document.getElementById('btnStpCutter1').style.display = 'none';
}

// Cutter Rvs
btnCutterRvs.addEventListener('click', cutterRvs);
function cutterRvs() {
    ipcRenderer.send('cutterRvs');
    document.getElementById('btnCutterRvs').style.display = 'none';
    document.getElementById('btnStpCutter2').style.display = 'block';
}
btnStpCutter2.addEventListener('click', stpCutter2);
function stpCutter2() {
    ipcRenderer.send('stpCutter2');
    document.getElementById('btnCutterRvs').style.display = 'block';
    document.getElementById('btnStpCutter2').style.display = 'none';
}

// Preprint
btnBladeon.addEventListener('click', bladeon);
function bladeon() {
    ipcRenderer.send('bladeon');
    document.getElementById('btnBladeon').style.display = 'none';
    document.getElementById('btnBladeoff').style.display = 'block';
}
btnBladeoff.addEventListener('click', bladeoff);
function bladeoff() {
    ipcRenderer.send('bladeoff');
    document.getElementById('btnBladeon').style.display = 'block';
    document.getElementById('btnBladeoff').style.display = 'none';
}

// Preprint1
btnPreprint1.addEventListener('click', preprint1);
function preprint1() {
    ipcRenderer.send('preprint1');
    document.getElementById('btnPreprint1').style.display = 'none';
    document.getElementById('btnStpPreprint1').style.display = 'block';
}
btnStpPreprint1.addEventListener('click', stppreprint1);
function stppreprint1() {
    ipcRenderer.send('stppreprint1');
    document.getElementById('btnPreprint1').style.display = 'block';
    document.getElementById('btnStpPreprint1').style.display = 'none';
}

// Preprint2
btnPreprint2.addEventListener('click', preprint2);
function preprint2() {
    ipcRenderer.send('preprint2');
    document.getElementById('btnPreprint2').style.display = 'none';
    document.getElementById('btnStpPreprint2').style.display = 'block';
}
btnStpPreprint2.addEventListener('click', stppreprint2);
function stppreprint2() {
    ipcRenderer.send('stppreprint2');
    document.getElementById('btnPreprint2').style.display = 'block';
    document.getElementById('btnStpPreprint2').style.display = 'none';
}

// Preprint3
btnPreprint3.addEventListener('click', preprint3);
function preprint3() {
    ipcRenderer.send('preprint3');
    document.getElementById('btnPreprint3').style.display = 'none';
    document.getElementById('btnStpPreprint3').style.display = 'block';
}
btnStpPreprint3.addEventListener('click', stppreprint3);
function stppreprint3() {
    ipcRenderer.send('stppreprint3');
    document.getElementById('btnPreprint3').style.display = 'block';
    document.getElementById('btnStpPreprint3').style.display = 'none';
}

// // Run-stop
// btnRun.addEventListener('click', run);
// function run() {
//     ipcRenderer.send('run');
//     document.getElementById('btnStop').style.display = 'block';
//     document.getElementById('btnRun').style.display = 'none';
// }
// btnStop.addEventListener('click', stop);
// function stop() {
//     ipcRenderer.send('stop');
//     document.getElementById('btnStop').style.display = 'none';
//     document.getElementById('btnRun').style.display = 'block';
// }

// Braid In-Out
btnGetBaridOut.addEventListener('click', getBaridOut);
function getBaridOut() {
    ipcRenderer.send('getBaridOut');
    document.getElementById('btnGetBaridOut').style.display = 'none';
    document.getElementById('btnresetGetBaridOut').style.display = 'block';
}
btnresetGetBaridOut.addEventListener('click', resetgetBaridOut);
function resetgetBaridOut() {
    ipcRenderer.send('resetgetBaridOut');
    document.getElementById('btnGetBaridOut').style.display = 'block';
    document.getElementById('btnresetGetBaridOut').style.display = 'none';
}



btnDragBaraidIn.addEventListener('click', dragBaraidIn);
function dragBaraidIn() {
    ipcRenderer.send('dragBaraidIn');
    document.getElementById('btnDragBaraidIn').style.display = 'none';
    document.getElementById('btnresetDragBaraidIn').style.display = 'block';
}
btnresetDragBaraidIn.addEventListener('click', resetdragBaraidIn);
function resetdragBaraidIn() {
    ipcRenderer.send('resetdragBaraidIn');
    document.getElementById('btnDragBaraidIn').style.display = 'block';
    document.getElementById('btnresetDragBaraidIn').style.display = 'none';
}

// Dragging Roll
btnReleaseDraggingRoll.addEventListener('click', releaseDraggingRoll);
function releaseDraggingRoll() {
    ipcRenderer.send('releaseDraggingRoll');
    document.getElementById('btnReleaseDraggingRoll').style.display = 'none';
    document.getElementById('btnSetDraggingRoll').style.display = 'block';
}
btnSetDraggingRoll.addEventListener('click', setDraggingRoll);
function setDraggingRoll() {
    ipcRenderer.send('setDraggingRoll');
    document.getElementById('btnReleaseDraggingRoll').style.display = 'block';
    document.getElementById('btnSetDraggingRoll').style.display = 'none';
}

// Ink Roll
btnRunInkRoll.addEventListener('click', runInkRoll);
function runInkRoll() {
    ipcRenderer.send('runInkRoll');
    document.getElementById('btnRunInkRoll').style.display = 'none';
    document.getElementById('btnStopInkRoll').style.display = 'block';
}
btnStopInkRoll.addEventListener('click', stopInkRoll);
function stopInkRoll() {
    ipcRenderer.send('stopInkRoll');
    document.getElementById('btnRunInkRoll').style.display = 'block';
    document.getElementById('btnStopInkRoll').style.display = 'none';
}

// Set Heat Seal
btnSetHeat.addEventListener('click', setHeat);
function setHeat() {
    ipcRenderer.send('setHeat');
    document.getElementById('btnSetHeat').style.display = 'none';
    document.getElementById('btnresetSetHeat').style.display = 'block';
}
btnresetSetHeat.addEventListener('click', resetsetHeat);
function resetsetHeat() {
    ipcRenderer.send('resetsetHeat');
    document.getElementById('btnSetHeat').style.display = 'block';
    document.getElementById('btnresetSetHeat').style.display = 'none';
}

// Close Button
// btnClose.addEventListener('click', close);
// function close() {
//     hideAll();
//     document.getElementById('file-container').style.display = 'block';
// }

updatecnfbtn.addEventListener('click', updatecnf);
function updatecnf() {
    console.log("cnf");
    var rpm1 = document.getElementById('rpm1').value;
    var rpm2 = document.getElementById('rpm2').value;
    var rpm3 = document.getElementById('rpm3').value;
    var ltresh = document.getElementById('ltresh').value;

    var data = fs.readFileSync('c:\\config\\config.txt','utf8');
    var curData = fs.readFileSync('c:\\config\\config.txt','utf8').split(",");
    const res = data.replace([curData[5], curData[6], curData[7], curData[8]], [rpm1, rpm2, rpm3, ltresh])
    fs.writeFileSync('c:\\config\\config.txt', res, 'utf8');
}