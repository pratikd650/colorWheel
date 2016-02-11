var globalColorWheel;
var timersList = [];
var outerWheel, innerWheel;

var count = 0;
function callTimerCallbacks() {
  count = (count + 1) % 60;
  for(var i = 0; i < timersList.length; i++) {
    timersList[i](count);
  }
}

//---------------------------------------------------------------------------------
var Led = React.createClass({
  getInitialState:function() {
    return {}; 
  },
  
  setLed: function() {
    // Set the color in the ledState array and also in the current state object
    // During rendering the color is taken from ledState, the only reason to set this state is to trigger a render
    this.props.ledState[(this.props.ledIndex + this.props.rotOffset) % this.props.n].rgb = globalColorWheel.state.rgb;
    this.setState({rgb:globalColorWheel.state.rgb}); 
  },

  render: function(){
    var x = this.props.x;
    var y = this.props.y;
    var a = this.props.angle;
    var thickness = this.props.thickness;
    var dx = Math.round(Math.cos(a) * (thickness-2));
    var dy = Math.round(Math.sin(a) * (thickness-2));
    var rgb = this.props.ledState[(this.props.ledIndex + this.props.rotOffset) % this.props.n].rgb;

    return(
    <path
      d={
        "M" + x + "," + y + " " +
        "l" + (+dy/2) + "," + (dx/2) + " " +
        "l" + (+dx) + "," + (-dy) + " " + 
        "l" + (-dy) + "," + (-dx) + " " +
        "l" + (-dx) + "," + (+dy) + " " +
        "z"
      }
      fill={"rgb(" + rgb.r + "," + rgb.g + "," +  rgb.b + ")"}
      stroke = "black" 
      onClick = {this.setLed}
    />);
  }
})
 
//---------------------------------------------------------------------------------
var LedOneWheel = React.createClass({
  getInitialState:function() {
    var ledState = [];
    for(var i= 0; i < this.props.n; i++)
      ledState.push({rgb:{r:255, g:0, b:0}}); // Set every to red
    return {speed:0, rotOffset:0, counter:60, ledState:ledState};
  },

  changeSpeed:function(speedInc) {
    //console.log("LedOneWheel n=", this.props.n, " speedInc=", speedInc, " current speed=", this.state.speed);
    if ((speedInc == 1 && this.state.speed < 1) 
      || (speedInc == -1 && this.state.speed > -1)) {
      this.setState({speed:(this.state.speed + speedInc)})
    }
  },
  
  tick:function(count) {
    if (count==0 || count % this.state.counter == 0) {
      if (this.state.speed == 0)
        return;
      //console.log("LedOneWheel:tick speed=", this.state.speed, " angle=", this.state.rotOffset, " counter=", this.state.counter);
      var r = this.state.rotOffset;
      r = (r + this.state.speed) % this.props.n;
      this.setState({rotOffset:r});
    }
  },
  
  componentDidMount: function() {
    timersList.push(this.tick);    
  }, 
  
  componentWillUnmount: function() {
    var index = timersList.indexof(this.tick); 
    if (index > -1) timersList.splice( index, 1 );
  },
  
  render:function() {
    //console.log("LedOneWheel : render", this.props, this.state);
    var n = this.props.n;
    var radius = this.props.radius;
    var r = this.props.r;
    var thickness = this.props.thickness;
    var r2 = r - thickness;
    var leds = [];
    for(var i = 0; i < n; i++) {
      var a1 = Math.PI * 2 * i / n;
      var x = radius + Math.round(Math.cos(a1)*r);
      var y = radius - Math.round(Math.sin(a1)*r);
      
      leds.push(<Led key={i} angle={a1} thickness={thickness-2} x={x} y={y} n={n} 
        ledIndex={i} rotOffset={this.state.rotOffset} ledState={this.state.ledState}/>);
    }
    //return (<g transform={"rotate(" + (360* this.state.angle/n) + " " + radius + " " + radius + ")"}>{leds}</g>);
    return (<g>{leds}</g>);
  }
})

//---------------------------------------------------------------------------------
var LedWheel = React.createClass({
  // The state is minumum of the radius sepcified in the props, and the available radius
  getInitialState:function() {
    //console.log("LedWheel.getInitialState", this.props.radius);
    return {radius:this.props.radius};
  },

  computeAvailableRadius:function() {
    //console.log("LedWheel.computeAvailableRadius", this.props.radius);
    if (this.elem) {
      // calculate parent's width - padding
      var p = this.elem.parentNode;
      var s= window.getComputedStyle(p);
      var w = p.clientWidth - parseFloat(s.paddingLeft) - parseFloat(s.paddingLeft); // Need parseFloat to get rid of px in 14px
      // Divide width by 2, and leave off an extra pixel
      var r = Math.min(this.props.radius, Math.round(w/2));
      //console.log("Computed Radius", r);
      this.setState({radius:r})
    }    
  },
  
  handleResize: function(e) {
    this.computeAvailableRadius();
  },

  componentDidMount: function() {
    this.computeAvailableRadius();
    window.addEventListener('resize', 100, this.handleResize);
  },

  componentWillUnmount: function() {
    window.removeEventListener('resize', this.handleResize);
  },

  getDefaultProps: function() {
    return { radius:200 };
  },

  // thickeness is calculated from radius as follows
  //    radius^2 = thickness/2 ^2  + (r1 + thickness)^2
  //    thickness/2  / r1  = tan(PI/24)
  // Solving
  //   r1 = thickness / (2*tan(PI/24))
  //   radius^2 = thickness^2 * (  (1/2)^2 + (1/(2*tan(PI/24) + 1)^2 )

  render: function() {
    var radius = this.state.radius-1;
    var thickness = radius / Math.sqrt(0.25 + Math.pow(1 + (1/(2*Math.tan(Math.PI/24))), 2) );
    var r1 = thickness / (2 * Math.tan(Math.PI/24));
    var r2 = thickness / (2 * Math.tan(Math.PI/12));

    var self = this;
    return (<svg 
      ref={function(input) { self.elem = input; }}
      height={radius*2} width={radius*2}>
        <LedOneWheel  
          ref={function(input) { outerWheel = input; }}
          key="g0" n={24} radius={radius} thickness={thickness} circleIndex={0} r={r1}/>
        <LedOneWheel 
          ref={function(input) { innerWheel = input; }}
          key="g1" n={12} radius={radius} thickness={thickness} circleIndex={1} r={r2}/>
      </svg>);
  }  
})

//---------------------------------------------------------------------------------
var HueSquare = React.createClass({
  getInitialState: function() {
    return {hue:0}; // initial hue is 0, inicial color is red
  },

  getDefaultProps: function() {
    return { n: 8, radius:100, thickness:30 };
  },
  
  render: function() {
    var n = this.props.n;
    var radius = this.props.radius;
    var thickness = this.props.thickness;
  
    var radius2 = radius - thickness - thickness/2;
    var squareSize = 2 * radius2/Math.sqrt(2) - 2; // side of square that fits in inner circle 
    var smallSquareSize = squareSize/n;
    
    var colorSquares = [];
    var sat = 255;
    for(var j = 0; j < n; j++) {
      var val = 255;
      for(var i = 0; i < n; i++) {
        var hsv = {hue:this.state.hue, sat:sat, val:val};
        var rgb = hsv2rgb(hsv);

        //console.log(hsv, rgb);
        colorSquares.push(<path
          key={"path" + j + "_" + i}
          d={
            "M" + (radius -squareSize/2 + squareSize*j/n) + "," + (radius - squareSize/2 + squareSize*i/n) + " " +
            "l" + (+smallSquareSize) + "," + 0 + " " + 
            "l" + 0 + "," + (+smallSquareSize) + " " +
            "l" + (-smallSquareSize) + "," + 0 + " " +
            "z"
          }
          fill={"rgb(" + rgb.r + "," + rgb.g + "," +  rgb.b + ")"}
          stroke = "none"
        />);
        val = val -256/n; 
      }
      sat = sat -256/n; 
    }
    return (<g>{colorSquares}</g>);
  }
})

//---------------------------------------------------------------------------------
var ColorWheel = React.createClass({
  // The state is minumum of the radius sepcified in the props, and the available radius
  getInitialState:function() {
    //console.log("ColorWheel.getInitialState", this.props.radius);
    return {radius:this.props.radius, hueIndex:0, hue:0, rgb:{r:255,g:0,b:0}}; // initial hue is 0, inicial color is red
  },
  
  computeAvailableRadius:function() {
    if (this.elem) {
      // calculate parent's width - padding
      var p = this.elem.parentNode;
      var s= window.getComputedStyle(p);
      var w = p.clientWidth - parseFloat(s.paddingLeft) - parseFloat(s.paddingLeft); // Need parseFloat to get rid of px in 14px
      // Divide width by 2, and leave off an extra pixel
      var r = Math.min(this.props.radius, Math.round(w/2));
      //console.log("Computed Radius", r);
      this.setState({radius:r})
    }    
  },
  
  handleResize: function(e) {
    this.computeAvailableRadius();
  },

  componentDidMount: function() {
    this.computeAvailableRadius();
    window.addEventListener('resize', this.handleResize);
    globalColorWheel = this;
  },

  componentWillUnmount: function() {
    window.removeEventListener('resize', this.handleResize);
  },

  selectHue: function(i, hue, rgb) {
    this.setState({hueIndex:i, hue:hue, rgb:rgb});
    this.hueSquare.setState({hue:hue});
  },
  
  getDefaultProps: function() {
    return { n: 24, radius:100};
  },

  render: function() {
    var n = this.props.n;
    var radius = this.state.radius -1;
    var thickness = Math.round(radius/3);
    // radus is the outer radius
    
    var radius2 = radius - thickness - thickness/2;
    var radius3 = radius - thickness/2;
    
    
    var colorSegments = [];
    for(var i = 0; i < n; i++) {
      var a1 = Math.PI * 2 * i / n;
      var a2 = Math.PI * 2 * (i+1)/n;
      var hue = Math.round(256 * i/n);
      var hsv = {hue:hue, sat:255, val:255};
      var rgb = hsv2rgb(hsv);
      var r = this.state.hueIndex == i ? radius : radius3;
      
      //console.log(hsv, rgb);
      colorSegments.push(<path
        key={"path" + i}
        id={"path" + i}
        d={
          "M" + (radius + Math.round(Math.cos(a1) * r)) + "," + (radius - Math.round(Math.sin(a1) * r)) + " " +
          "A" + r + "," + r + " 0 0,0 " + (radius + Math.round(Math.cos(a2) * r)) + "," + (radius - Math.round(Math.sin(a2) * r)) + " " +
          "L" + (radius + Math.round(Math.cos(a2) * radius2)) + "," + (radius - Math.round(Math.sin(a2) * radius2)) + " " +
          "A" + radius2 + "," + radius2 + " 0 0,1 " + (radius + Math.round(Math.cos(a1) * radius2)) + "," + (radius - Math.round(Math.sin(a1) * radius2)) + " " +
          "Z"  
        }
        fill={"rgb(" + rgb.r + "," + rgb.g + "," +  rgb.b + ")"}
        stroke = "black"
        strokeWidth = {this.state.hueIndex == i ? "1.5" : "1"}
        onClick = {this.selectHue.bind(this, i, hue, rgb)}
      />);
    }
    //console.log("ColorWheel", radius);
    var self = this;
    return (<svg height={radius*2} width={radius*2}
      ref={function(input) { self.elem = input; }}
      >
      <g>{colorSegments}</g>
      <HueSquare 
        ref={function(input) {self.hueSquare = input }}
        radius={this.state.radius} n={8} thickness={thickness} />
    </svg>);
  }
})

//---------------------------------------------------------------------------------
var LeftRightArrow = React.createClass({
  changeSpeed:function(speedInc) {
    this.setState({speed:(this.state.speed + speedInc)}); 
    this.props.wheelObj.changeSpeed(speedInc);
  },
  
  getInitialState: function() {
    return {speed:0};
  },
  
  render: function() {
    return(
      <div className="inline field">
          <label>{this.props.label}</label>
          <button type="button" className="ui compact icon button" onClick={this.changeSpeed.bind(this, -1)}><i className="left chevron icon"></i></button> 
          <label>{this.state.speed}</label>
          <button type="button" className="ui compact icon button" onClick={this.changeSpeed.bind(this, +1)}><i className="right chevron icon"></i></button>
      </div>);
  }
})


//---------------------------------------------------------------------------------

ReactDOM.render(
      <LedWheel radius={200}/>,
      document.getElementById('main')
)

ReactDOM.render(
      <ColorWheel radius={100} n={24}/>,
      document.getElementById('right')
)

ReactDOM.render(
      <form className="ui form"> 
      <LeftRightArrow label="Outer Circle" wheelObj={outerWheel}/>
      <LeftRightArrow label="Inner Circle" wheelObj={innerWheel}/>
      </form>,
      document.getElementById('left')
)

window.setInterval(callTimerCallbacks, 20);
