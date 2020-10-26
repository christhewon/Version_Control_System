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

var artIds = []
var relativePaths =[]

app.get('/userCmd', (req, resp) => {
    var month = date.getMonth()
    var day = date.getDate()
    var year = date.getFullYear()
    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()



    // save into a file with date and time for manifest file
    var userInput = req.query.input_text
    var splitInput = userInput.split(" ")

    //maybe not here, creat once know crRepo?
    var command = splitInput[0]
    var startDirectory = ""
    var endDirectory = ""

    if (command == "crRepo") {

        console.log(userInput)
        startDirectory = splitInput[1]
        endDirectory = splitInput[2]
        if (!(fs.existsSync(endDirectory))) {
            //fse.copy(startDirectory, endDirectory)
            fs.mkdirSync(endDirectory)
        }

        // filewalker is getting called before the directory has time to be made
        setTimeout(function () {
            fileWalker(startDirectory, endDirectory)
        }, 1000);

        resp.sendFile('index.html', { root : __dirname});
    }
})

// Goes through a directory and copies all the files into a new directory
function fileWalker(startDirectory, endDirectory, direct) { //startDirectory the location of the file we want to walk through
    const fileNames = fs.readdirSync(startDirectory) // C//User//Desktop//CopyThis
    var directories = []
    fileNames.forEach(function (file) {
        var dotArray = file.split("") //used later to check the dot files
        var oldDirectory = startDirectory.concat("\\", file)
        console.log(file)
        var stats = fs.statSync(oldDirectory) //stats is the stats of the oldDirectory

        // Check if it is a file and it is not a dot file
        if (stats.isFile() == true && !(dotArray[0].trim() == ".")) {

            var extension = path.extname(oldDirectory) // Gets the extension name of the file at oldDirectory
            const info = fs.readFileSync(oldDirectory, 'utf8') //contents of the file
            var artId = getArtifactID(info, oldDirectory, startDirectory); //gets the art ID

            artIds.push(artId) // adds artIds to list used for createManifest
            relativePaths.push(file) // adds relative path names to list used for createManifest


            var endingDirectory = endDirectory.concat("\\", artId, extension) // this is the name of ending directory with the artifact id
            fse.copySync(oldDirectory, endingDirectory)
            console.log("Goodbye")
        }

        // Recursive call if there is another folder in the current directory
        if (stats.isDirectory() == true) {
            fileWalker(oldDirectory, endDirectory)
        }

    });
}

function createManifest(directory) {
    //var manifestDirectory = fs.appendFile(directory.concat("\\", ".manifest.txt"), "")
    var manifestDirectory = directory.concat("\\", ".man<1>.rc")

    var manifestData = "1) User Input: ".concat(userInput,"\n", "2) Date: ",month.toString(), "-", day.toString(), "-", year.toString()," ", "Time: ",
        hour.toString(), ":", minute.toString(), ":", second.toString(), "3) ")

    for (i = 0; i < artIds.length; i++) {
        manifestData.concat("Artifact Id: ", artIds[i], "Relative Path: ", relativePaths[i])
    }

    fs.writeFile(manifestDirectory, manifestData, 'utf-8', function(err, data) {
        if (err) throw err;
        console.log('Done!');
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



