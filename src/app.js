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
let app = express();  // Init an Express object.

// app.set('views', './views');
app.set('view engine', 'ejs');
app.get('/', function (req, res) { // Set page-gen fcn for URL root request.
    res.render('index');
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
let labels = [];

global.manifestLabels = [];
global.testVar = "Test Variable";



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
        let manifestName = splitInput[2]
        labels = List(repoLocation, manifestName)


        console.log("Right before Render")
        //res.render('index', {manifestLabels: ['test1', 'test2', 'test3']});
        res.render('index', {manifestLabels:  labels});
        console.log("Render Complete")
        //res.render("index", {"variable": labels})
    }
    else if (command == "checkIn") {
        let startDirectory = splitInput[1];
        let endDirectory = splitInput[2];
        checkIn(startDirectory, endDirectory, directories);
        res.render('index');
    }
    else if (command == "checkOut") {
        let manifestDir = splitInput[1]
        let endDirectory = splitInput[2]
        checkOut(manifestDir, endDirectory);
    }


});

app.get("/", function(req, res){
    var hello = "Hello"
    res.render("index.ejs", {exampleVar: hello});
});

/*
app.get('/userQuery', (req, res) => {
    res.render('index', {data : {userQuery: req.params.userQuery}})
});

 */

// Adds a label file for manifest files
function Label(label, repoLocation, manifestName) {
    console.log("Inside Label method")
    let fileNames = fs.readdirSync(repoLocation);
    let labelAbsolutePath = repoLocation.concat("\\", "label", manifestName, ".txt");
    if (!fs.existsSync(labelAbsolutePath)) {
        console.log("It does not exist")
        // Creates new label file  with the first line containing the manifestFile's name
        fs.writeFileSync(labelAbsolutePath, manifestName.concat("\n"));
    }
    // Adds the new label for the manifest file to the label file
    fs.appendFileSync(labelAbsolutePath, label.concat("\n"));
}

function List(repoLocation, manifestName) {
    let absolutePath = repoLocation.concat("\\", "label.", manifestName)
    let arr = [];

    // Getting the contents of the text file
    let contents = fs.readFileSync(absolutePath, 'utf-8');

    // Splitting each line
    arr = contents.split("\n")

    // Getting rid of empty index
    arr.pop();
    return arr;
}

/*
// returns manifest file name as well as labels for the manifest file
function getLabels(fileAbsolutePath) {
    console.log("Inside getLabels")
    let labels = [] // Can i use 'let' in this case cause its getting returned
    let readInterface = readline.createInterface({
        input: fs.createReadStream(fileAbsolutePath),
        output: process.stdout,
        console: false
    });
    console.log("read interface create done")

    // adds all labels to array, including the manifest file name on the first line
    readInterface.on('line', function(line) {
        labels.push(line)
        console.log("Line pushed: ", line)
    });
    
    console.log("Right before Return")
    return labels
}
*/


function checkOut(manifestDir, endDir) {
    let lines = [];
    let files = [];
    let artId = [];
    let relPath = [];
    let readInterface = readline.createInterface({
        input: fs.createReadStream(manifestDir),
        output: process.stdout,
        console: false
    });

    // adds all labels to array, including the manifest file name on the first line
    readInterface.on('line', function(line) {
        lines.push(line);
    });

    setTimeout(function () {
        readInterface.close();
        readInterface.removeAllListeners();
    }, 4000);


    console.log("finished readInterface");

    for(let i = 0; i < lines.length; i++) {
        console.log("In first loop");
        if (lines[i].substring(0,1) == "P") {
            files.push(lines[i])
        }
    }

    for(let i = 0; i < files.length; i++) {
        let current = files[i].split(",")
        artId.push(current[0])
        relPath.push(current[1])
    }

    for(let i = 0; i < artId.length; i++) {
        let absoluteFilePath = endDir.concat(relPath[i])
        let e1 = manifestDir;
        let e2 = manifestDir.split("\\");
        console.log(e2);

        let oldAbsolutePath = ""
        for(let i = 0; i < e2.length - 1; i++) {
            oldAbsolutePath.concat(e2[i], "\\")
        }

        fse.copySync(oldAbsolutePath, absoluteFilePath);
    }
}

function checkIn(startDir, endDir, dir) {
    clearFiles(endDir)

    setTimeout(function () {
        copyWithArtID(startDir, endDir, dir)
    }, 1000);

    setTimeout(function () {
        createManifest(endDir)
    }, 2000);
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

function clearFiles(folder) {
    const fileNames = fs.readdirSync(folder); // C//User//Desktop//CopyThis
    let relativePath = "";

    // Iterates through each item in the startFolder
    fileNames.forEach(function (file) {
        let fileDirectory = folder.concat("\\", file);
        let stats = fs.statSync(fileDirectory); //stats is the stats of the oldAbsolutePath

        if (stats.isFile() == true && file.substring(0,1).localeCompare(".") != 0) {
            fs.unlinkSync(fileDirectory)
        }
    });

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

            relativePath = oldAbsolutePath;
            let r1 = relativePath.split('\\\\');
            let r2 = r1[r1.length - 1]
            let r3 = r2.split('\\');

            let r4 ="";
            for (let i = 1; i < r3.length; i++) {
                r4 = r4.concat(r3[i], "\\");
            }

            relativePaths.push(r4); // adds relative path names to list used for createManifest

            // The path or directory leading directly to the new file
            let newAbsolutePath = endFolder.concat("\\", artId, extension);
            fse.copySync(oldAbsolutePath, newAbsolutePath);
        }

        // Recursive call if there is another folder in the current directory
        //Recursive call may make directories not work for certain files
        if (stats.isDirectory() == true) {
            /*
            directories.push(file);
            console.log("directories: ", directories);

             */


            copyWithArtID(oldAbsolutePath, endFolder, directories);
            /*
            if (directories.length > 0) {
                console.log("Directories is greater than 0")
                for ( i = 0; i < directories.length; i++) {
                    relativePath = relativePath + "\\" + directories[i];
                    console.log("Relative Path is now: ", relativePath);
                }
            }

             */
        }

    });
}


/*
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


            copyWithArtID(oldAbsolutePath, endFolder, directories);

            if (directories.length > 0) {
                console.log("Directories is greater than 0")
                for ( i = 0; i < directories.length; i++) {
                    relativePath = relativePath + "\\" + directories[i];
                    console.log("Relative Path is now: ", relativePath);
                }
            }
        }

    });
}

 */

function createManifest(directory) {
    //var manifestDirectory = fs.appendFile(directory.concat("\\", ".manifest.txt"), "")
    console.log("Started creating manifest method");
    let manifestDirectory = directory.concat("\\", ".man-", manifestCount, ".rc");
    manifestCount++;

    // Creating the data that will preside inside the manifest file
    let manifestData = "1) User Input: ".concat(userCommands[0], "\n", "2) Date: ",month.toString(), "-", day.toString(), "-", year.toString()," ", "Time: ",
        hour.toString(), ":", minute.toString(), ":", second.toString(), "\n","3) Files", "\n");
    console.log(artIds);

    // Adding each Artifact Id and its relative path in the project source tree
    for (i = 0; i < artIds.length; i++) {
        manifestData = manifestData.concat(artIds[i], ",", relativePaths[i], "\n");
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

module.exports = { manifestLabels: labels }


// Ex commands
// crRepo C:\\Users\\Christopher\\Desktop\\CopyThis C:\\Users\\Christopher\\Desktop\\CopyMade
// list C:\Users\Christopher\Desktop\CopyMade man-1.txt
// label anotherTestLabel C:\Users\Christopher\Desktop\CopyMade .man-1


/*
createRepo copied all the files in your source folder to a destination (the repo), then it made a manifest file that
 lists all the files it copied over. Now all those files in the repo are copies of some source file,
 except they've been renamed with artifactIDs. This is all recorded in the manifest file.
check-out takes a manifest file that you specify (since you will have many) and parses through to find all the
artifactID files listed. Since the man file also specifies WHERE each of these files will go (the relative path),
check-out can then recreate a source folder based on the contents listed in the man file -- into another destination

so one is
source -> repo
 and the other is
repo -> different source
 */
