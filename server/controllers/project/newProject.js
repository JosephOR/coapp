var Project = require('./../../models/project');
var User = require('./../../models/user');
var _ = require('underscore');
var Validator = require('./../../helpers/validator.js');

'use strict';

/**
 * @api {post} /api/projects Add a new project resource
 *
 * @apiName Add new project
 * @apiGroup Projects
 *
 * @apiParam {String} name Project name
 * @apiParam {String} desc Project description
 * @apiParam {String} collaborators ID's of project collaborators
 *                    (seperated by a comma)
 *
 * @apiPermission User
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 201 Created
 *
 * @apiError Conflict You can only have one project with the same name
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 409 Conflict
 *     {
 *       "error": "'You can only have one project with the same name'"
 *     }
 *
 * @apiUse InvalidData
 *
 * @apiUse NotAuthorized
 *
 */
module.exports =  function newProject (req, res, next) {

    var validator = new Validator();

    validator.addRule({
        field: 'name',
        value: req.body.name,
        rules: ['required']
    });

    validator.addRule({
        field: 'desc',
        value: req.body.desc,
        rules: ['required']
    });

    // validate data
    if (!validator.validate()) {
        return res.status(422).send(validator.getErrors());
    }

    // start prooject query
    var query = Project.findOne();

    // ensure a user can only have one project
    // with the same name
    query.where({
        $and: [
            {name: req.body.name},
            {owner: req.user._id}
        ]
    });

    // ensure a user can only have one project with the same name
    query.exec(function (err, project) {

        if (project) {
            // project already exists so return conflict error
            res.status(403).send(req.body.name + ' is already used');
        } else{

            var project = new Project();
            var collaborators = [];

            project.name = req.body.name;
            project.desc = req.body.desc;

            // set the owner to the user logged in
            project.owner = req.user._id;

            console.log('logged in as', req.user._id);

            /**
             * check if collaborators is defined
             */
            if (req.body.collaborators) {

                // if collaborators is sepearted by a comma
                // create an array with them and the owner
                if (req.body.collaborators.indexOf(',') > -1) {
                    collaborators = req.body.collaborators.split(',');
                } else { // only one collaborator add them and the owner
                    collaborators.push(req.body.collaborators);
                }
                collaborators.push(project.owner);
            } else { // else add the owner to the collaborators list
                collaborators = [project.owner];
            }

            // set project collaborator list
            _.each(collaborators, function (user) {
                project.collaborators.push(user);
            });

            // save project
            project.save(function (err) {
                if(err) {
                    res.send(500, err);
                } else {
                    // update every user who is listed as a collaborator
                    // and add the project to their project list
                     User
                    .update({ _id: {$in: project.collaborators}},
                            // add project to user
                            {$addToSet : { projects : project._id} },
                            {multi:true},
                            function(err, numEffected) {
                                if (err) {
                                    res.send(500);
                                } else{
                                    res.send(201);
                                }
                            }
                        );
                }
            });
        }
    });

};