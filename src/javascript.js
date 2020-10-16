
function allCode() {
	alert("Hello World")
	document.getElementById("submit").addEventListener("click", saveFunction);
}


function saveFunction() {
	alert("Save Function")
	//import fs from 'fs';
	document.getElementById("save").addEventListener("click", submitFunction);
}


function submitFunction() {
	const text = document.getElementById("textbox");
	const conf = confirm("Are you sure you want to submit?");
	//window.directory = prompt("Please enter the project directory!");
	//document.getElementById("save").value = "Confimred";
	//makeFolder(window.directory, "CWQ1")

	/*
    var path = require('path');
    alert("Path done")
    var obj = { dir: 'C:\\Users\\Christopher Lee\\WebstormProjects\\CECS_343_Lab1\\myapp\\all_directories', base: 'demo_path.js'}
    var p = path.format(obj)
    */
	let textContent = text.value;
	let commandLine = 1;
	if (conf == true) {
		alert("inside conf == true");
		if (textContent == "createRepo") {
			alert("text was creatRepo");
		}
		/*
        fs.mkdir(p , function(err) {
            alert("starts fs")
            if (err) {
                console.log(err)
            }
            else {
                console.log("Created")
            }
        })*/



		alert("finished fs")
	}
	else {

	}
}

