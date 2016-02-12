var globalColorWheel;
var outerWheel, innerWheel;

//---------------------------------------------------------------------------------
var timer;

var count = 0;
var timersList = [];

function callTimerCallbacks() {
  count = (count + 1) % 32;
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
      stroke = "white" 
      onClick = {this.setLed}
    />);
  }
})
 
//---------------------------------------------------------------------------------
var LedOneWheel = React.createClass({
  getInitialState:function() {
    var ledState = [];
    for(var i= 0; i < this.props.n; i++)
      ledState.push({rgb:{r:0, g:0, b:0}}); // Set every led to black
    return {speed:0, rotOffset:0, delay:16, ledState:ledState};
  },
  
  tick:function(count) {
    count = count / this.props.div; // Divide by this.props.div so that smaller wheel moves at same speed as larger wheel
    if (count==0 || count % this.state.delay == 0) {
      if (this.state.speed == 0)
        return;
      //console.log("LedOneWheel:tick speed=", this.state.speed, " angle=", this.state.rotOffset, " counter=", this.state.counter);
      var r = this.state.rotOffset;
      r = (r + this.state.speed + this.props.n) % this.props.n;
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
      console.log("Computed Radius", r);
      this.setState({radius:r})
    }    
  },
  
  handleResize: function(e) {
    this.computeAvailableRadius();
  },

  componentDidMount: function() {
    this.computeAvailableRadius();
    window.addEventListener('resize', this.handleResize);
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
          key="g0" n={24} div={1} radius={radius} thickness={thickness} circleIndex={0} r={r1}/>
        <LedOneWheel 
          ref={function(input) { innerWheel = input; }}
          key="g1" n={12} div={2} radius={radius} thickness={thickness} circleIndex={1} r={r2}/>
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
  
  selectShade:function(rgb) {
    globalColorWheel.setState({rgb:rgb});
  },
  
  render: function() {
    var n = this.props.n;
    var radius = this.props.radius;
    var thickness = this.props.thickness;
  
    var radius2 = radius - thickness - thickness/2;
    var squareSize = 2 * radius2/Math.sqrt(2) - 2; // side of square that fits in inner circle 
    var smallSquareSize = squareSize/n;
    
    var colorSquares = [];
    for(var j = 0; j < n; j++) {
      var sat = Math.min(255, Math.round(256*(n-1-j)/(n-1)));
      for(var i = 0; i < n; i++) {
        var val = Math.min(255, Math.round(256*(n-1-i)/(n-1)));
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
          onClick={this.selectShade.bind(this, rgb)}
          fill={"rgb(" + rgb.r + "," + rgb.g + "," +  rgb.b + ")"}
          stroke = "none"
        />);
      }
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
    
    // loop till. n+1, the n't item will show selected hue
    for(var j = 0; j < n+1; j++) {
      var i = (j == n) ? this.state.hueIndex : j;
      var a1 = Math.PI * 2 * i / n;
      var a2 = Math.PI * 2 * (i+1)/n;
      var hue = Math.round(256 * i/n);
      var hsv = {hue:hue, sat:255, val:255};
      var rgb = (j == n) ? this.state.rgb : hsv2rgb(hsv);
      var r2 = this.state.hueIndex == i ? radius-2 : radius3; // outer arc radius
      var r1 = (j == n) ? radius3  : radius2; // inner arc radius
      
      //console.log(hsv, rgb);
      colorSegments.push(<path
        key={"path" + j}
        id={"path" + j}
        d={
          "M" + (radius + Math.round(Math.cos(a1) * r2)) + "," + (radius - Math.round(Math.sin(a1) * r2)) + " " +
          "A" + r2 + "," + r2 + " 0 0,0 " + (radius + Math.round(Math.cos(a2) * r2)) + "," + (radius - Math.round(Math.sin(a2) * r2)) + " " +
          "L" + (radius + Math.round(Math.cos(a2) * r1)) + "," + (radius - Math.round(Math.sin(a2) * r1)) + " " +
          "A" + r1 + "," + r1 + " 0 0,1 " + (radius + Math.round(Math.cos(a1) * r1)) + "," + (radius - Math.round(Math.sin(a1) * r1)) + " " +
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
    if ((speedInc == +1 && this.state.speed < 5) || (speedInc == -1 && this.state.speed > -5)) {
      var newSpeed = this.state.speed + speedInc;
      this.setState({speed:newSpeed}); 
      this.props.wheelObj.setState({speed:Math.sign(newSpeed), delay: (32 / (1<<Math.abs(newSpeed)))});
    }
  },
  
  getInitialState: function() {
    return {speed:0};
  },
  
  render: function() {
    var s = this.state.speed;
    var fr;
    if (s==0 || s==1 || s==-1)
      fr = <span className="speed">{s}</span>;
    else // Translated speed to fraction 0 -> 0   1 -> 1   2- > 1/2   3 -> 1/4   4 -> 1/8   5 -> 1/16
      fr=<span className="speed">{s<0 ? "-" : ""}<sup>1</sup> &frasl; <sub>{1<<(Math.abs(s)-1)}</sub></span>
      
    return(
      <div className="inline field">
          <small>{this.props.label}</small>
          <button type="button" className="ui compact mini button" onClick={this.changeSpeed.bind(this, -1)}><i className="left chevron icon"></i></button> 
          <small>{fr}</small>
          <button type="button" className="ui compact mini button" onClick={this.changeSpeed.bind(this, +1)}><i className="right chevron icon"></i></button>
      </div>);
  }
})

var StartAnimation = React.createClass({
  play:function() {
    if(!timer)
      timer = window.setInterval(callTimerCallbacks, 20);
  },
  pause:function() {
    if (timer) {
      window.clearInterval(timer); 
      timer = undefined;
    }
  },  
  stop:function() {
    this.pause();
    innerWheel.setState({rotOffset:0});
    outerWheel.setState({rotOffset:0});
  },  
  
  render: function() {
    return(
      <div className="inline field">
        <b>Animation</b>
        <button type="button" className="ui compact icon button" onClick={this.play}><i className="play icon"></i></button>
        <button type="button" className="ui compact icon button" onClick={this.pause}><i className="pause icon"></i></button>
        <button type="button" className="ui compact icon button" onClick={this.stop}><i className="stop icon"></i></button>
      </div>);
  }  
})

//---------------------------------------------------------------------------------
var SelectPattern = React.createClass({
  componentDidMount: function() {
    $('.ui.radio.checkbox').checkbox();
  }
  
  render: function() {
    return (
      <div className="grouped fields">
        <div className="field">
          <div className="ui radio checkbox">
            <input type="radio" name="Solid" defaultChecked="true" tabindex="0" className="hidden"/>
            <label>Solid</label>
          </div>
        </div>
      </div>);
  }
  /*
  render: function() {
    return (
      <div className="grouped fields">
        <div className="field">
          <div className="ui radio checkbox" ref={function(input) {input.checkbox()}}>
            <input type="radio" name="Solid" checked="true" tabindex="0" className="hidden"></input>
            <label>Solid</label>
          </div>
        </div>
        <div className="field">
          <div className="ui radio checkbox" ref={function(input) {input.checkbox()}>
            <input type="radio" name="Pattern" checked tabindex="0" className="hidden"></input>
            <label>Pattern</label>
          </div>
        </div>
      </div>);
  }
  */
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
      <StartAnimation/>
      <LeftRightArrow label="Outer circle speed" wheelObj={outerWheel}/>
      <LeftRightArrow label="Inner circle speed" wheelObj={innerWheel}/>
      </form>,
      document.getElementById('left')
)

ReactDOM.render(
      <SelectPattern/>,
      document.getElementById('pattern')
)

//timer = window.setInterval(callTimerCallbacks, 20);
