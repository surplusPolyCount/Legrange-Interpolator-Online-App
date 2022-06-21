/* code to initialize graphing interface in browser */

function Start(){
    //add points
    var firstPt  = new point(-1.212, 0);
    var secondPt = new point( 2, 5); 
    var thirdPt  = new point( 8, 5);
    var fourthPt = new point( 9, -6);

    cgraph.addPoint(firstPt);
    cgraph.addPoint(secondPt);
    cgraph.addPoint(thirdPt);
    cgraph.addPoint(fourthPt);
    
    //render graph
    cgraph.graphInterp(legrangeInterp, "#FF0000");

    //build side form
    mFormParent = document.getElementById("m_form");

    
    buildForm(mFormParent);
}

//this function is here for version 2.0 of the software 
//hopefully instead of handling input in a wide array of different locations
//the entire graph generation pipeline could be a bit more organized into an update loop
//see the link below for details 
//https://www.sitepoint.com/quick-tip-game-loop-in-javascript/

function Update(){
    //manage input 

    //update graph thingy 

    //
}

Start(); 
//https://developer.mozilla.org/en-US/docs/Web/API/Element/wheel_event
canvas.addEventListener('wheel', zoomGraph); 
//https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent
canvas.addEventListener('mousedown',  function(evt){
    m.CapturePoint();
    /*m.UpdateLoc(canvas, evt);
    cgraph.graphInterp(legrangeInterp, "#FF0000");
    m.UpdateText();
    */
}, false);

canvas.addEventListener('mouseup',  function(evt){
    m.ReleasePoint();
}, false);

canvas.addEventListener('mousemove', function(evt) {
    m.UpdateLoc(canvas, evt);
    m.UpdatePoints();
    cgraph.graphInterp(legrangeInterp, "#FF0000");
    m.UpdateText();
    buildForm(mFormParent);
}, false);
//https://stackoverflow.com/questions/9643311/pass-a-string-parameter-in-an-onclick-function
document.getElementById("updatePts").onclick = addPointToGraph;

