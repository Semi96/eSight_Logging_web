angular.module('todoController', [])

	// inject the Todo service factory into our controller
	.controller('mainController', ['$scope','$http','Todos', function($scope, $http, Todos) {
		$scope.formData = {};
		$scope.loading = true;
		$scope.inProg = false;

		// GET =====================================================================
		// when landing on the page, get all todos and show them
		// use the service to get all the todos
		Todos.get()
			.success(function(data) {
				$scope.todos = data;
				$scope.loading = false;
			});

// EXECUTE app/logging/LogParser.jar
			$scope.executeLogScript = function() {

				// make sure script is not already in progress
				if ($scope.inProg != true) {
					$scope.inProg = true;

					// simply for visual indication through the base app's framework, add a todo to show the process has started
					Todos.create($scope.formData = {text : 'logging initiated'})

						// if successful creation, call our get function to get all the new todos
						.success(function(data) {
							$scope.inProg = false;
							$scope.formData = {}; // clear the form so our user is ready to enter another
							$scope.todos = data; // assign our new list of todos
						});
				}
			};

		// CREATE ==================================================================
		// when submitting the add form, send the text to the node API
		$scope.createTodo = function() {
			console.log("		what was written in form " + $scope.formData.text);

			// validate the formData to make sure that something is there
			// if form is empty, nothing will happen
			if ($scope.formData.text != undefined) {
				$scope.loading = true;

				// call the create function from our service (returns a promise object)
				// console.log("form data: " + JSON.stringify($scope.formData);
				Todos.create($scope.formData)

					// if successful creation, call our get function to get all the new todos
					.success(function(data) {
						$scope.loading = false;
						$scope.formData = {}; // clear the form so our user is ready to enter another
						$scope.todos = data; // assign our new list of todos
					});
			}
		};

		// DELETE ==================================================================
		// delete a todo after checking it
		$scope.deleteTodo = function(id) {
			$scope.loading = true;

			Todos.delete(id)
				// if successful creation, call our get function to get all the new todos
				.success(function(data) {
					$scope.loading = false;
					$scope.todos = data; // assign our new list of todos
				});
		};
	}]);
