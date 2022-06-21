//https://www.html5canvastutorials.com/advanced/html5-canvas-mouse-coordinates/

//code mostly written by Simon Rosenthal

//class for data point that represent 
//point in graph space
class point{
    constructor(x, y){
        this.x = x; 
        this.y = y;
    }
}

//function to get distance between two points sqrd
function distSqrd(p1, p2){
    return (p2.x-p1.x)*(p2.x-p1.x) + (p2.y-p1.y) * (p2.y-p1.y);
}

//function to draw small segment of graph
function drawLine(ctx, point1, point2){
    ctx.beginPath(); 
    ctx.moveTo(point1.x, point1.y); 
    ctx.lineTo(point2.x, point2.y); 
    ctx.stroke(); 
}

//class for data of type point that will be used for interpolation 
class graphPoint{
    constructor(origin, color, g){
        this.o = origin; //origin of point
        this.c = color;  //color of point to be drawn on graph
        this.radius = 5; //radius (in pixels of dot to be drawn on graph)
        this.g = g;      //graph this point belongs too
    }

    //checks if mouse is over a point (in graph space) used for interpolation
    mouseOver(mousePos){
        //if distance^2 from mousePos,origin < radius^2
        return distSqrd(this.g.gtcs(this.o.x, this.o.y), mousePos) < (this.radius * this.radius); 
    }

    //draws point on graph as circle
    draw(){
        this.g.ctx.fillStyle = this.c;
        this.g.ctx.beginPath();
        this.g.ctx.ellipse(this.g.gtcs(this.o.x, this.o.y).x, 
                      this.g.gtcs(this.o.x, this.o.y).y, 
                      this.radius, this.radius, Math.PI, 0, 2 * Math.PI);
        this.g.ctx.fill();
        //console.log("drawn at: " + this.g.gtcs(this.o.x, this.o.y).x + " " + this.g.gtcs(this.o.x, this.o.y).y);
    }


}

//class for graph
class graph{
    constructor(canvas){
        this.ctx = canvas.getContext("2d"); 
        this.w = canvas.getBoundingClientRect().width;
        this.h = canvas.getBoundingClientRect().height;
        
        //variables for declaring min and max of x & y range for graph for
        //the function to be ploted on
        this.xMin = -10; 
        this.xMax = 10;  
        this.yMin = -10; 
        this.yMax = 10;
        
        //to be used to for potential panning around graph without focusing 
        //on center of graph 
        this.center = new point(0,0);

        //list of points to be used for interpolating 
        this.graphPoints = [];
    }

    //checks if mouse is hovering over a point used for interpolation
    checkMouseInteractionClick(mousePos){
        for(let q = 0; q < this.graphPoints.length; q++){
            if(this.graphPoints[q].mouseOver(mousePos)){
                return q; 
            }
        }
        return -1;   
    }

    //checks if range of graph is too small to continue zooming in
    //  scale: NUM amount of zoom to be checked
    //NOTE: find better function 
    //      mouse wheel works in increments of 1, so 1-1 = 0 
    shouldScale(scale){
        return (this.xMin - scale < -0.00000001);
    }

    //used to zoom in/out the graph given 
    //  scale: NUM amount to zoom in/out by adding/subtracting from range
    scaleGraph(scale){  
        let range = Math.abs(this.xMax - this.xMin); 
        if(scale == -1 && range <= 2){
            scale = 0.5;
        }
        if(range < 1){
            scale *= (range * range); 
        }   
        this.xMin -= scale; 
        this.xMax += scale; 
        this.yMin -= scale; 
        this.yMax += scale;
    }

    //remove a point from list of points to use in interpolation
    //  ptIdx: NUM index of point to remove
    deletePoint(ptIdx){
        this.graphPoints.splice(ptIdx, 1); 
    }

    //add a point to list of points to use in interpolation
    //  point: POINT the point to add to graphPoints
    addPoint(point){
        //create graphPoint given a general point
        var mPoint = new graphPoint(point, "#5555FF", this);
        
        //sort array incomplete feature to be added later
        /*
        let i = 0; 
        this.graphPoints.every(function(lpoint){
            if(lpoint.o.x > point.x) {return false;}
            i++; 
            return true; 
        });
        if(i != this.graphPoints.length){
            //split at i to keep that smexy ass continuity
        }
        */ 

        //add point
        this.graphPoints.push(mPoint);
    }

    //graph to canvas space (converts coordinates to pixel values of canvas)
    //  x: NUM x value of coordinate
    //  y: NUM y value of coordinate
    gtcs(x, y){
        let xhalf = Math.abs(this.xMax -  this.xMin)/2; 
        let xmid = xhalf + this.xMin;
        let newx = ((x - xmid)/xhalf + 1)/2; 

        let yhalf = Math.abs(this.yMax -  this.yMin)/2; 
        let ymid = yhalf + this.yMin;
        let newy = (1-(y - ymid)/yhalf)/2;
        return new point(newx * this.w, newy * this.h);
    }  

    //INCOMPLETE/NOT USED
    //canvas to graph space  
    // x: NUM x pixel value in canvas
    // y: NUM y pixel value in canvas
    ctgs(x, y){
        let xLen = Math.abs(this.xMax -  this.xMin); 
        let xGraphCoord = x/this.w * xLen + this.xMin;
        
        let yLen = Math.abs(this.yMax -  this.yMin); 
        let yGraphCoord = y/this.h * yLen + this.yMin;
        return new point(xGraphCoord, yGraphCoord);
    }

    //draws the background of the graph 
    drawCoordinatePlane(){
        //draw background color of graph
        this.ctx.fillStyle = "#FFFFFF";
        this.ctx.beginPath();
        this.ctx.rect(0, 0, this.w, this.h);
        this.ctx.fill();

        //draw grey back lines of grid 
        this.ctx.strokeStyle = "#555555";
        //horizontal 
        for(let i = 0; i < 5; i++)
            drawLine(this.ctx, new point(0, i * (this.h/5)), new point(this.w, i * (this.h/5)));
        //vertical 
        for(let j = 0; j < 5; j++)
            drawLine(this.ctx, new point(j * (this.w/5), 0), new point(j * (this.w/5), this.h));
        this.ctx.strokeStyle = "#bbbbbb";
        //horizontal 
        for(let i = 0; i < 10; i++)
            drawLine(this.ctx, new point(0, i * this.h/10), new point(this.w, i * (this.h/10)));
        //vertical 
        for(let j = 0; j < 10; j++)
            drawLine(this.ctx, new point(j * (this.w/10), 0), new point(j * (this.w/10), this.h));
        this.ctx.strokeStyle = "#000000";
        //draw thick lines 
        drawLine(this.ctx, new point(this.w/2, 0), new point(this.w/2, this.h));
        drawLine(this.ctx, new point(0, this.h/2), new point(this.w, this.h/2));
    
        //draw numbers onto graph 
        this.ctx.font = '12px serif';
        let valX = this.xMin;
        let valY = this.yMin;
        let range = Math.abs(this.xMax - this.xMin);
        let tickCnt = 10; 
        let decToShow = 2;  //establish how many decimals to show 
        if(range < 10) decToShow = 2;
        if(range < 5)  decToShow = 2; 
        if(range < 1) decToShow = 4; 
        if(range < 0.1) decToShow = 8;  
        for(let i = 0; i < tickCnt+1; i++){
            //draw x range
            this.ctx.strokeText(valX.toFixed(decToShow), this.gtcs(valX, 0).x, this.gtcs(valX, 0).y+15);
            valX += (range/tickCnt); 
            //draw y range
            this.ctx.strokeText(valY.toFixed(decToShow), this.gtcs(0, valY).x, this.gtcs(0, valY).y);
            valY += (range/tickCnt); 
        }
    }

    //method to actual render function onto graph 
    //  mfunc: FUNCTION OF TYPE NUM 
    //         function of polynomial to draw on canvas
    //  color: STRING hex value color you want function to be in 
    graphInterp(mfunc, color){
        //draw coordinate plane
        this.drawCoordinatePlane();

        //draw actual graph
        cgraph.ctx.strokeStyle = color;
        var inc = Math.abs(this.xMax - this.xMin)/300;
        var y = mfunc(this.xMin, this.graphPoints); 
        var point1 = this.gtcs(this.xMin, y); 
        for(let x = this.xMin + inc;  x  < this.xMax; x+= inc ){
            var y1 = mfunc(x, this.graphPoints);
            var point2 = this.gtcs(x, y1); 
            drawLine(this.ctx, point1, point2); 
            point1 = point2; 
        }

        //draw points 
        this.graphPoints.forEach(function (point){
            point.draw();
        });
        console.log("drawn");
    }

    //NOT USED
    //draws function that does not use graphPoints
    //(so likely not polynomial interpolation)
    //  mfunc: FUNCTION OF RETURN TYPE NUM 
    //         function of polynomial to draw on canvas
    graph(mfunc, color){
        //draw coordinate plane
        this.drawCoordinatePlane();

        //draw the actual graph 
        cgraph.ctx.strokeStyle = color;
        var inc = Math.abs(this.xMax - this.xMin)/100;
        var y = mfunc(this.xMin); 
        var point1 = this.gtcs(this.xMin, y); 
        for(let x = this.xMin + inc;  x  < this.xMax; x+= inc ){
            var y1 = mfunc(x);
            //console.log("from graph: " , x, y1); 
            var point2 = this.gtcs(x, y1); 
            drawLine(this.ctx, point1, point2); 
            point1 = point2; 
        }

        //draw points 
        this.graphPoints.forEach(function (point){
            point.draw();
        });
    }


}

//legrange interpolation 
//https://en.wikipedia.org/wiki/Lagrange_polynomial#Examples
//function that returns a function that interpolates 
function legrangeInterp(x, points){
    var res = 0;
    for (var i  = 0; i  < points.length; i++){
        var li = 1;
        for(var j = 0; j < points.length; j++){
            if(j == i) continue; 
            li *= (x - points[j].o.x)/(points[i].o.x - points[j].o.x);
        }
        res += points[i].o.y * li; 
    }
    return res; 
}




