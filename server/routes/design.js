var designCtrl = require('./../controllers/design/index.js');
var annotationCtrl = require('./../controllers/annotation/index.js');


module.exports =  function(app, router) {

    // get design attributes
    router
    .route('/designs/:designid')
    .get(designCtrl.getDesign);

    // design specific annotations
    router
    .route('/designs/:designid/annotations')
    .post(annotationCtrl.newAnnotation);

    router
    .route('/designs/:designid/annotations/:annotationid/messages')
    .post(annotationCtrl.newMessage);

};