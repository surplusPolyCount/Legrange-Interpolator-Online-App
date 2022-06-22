/*all functions that involves interfacing with html page*/



//function called from html clicking "addPoint" button
//adds point to interpolator and re-draws the graph  
//g:  graph to use 
//fp: form parent to use 
function addPointToGraph(g, fp){
    //take input and convert into numbers
    let newx = parseFloat(document.getElementById("pointx").value, 10); 
    let newy = parseFloat(document.getElementById("pointy").value, 10);
    //if input is not numbers, return false 
    if(isNaN(newx) || isNaN(newy)){return false;}
    //create new point from numbers and add to graph 
    let newPt = new point(newx, newy); 
    g.addPoint(newPt);
    //render the new form from the the updated point list
    let form = document.getElementById("pointForm"); 
    form.remove();
    buildForm(g, fp); 
    //re-draw graph with updated points
    g.graphInterp(legrangeInterp);
}

//function called from html clicking "addPoint" button
//deletes point 
function deletePointFromGraph(g, pointId, fp){
    console.log("calling from del: " + g.graphPoints.length);
    //takes index of point, and uses it to delete the point
    g.deletePoint(pointId);
    //re-create form
    let form = document.getElementById("pointForm"); 
    form.remove();
    buildForm(g, fp); 
    //re-create graph
    g.graphInterp(legrangeInterp);
}


//https://www.geeksforgeeks.org/how-to-create-a-form-dynamically-with-the-javascript/
//create the form based of list of points 
//  formParent: the html element that the form should be inserted into 
//  g         : the graph to use 
function buildForm(g, formParent){
    let i = 0; 
    let existingForm = document.getElementById("pointForm"); 
    if(existingForm != null && formParent != null){
        formParent.removeChild(existingForm);
    }
    let form = document.createElement("form");
    form.setAttribute("id", "pointForm");
    g.graphPoints.forEach(function(point){
        var divWrapper = document.createElement("div");
        divWrapper.setAttribute("class", "pt-editor-ipt");
        //divWrapper.setAttribute("id", "pt-edit-div-" + i);

        var xTxt = document.createTextNode("x:");
        var yTxt = document.createTextNode("y:");
        var buttonTxt = document.createTextNode("X");

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
        xIpt.setAttribute("class", "pt-properties");
        xIpt.setAttribute("size", "8"); 
        xIpt.setAttribute("value", point.o.x);

        var yIpt = document.createElement("input");
        yIpt.setAttribute("type", "text");
        yIpt.setAttribute("name", "y"+i);
        yIpt.setAttribute("id", "y"+i);
        yIpt.setAttribute("class", "pt-properties");
        yIpt.setAttribute("size", "8"); 
        yIpt.setAttribute("value", point.o.y);

        var delButtn = document.createElement("button"); 
        delButtn.appendChild(buttonTxt);
        delButtn.setAttribute("type", "button");
        delButtn.setAttribute("id", i.toString()); 
        delButtn.setAttribute("class", "delete-btn"); 
        delButtn.addEventListener('click', function(){
            deletePointFromGraph(g, parseInt(delButtn.id), formParent);
        });

        divWrapper.appendChild(xLab);
        divWrapper.appendChild(xIpt);  
        divWrapper.appendChild(yLab);
        divWrapper.appendChild(yIpt);
        divWrapper.appendChild(delButtn);
        var br = document.createElement("br"); 
        form.appendChild(br.cloneNode());
        form.appendChild(divWrapper);

        //form.appendChild(br.cloneNode()); 
        i++; 
    });

    var upButtonTxt = document.createTextNode("UPDATE");
    var upButton = document.createElement("button"); 
    //upButton.setAttribute("onclick", "updateGraph(g)");
    upButton.setAttribute("type", "button");
    upButton.appendChild(upButtonTxt);
    form.appendChild(upButton);
    //upButton.onclick = updateGraph(g);
    formParent.appendChild(form);
}

//called on clicking the "update" button
//takes updated numbers from form and uses them to
//update graph points and re-draw the function
//  g         : the graph to use 

function updateGraph(g){
    for(let i = 0; i < g.graphPoints.length; i++){
        console.log("ran " + i + " times with point (from withing update graph) " + g.graphPoints.length);
        let point = g.graphPoints[i];
        let thisXIpt = document.getElementById("x"+i); 
        let thisYIpt = document.getElementById("y"+i); 
        console.log("point: "  + point.o.x + " " + point.o.y
         + " to: "+ thisXIpt.value + " " + thisYIpt.value);
        point.o.x = parseFloat(thisXIpt.value); 
        point.o.y = parseFloat(thisYIpt.value); 
    }
    g.graphInterp(legrangeInterp);
}

//gets position of mouse on canvas 
//  canvas: canvas that graph is being drawn on
//  evt:    javascript event object 
//  g:      the graph to use 

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return new point(
        evt.clientX - rect.left,
        evt.clientY - rect.top
    );
}

//calls zoomfunction within graph to adjust the range of the 
//graph that should be rendered 
// g         : the graph to use 
function zoomGraph(evt, g){
    //event.preventDefault();
    let zoomAmt = evt.deltaY * -0.01;
    if(zoomAmt < -1) zoomAmt = -1; 
    else if(zoomAmt > 1) zoomAmt = 1;  
    //console.log(zoomAmt);
    if(g.shouldScale(zoomAmt)){
        g.scaleGraph(zoomAmt);
        g.graphInterp(legrangeInterp);
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
        this.grph.ctx.fillStyle = "#fff";
        if(this.ptInd != -1)
            this.grph.ctx.fillStyle = "#f54";
        this.grph.ctx.font = '20px helvetica';
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



/* 
    1) TODOS: 
        create a mouse object that stores the mouse position in graph and canvas space ~> YES
        create a function that will draw text on mouse  ~> YES

    2) TODOS: 
        YES
        get that github nice n going 
        YES
        merge master branch with main branch
        
        YES
        get function to check if mouse is near point
            ~> have mouse store index of point if near && mouse is pressed 
            ~> have mouse erase index of point if mouse is released && index != -1 
        
        YES
        make it so update function checks
            if index != -1 
                update the point of that graph point 8) 
        
        UPGRADE TF OUT OF THE CSS FOR THIS SHIT 
            -> get graph using dark theme 
            -> get the graph the appropriate width of the window 
            -> get the side bar to pop in and out 
            -> top toolbar 
            

        Display the current graphing function 
            -> asthetically pleasing way of showing these stoopid ass functions
*/