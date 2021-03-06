(function () {
    'use strict';

    angular.module('coapp')
    .factory('ProjFactory', ProjFactory);

    // @ngInject
    //pass $http and $q as dependencies, $q is for asyncronous tasks
    function ProjFactory ($http, $q) {
        //epmty object to be returned when methods are added
        var proj = {};

        //object containing http paths for methods
        var paths = {
            api: '/api/projects',
            fields: '?fields=name,desc,thumbnail,designCount,created,owner',
        }
        var getProjectsPath = paths.api+paths.fields;


        //get projects from server
        proj.getProjects = function() {
            //set up the promise object instance
            var defer = $q.defer();
            //get request to server for projects
            $http.get(getProjectsPath)
                //calback if succesfull or an error
                .success(function(data){
                        defer.resolve(data);
                })
                .error(function(err, status){
                    defer.reject(err);
                })
                //return the promise object
            return defer.promise;
        };

        //get a single project from the server using a given id
        proj.getProject = function (projectid) {
            //set up promise object instance
            var defer = $q.defer();
            //get request for project given a specific id
            $http.get(paths.api + '/' + projectid, {
                params: {
                    fields: 'name,desc,collaborators'
                }
            })
                //calback if succesfull or an error
                .success(function(data){
                        defer.resolve(data);
                })
                .error(function(err, status){
                    defer.reject(err);
                })
                //return the promise object
            return defer.promise;
        };

        //add a project to server with path and new project from controller
        proj.addProject = function(project){
            //set up promise object instance
            var defer = $q.defer();
            //post a project to server, with project created from form
            $http.post(paths.api, project)
                .success(function(data){
                    defer.resolve(data);
                })
                .error(function(err, status){
                   defer.reject(err);
                });

            return defer.promise;
        };

        //delete a project by the id passed from the controller
        proj.deleteProject = function(projectid){
           var defer = $q.defer();
           //delete a project using an id passed from the projectsController
            $http.delete(paths.api + '/' + projectid)
                .success(function(data){
                    defer.resolve(data);
                })
                .error(function(err, status){
                   defer.reject(err);
                })

            return defer.promise;
        };
        
        //update a projects details, project passed into the put method
        proj.updateProject = function (project) {
            var defer = $q.defer();
            //put method with path and project to update
            $http.put(paths.api + '/' + project._id, project)
                .success(function(data){
                    defer.resolve(data);
                })
                .error(function(err){
                    defer.reject(err);
                });

            return defer.promise;
        }

        /**
         * search system for users based on username
         * @param  {String} name :: name of user
         * @param  {Mongo ID's} ids  :: id's of existing collabarators
         * @return {Promise}  :: return a http promise
         */
        proj.searchUsers = function (name, ids) {
            var defer = $q.defer();

            $http.get('/api/users', {
                params: {
                        search: name,
                        ids: ids
                }
            })
                .success(function(data){
                    defer.resolve(data);
                })
                .error(function(err, status){
                    defer.reject(err);
                });

            return defer.promise;
        }

        //return the proj object with: deleteProject, addProject, getProjects, updateProject and searchUsers
        // methods available for the controller to use
        return proj;
    }
    ProjFactory.$inject = ["$http", "$q"];

})();