/*Authors
 Christopher Lee:  christopher.lee03@student.csulb.edu
 Christopher De Jong: christopher.dejong@student.csulb.edu,
 Helen To: helen.to@student.csulb.edu

 Description: This file serves as the backend for our version control software and currently
                only allows the creation of a repo.
 */

var express = require('express'); // Load the Express builder fcn.
//var bodyParser = require('body-parser')
var fs = require('fs')
const fse = require('fs-extra');
var path = require('path');
var date = new Date()


//var $ = require('jquery');
var app = express();  // Init an Express object.
app.get('/', function (req, res) { // Set page-gen fcn for URL root request.
    res.sendFile('index.html', { root : __dirname});
    //res.sendFile('javascript.js', { root : __dirname});
});
//app.use('/js', express.static(__dirname + './javascript.js'));
//var fs = require("fs-extra")
app.listen(3000, function () { // Set callback action fcn on network port.
    console.log('app.js listening on port 3000!');
});

var artIds = [];
var relativePaths = [];
var userCommands = [];
var month = 0;
var day = 0;
var year = 0;
var hour = 0;
var minute = 0;
var second = 0;
var manifestCount = 1;



app.get('/userCmd', (req, resp) => {
    // Data used for manifest file
    month = date.getMonth();
    day = date.getDate();
    year = date.getFullYear();
    hour = date.getHours();
    minute = date.getMinutes();
    second = date.getSeconds();

    // getting input from html div-form
    var userInput = req.query.input_text;

    // Adds command to array used later for manifest file
    userCommands.push(userInput);

    // Seperates the command, starting directory, ending directory
    var splitInput = userInput.split(" ");
    var command = splitInput[0];


    // To keep track of the relative paths from the project source tree
    var directories = [];

    if (command == "crRepo") {

        console.log(userInput);
        var startDirectory = splitInput[1];
        var endDirectory = splitInput[2];

        createRepo(startDirectory, endDirectory, directories);

        // Sends back to html page
        resp.sendFile('index.html', { root : __dirname});

    }
    else if (command == "label ") {
        var label = splitInput[1];
        var repoLocation = splitInput[2];
        var fileNameLabel = splitInput[3];
    }
})

// Goes through a directory and copies all the files into a new directory

function createRepo(startDir, endDir, dir) {
    // filewalker is getting called before the directory has time to be made
    setTimeout(function () {
        copyWithArtID(startDir, endDir, dir)
        console.log("Done file walking")
    }, 1000);

    setTimeout(function () {
        createManifest(endDir)
    }, 2000);

}


function copyWithArtID(startFolder, endFolder, directories) { //startFolder the location of the file we want to walk through
    const fileNames = fs.readdirSync(startFolder); // C//User//Desktop//CopyThis
    var relativePath = "";

    // Iterates through each item in the startFolder
    fileNames.forEach(function (file) {
        
        //the path or directory that led to the original project tree file
        var oldAbsolutePath = startFolder.concat("\\", file);
        console.log("file is: ", file);
        var stats = fs.statSync(oldAbsolutePath); //stats is the stats of the oldAbsolutePath

        // Check if it is a file and it is not a dot file (manifest file)
        if (stats.isFile() == true && file.substring(0,1).localeCompare(".") != 0) {

            // Gets the extension name of the file at oldAbsolutePath
            var extension = path.extname(oldAbsolutePath);

            //contents of the file
            const content = fs.readFileSync(oldAbsolutePath, 'utf8');

            // Creates the artifact id for the file
            var artId = getArtifactID(content, oldAbsolutePath, startFolder);

            // adds artIds to list used for createManifest
            artIds.push(artId);

            relativePath = relativePath + "\\" + file;
            relativePaths.push(relativePath); // adds relative path names to list used for createManifest

            // The path or directory leading directly to the new file
            var newAbsolutePath = endFolder.concat("\\", artId, extension);
            fse.copySync(oldAbsolutePath, newAbsolutePath);
        }

        // Recursive call if there is another folder in the current directory
        //Recursive call may make directories not work for certain files
        if (stats.isDirectory() == true) {
            directories.push(file);
            console.log("directories: ", directories);

            if (directories.length > 0) {
                console.log("Directories is greater than 0")
                for ( i = 0; i < directories.length; i++) {
                    relativePath = relativePath + "\\" + directories[i];
                    console.log("Relative Path is now: ", relativePath);
                }
            }
            copyWithArtID(oldAbsolutePath, endFolder, directories);
        }

    });
}

function createManifest(directory) {
    //var manifestDirectory = fs.appendFile(directory.concat("\\", ".manifest.txt"), "")
    console.log("Started creating manifest method");
    var manifestDirectory = directory.concat("\\", ".man- ", manifestCount, ".rc");
    manifestCount++;

    // Creating the data that will preside inside the manifest file
    var manifestData = "1) User Input: ".concat(userCommands[0], "\n", "2) Date: ",month.toString(), "-", day.toString(), "-", year.toString()," ", "Time: ",
        hour.toString(), ":", minute.toString(), ":", second.toString(), "\n","3) ");
    console.log(artIds);

    // Adding each Artifact Id and its relative path in the project source tree
    for (i = 0; i < artIds.length; i++) {
        manifestData = manifestData.concat("Artifact Id: ", artIds[i], " ", "Relative Path: ", relativePaths[i], "\n");
    }

    // Wrties the data into the manifest file
    fs.writeFile(manifestDirectory, manifestData, 'utf-8', function(err, data) {
        if (err) throw err;
        console.log('Done with the manifest writing!');
    })
}

function getArtifactID(String, file, relativePath) {
    var a = getCheckSum(String);
    var b = getFileSize(file);
    var c = getCheckSum(relativePath);
    return "P".concat(a, "-L", b, "-C", c)

}

function getFileSize(fileDirectory) {
    var stats = fs.statSync(fileDirectory)
    var bytes = stats.size
    return bytes
}

function getCheckSum(String) {
    var weights = [1, 3, 7, 11];
    var checkSum = 0;
    var int = 0;
    for (i = 0; i < String.length; i++) {
        checkSum += String.charCodeAt(i) * weights[int];

        int++;
        int %= weights.length;
    }

    return (checkSum % 10000)
}



