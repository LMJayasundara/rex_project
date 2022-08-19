const { ipcRenderer, remote } = require("electron");

function hideAll() {
    document.getElementById('file-container').style.display = 'none';
    document.getElementById('login-container').style.display = 'none';
    // document.getElementById('jigs-container').style.display = 'none';
    // document.getElementById('report-container').style.display = 'none';
    // document.getElementById('about-container').style.display = 'none';
    // document.getElementById('change-pswd-container').style.display = 'none';
    // document.getElementById('operate-container').style.display = 'none';
    // document.getElementById('list-container').style.display = 'none';
    // document.getElementById('execute-container').style.display = 'none';

    // document.getElementById('other-container').style.display = 'none';
    // document.getElementById('qa-report-container').style.display = 'none';
    // document.getElementById('generate-container').style.display = 'none';
}

ipcRenderer.on("reply", (event, data)=>{
    console.log(data);
    if(data == 'sub11'){
        hideAll();
        document.getElementById('file-container').style.display = 'block';
    }
    if(data == 'sub12'){
        hideAll();
        document.getElementById('login-container').style.display = 'block';     
    }
    // if(data == 'sub13'){
    //     hideAll();
    //     document.getElementById('report-container').style.display = 'block';
    // }

    // if(data == 'sub21'){
    //     hideAll();
    //     document.getElementById('list-container').style.display = 'block';
    // }
    // if(data == 'sub22'){
    //     hideAll();
    //     document.getElementById('execute-container').style.display = 'block';
    // }

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

    // if(data == 'sub41'){
    //     hideAll();
    //     document.getElementById('operate-container').style.display = 'block';
    // }
    // if(data == 'sub42'){
    //     hideAll();
    //     document.getElementById('change-pswd-container').style.display = 'block';
    // }
    // if(data == 'sub43'){
    //     hideAll();
    //     document.getElementById('about-container').style.display = 'block';
    // }
});