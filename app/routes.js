var Todo = require('./models/todo');
var spawn = require('child_process').spawn;

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
  console.log("routes.js recognized that start was written, trying to run the jar file now...");

  var child = spawn('java', ['-jar', __dirname + '/logging/LogParser_withAutoDownload.jar']);
  // child.spawn('java', ['-jar', 'C:/Users/Semi/eSight_Logging_web/logging/LogParser_withAutoDownload.jar']);
  child.stdout.on('data', function(data) {
    console.log('' + data);
  });

  child.stderr.on('data', function (data) {
    console.log('error: ' + data);
    getTodos(res);
  });

  child.on('close', function (code) {
    console.log("Finished with exit code " + code);
    getTodos(res);
  });
};

module.exports = function (app) {

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
            done: false
        }, function (err, todo) {
            if (err)
                res.send(err);

            // get and return all the todos after you create another
            if (req.body.text == 'logging initiated') {
              runLogScript(res);
            }
            else {
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
        res.sendFile(__dirname + '/public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });
};
