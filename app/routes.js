var Todo = require('./models/todo');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;

function getTodos(res) {
  console.log("getting todos...");
    Todo.find(function (err, todos) {

        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err) {
            res.send(err);
        }

        res.json(todos); // return all todos in JSON format
    });
};

function runLogScript(res) {
  console.log("trying to run the jar file now...");

  var child = spawn('java', ['-jar', __dirname + '/logging/LogParser_withAutoDownload.jar']);
  // child.spawn('java', ['-jar', 'C:/Users/Semi/eSight_Logging_web/logging/LogParser_withAutoDownload.jar']);
  child.stdout.on('data', function(data) {
    console.log('' + data);
  });

  child.stderr.on('data', function (data) { //// error instead of data
    console.log('error: ' + data);
    getTodos(res);
  });

  child.on('close', function (code) {
    console.log("Finished with exit code " + code);
    getTodos(res);
  });
};


// Note: command only works on Linux systems; will only delete server-side files if server OS is Linux
function deleteServerLogs(res, projectDir) {
  console.log("trying to delete server logs now...");
  var commandSyntax = 'rm -rf ' + projectDir + '/Log_Files'; // __dirname will not work, need home directory of eSight_Logging_web project

  // var child = spawn('sh', ['-c', commandSyntax]);
  var child = exec(commandSyntax, function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
    else {
      console.log("Finished with exit code " + error);
    }
    getTodos(res);
  });
};


module.exports = function (app, projectDir) {

    // api ---------------------------------------------------------------------
    // get all todos
    app.get('/api/todos', function (req, res) {
        // use mongoose to get all todos in the database
        getTodos(res);
    });

    // create todo and send back all todos after creation
    app.post('/api/todos', function (req, res) {

        // create a todo, information comes from AJAX request from Angular
        Todo.create({
            text: req.body.text,
            reqType: req.body.reqType,
            done: false
        }, function (err, todo) {
            if (err)
                res.send(err);

            console.log('should we run script: ' + req.body.reqType);
            // get and return all the todos after you create another
            if (req.body.reqType == 'execute') {
              console.log('Running Script now!!');
              runLogScript(res);
            }
            else if (req.body.reqType == 'delete') {
              console.log('Deleting logs on server...');
              deleteServerLogs(res, projectDir);
            }
            else {
              console.log('Didnt run script...');

            getTodos(res);
          }
        });

    });

    // delete a todo
    app.delete('/api/todos/:todo_id', function (req, res) {
        Todo.remove({
            _id: req.params.todo_id
        }, function (err, todo) {
            if (err)
                res.send(err);

            getTodos(res);
        });
    });

    // application -------------------------------------------------------------
    app.get('*', function (req, res) {
        res.sendFile(projectDir + '/public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });
};
