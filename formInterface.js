/*all functions that involves interfacing with html page*/

//code written mostly by Wren Miles

var canvas = document.getElementById("m-canvas"); 
var cgraph = new graph(canvas);

//function called from html clicking "addPoint" button
//adds point to interpolator and re-draws the graph  
function addPointToGraph(){
    //take input and convert into numbers
    let newx = parseFloat(document.getElementById("pointx").value, 10); 
    let newy = parseFloat(document.getElementById("pointy").value, 10);
    //if input is not numbers, return false 
    if(isNaN(newx) || isNaN(newy)){return false;}
    //create new point from numbers and add to graph 
    let newPt = new point(newx, newy); 
    cgraph.addPoint(newPt);
    //render the new form from the the updated point list
    let form = document.getElementById("pointForm"); 
    form.remove();
    buildForm(mFormParent); 
    //re-draw graph with updated points
    cgraph.graphInterp(legrangeInterp, "#FF0000");
}

//function called from html clicking "addPoint" button
//deletes point 
function deletePointFromGraph(pointId){
    //takes index of point, and uses it to delete the point
    cgraph.deletePoint(pointId);
    //re-create form
    let form = document.getElementById("pointForm"); 
    form.remove();
    buildForm(mFormParent); 
    //re-create graph
    cgraph.graphInterp(legrangeInterp, "#FF0000");
}

//https://www.geeksforgeeks.org/how-to-create-a-form-dynamically-with-the-javascript/
//create the form based of list of points 
//  formParent: the html element that the form should be inserted into 
function buildForm(formParent){
    let i = 0; 
    let form = document.createElement("form");
    form.setAttribute("id", "pointForm");
    cgraph.graphPoints.forEach(function(point){
        var xTxt = document.createTextNode("x:");
        var yTxt = document.createTextNode("y:");
        var buttonTxt = document.createTextNode("delete");

        var xLab = document.createElement("label");
        xLab.setAttribute("for", "x"); 
        xLab.appendChild(xTxt);
        var yLab = document.createElement("label");
        yLab.setAttribute("for", "y"); 
        yLab.appendChild(yTxt);

        var xIpt = document.createElement("input");
        xIpt.setAttribute("type", "text");
        xIpt.setAttribute("name", "x"+i);
        xIpt.setAttribute("id", "x"+i);
        xIpt.setAttribute("size", "8"); 
        xIpt.setAttribute("value", point.o.x);

        var yIpt = document.createElement("input");
        yIpt.setAttribute("type", "text");
        yIpt.setAttribute("name", "y"+i);
        yIpt.setAttribute("id", "y"+i);
        yIpt.setAttribute("size", "8"); 
        yIpt.setAttribute("value", point.o.y);

        var delButtn = document.createElement("button"); 
        delButtn.appendChild(buttonTxt);
        delButtn.setAttribute("type", "button");
        delButtn.setAttribute("id", i.toString()); 
        delButtn.addEventListener('click', function(){
            deletePointFromGraph(parseInt(delButtn.id));
        });

        form.appendChild(xLab);
        form.appendChild(xIpt);  
        form.appendChild(yLab);
        form.appendChild(yIpt);
        form.appendChild(delButtn);
        var br = document.createElement("br"); 
        form.appendChild(br.cloneNode());
        form.appendChild(br.cloneNode()); 
        i++; 
    });

    var upButtonTxt = document.createTextNode("update");
    var upButton = document.createElement("button"); 
    upButton.setAttribute("onclick", "updateGraph");
    upButton.setAttribute("type", "button");
    upButton.appendChild(upButtonTxt);
    form.appendChild(upButton);
    upButton.onclick = updateGraph;
    formParent.appendChild(form);
}

//called on clicking the "update" button
//takes updated numbers from form and uses them to
//update graph points and re-draw the function
function updateGraph(){
    for(let i = 0; i < cgraph.graphPoints.length; i++){
        let point = cgraph.graphPoints[i];
        let thisXIpt = document.getElementById("x"+i); 
        let thisYIpt = document.getElementById("y"+i); 
        console.log("point: "  + point.o.x + " " + point.o.y
         + " to: "+ thisXIpt.value + " " + thisYIpt.value);
        point.o.x = parseFloat(thisXIpt.value); 
        point.o.y = parseFloat(thisYIpt.value); 
    }
    cgraph.graphInterp(legrangeInterp, "#FF0000");
}

//gets position of mouse on canvas 
//  canvas: canvas that graph is being drawn on
//  evt:    javascript event object 
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return new point(
        evt.clientX - rect.left,
        evt.clientY - rect.top
    );
}

//calls zoomfunction within graph to adjust the range of the 
//graph that should be rendered 
function zoomGraph(evt){
    //event.preventDefault();
    let zoomAmt = evt.deltaY * -0.01;
    if(zoomAmt < -1) zoomAmt = -1; 
    else if(zoomAmt > 1) zoomAmt = 1;  
    console.log(zoomAmt);
    if(cgraph.shouldScale(zoomAmt)){
        cgraph.scaleGraph(zoomAmt);
        cgraph.graphInterp(legrangeInterp, "#FF0000");
    }
}

//add input for user interaction 
//links user input to functions listed above 
class Mouse{
    constructor(c_point, g_point, graph){
        //coordinates in canvas space
        this.loc_canvas = c_point; 
        //coordinates in graph space
        this.loc_graph =  g_point; 
        //graph the mouse will reference 
        this.grph = graph;
        //the index of point 
        this.ptInd = -1; 
    }

    UpdateLoc(canvas, evt){
       this.loc_canvas = getMousePos(canvas, evt);
       this.loc_graph = this.grph.ctgs(this.loc_canvas.x, this.loc_canvas.y);
       if(this.ptInd != -1){
           //update the point's location 
           this.grph.graphPoints[this.ptInd].o.x = this.loc_graph.x; 
           this.grph.graphPoints[this.ptInd].o.y = -this.loc_graph.y; 
       }
       
    }

    UpdateText(){
        this.grph.ctx.font = '20px serif';
        this.grph.ctx.fillText('('+ (this.loc_graph.x).toFixed(3) + ','+ 
                                    (-this.loc_graph.y).toFixed(3) +')', this.loc_canvas.x, this.loc_canvas.y);
    }

    CapturePoint(){
        console.log("called");
        this.ptInd = this.grph.checkMouseInteractionClick(this.loc_canvas); 
        if(this.ptInd != -1){
         console.log("got em");   
        }
    }

    ReleasePoint(){
        console.log("released"); 
        this.ptInd = -1;
    }

    UpdatePoints(){

    }
}
//create mouse 
var m = new Mouse(new point(0,0), 
                  new point(0,0),
                  cgraph); 

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
}, false);
//https://stackoverflow.com/questions/9643311/pass-a-string-parameter-in-an-onclick-function
document.getElementById("updatePts").onclick = addPointToGraph;

/* 
    1) TODOS: 
        create a mouse object that stores the mouse position in graph and canvas space ~> YES
        create a function that will draw text on mouse  ~> YES

    2) TODOS: 
        get that github nice n going 
        get function to check if mouse is near point
            ~> have mouse store index of point if near && mouse is pressed 
            ~> have mouse erase index of point if mouse is released && index != -1 
        
        make it so update function checks
            if index != -1 
                update the point of that graph point 8) 
        
        UPGRADE TF OUT OF THE CSS FOR THIS SHIT 
            -> get graph using dark theme 
            -> get the graph the appropriate width of the window 
            -> get the side bar to pop in and out 

        Display the current graphing function 
*/


    //USED AS TEST TO SEE IF WE CAN DETERMINE DISTANCE FROM MOUSE TO
    //POINT IN GRAPH
    /*
    cgraph.graphPoints.forEach(function(point){
    //if mousePt is near a point on the graph, 
        let dist = distSqrd(mousePosGc, point.o);
        if(dist < 0.075){ 
          //color that shit green 
          cgraph.ctx.fillStyle = "#00FF00";
          console.log(dist);
        }
    });
    */