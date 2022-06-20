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

