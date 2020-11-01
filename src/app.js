/*Authors
 Christopher Lee:  christopher.lee03@student.csulb.edu
 Christopher De Jong: christopher.dejong@student.csulb.edu,
 Helen To: helen.to@student.csulb.edu

 Description: This file serves as the backend for our version control software and currently
                only allows the creation of a repo.
 */

const express = require('express'); // Load the Express builder fcn.
//var bodyParser = require('body-parser')
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const date = new Date();
const readline = require('readline');
const ejs = require('ejs');



//var $ = require('jquery');
var app = express();  // Init an Express object.

app.set('views', './views');
app.set('view engine', 'ejs');
app.get('/', function (req, res) { // Set page-gen fcn for URL root request.
    res.render('index', { root : __dirname});
    //res.sendFile('javascript.js', { root : __dirname});
});
//app.use('/js', express.static(__dirname + './javascript.js'));
//var fs = require("fs-extra")
app.listen(3000, function () { // Set callback action fcn on network port.
    console.log('app.js listening on port 3000!');
});

let artIds = [];
let relativePaths = [];
let userCommands = [];
let month = 0;
let day = 0;
let year = 0;
let hour = 0;
let minute = 0;
let second = 0;
let manifestCount = 1;



app.get('/userCmd', (req, res) => {
    // Data used for manifest file
    month = date.getMonth();
    day = date.getDate();
    year = date.getFullYear();
    hour = date.getHours();
    minute = date.getMinutes();
    second = date.getSeconds();

    // getting input from html div-form
    let userInput = req.query.input_text;

    // Adds command to array used later for manifest file
    userCommands.push(userInput);

    // Seperates the command, starting directory, ending directory
    let splitInput = userInput.split(" ");
    let command = splitInput[0];


    // To keep track of the relative paths from the project source tree
    let directories = [];

    if (command == "crRepo") {

        console.log(userInput);
        let startDirectory = splitInput[1];
        let endDirectory = splitInput[2];
        createRepo(startDirectory, endDirectory, directories);
        res.render('index');
    }
    else if (command == "label") {
        let label = splitInput[1];
        let repoLocation = splitInput[2];
        let manNameLabel = splitInput[3];
        Label(label, repoLocation, manNameLabel);
        res.render('index');
        // getLabels("C:\\Users\\Christopher\\Desktop\\test\\labels.txt")
    }
    else if (command == "list") {
        let repoLocation = splitInput[1]
        var labels = List(repoLocation)

        res.render('index', {manifestLabels: ['test1', 'test2', 'test3']});
        //res.render('index', {manifestLabels:  labels});
        //res.render("index", {"variable": labels})
    }
    res.render('index', {hello: "hello"});

});

// Adds a label file for manifest files
function Label(label, repoLocation, manifestName) {
    console.log("Inside Label method")
    let fileNames = fs.readdirSync(repoLocation);
    let labelAbsolutePath = repoLocation.concat("\\", "label.txt");
    if (!fs.existsSync(labelAbsolutePath)) {
        console.log("It does not exist")
        // Creates new label file  with the first line containing the manifestFile's name
        fs.writeFileSync(labelAbsolutePath, manifestName.concat("\n"));
    }
    // Adds the new label for the manifest file to the label file
    fs.appendFileSync(labelAbsolutePath, label.concat("\n"));

    fileNames.forEach(function (file) {

    });
}

function List(repoLocation, response) {
    let absolutePath = repoLocation.concat("\\", "label.txt")
    let labels = getLabels(absolutePath)
    for (let i = 0; i < labels.length; i++) {

    }
    return labels;
}

// returns manifest file name as well as labels for the manifest file
function getLabels(fileAbsolutePath) {
    let labels = [] // Can i use 'let' in this case cause its getting returned
    let readInterface = readline.createInterface({
        input: fs.createReadStream(fileAbsolutePath),
        output: process.stdout,
        console: false
    });

    // adds all labels to array, including the manifest file name on the first line
    readInterface.on('line', function(line) {
        labels.push(line)
    });
    return labels
}


function createRepo(startDir, endDir, dir) {
    // filewalker is getting called before the directory has time to be made
    setTimeout(function () {
        copyWithArtID(startDir, endDir, dir)
    }, 1000);

    setTimeout(function () {
        createManifest(endDir)
    }, 2000);

}


function copyWithArtID(startFolder, endFolder, directories) { //startFolder the location of the file we want to walk through
    const fileNames = fs.readdirSync(startFolder); // C//User//Desktop//CopyThis
    let relativePath = "";

    // Iterates through each item in the startFolder
    fileNames.forEach(function (file) {

        //the path or directory that led to the original project tree file
        let oldAbsolutePath = startFolder.concat("\\", file);
        console.log("file is: ", file);
        let stats = fs.statSync(oldAbsolutePath); //stats is the stats of the oldAbsolutePath

        // Check if it is a file and it is not a dot file (manifest file)
        if (stats.isFile() == true && file.substring(0,1).localeCompare(".") != 0) {

            // Gets the extension name of the file at oldAbsolutePath
            let extension = path.extname(oldAbsolutePath);

            //contents of the file
            const content = fs.readFileSync(oldAbsolutePath, 'utf8');

            // Creates the artifact id for the file
            let artId = getArtifactID(content, oldAbsolutePath, startFolder);

            // adds artIds to list used for createManifest
            artIds.push(artId);

            relativePath = relativePath + "\\" + file;
            relativePaths.push(relativePath); // adds relative path names to list used for createManifest

            // The path or directory leading directly to the new file
            let newAbsolutePath = endFolder.concat("\\", artId, extension);
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
    let manifestDirectory = directory.concat("\\", ".man-", manifestCount, ".rc");
    manifestCount++;

    // Creating the data that will preside inside the manifest file
    let manifestData = "1) User Input: ".concat(userCommands[0], "\n", "2) Date: ",month.toString(), "-", day.toString(), "-", year.toString()," ", "Time: ",
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
    let a = getCheckSum(String);
    let b = getFileSize(file);
    let c = getCheckSum(relativePath);
    return "P".concat(a, "-L", b, "-C", c)

}

function getFileSize(fileDirectory) {
    let stats = fs.statSync(fileDirectory)
    let bytes = stats.size
    return bytes
}

function getCheckSum(String) {
    let weights = [1, 3, 7, 11];
    let checkSum = 0;
    let int = 0;
    for (i = 0; i < String.length; i++) {
        checkSum += String.charCodeAt(i) * weights[int];

        int++;
        int %= weights.length;
    }

    return (checkSum % 10000)
}



