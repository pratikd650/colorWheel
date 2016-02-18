var globalColorWheel;
var patternSelector;
var outerWheel, innerWheel;
var wheels;

//---------------------------------------------------------------------------------
var timer;

var count = 0;
var timersList = [];

function callTimerCallbacks() {
  // keep on incremementing count, till it reaches a very large number, and then start from 0 again
  count = (count + 1) % 1000000000000000; 
  for(var i = 0; i < timersList.length; i++) {
    timersList[i](count);
  }
}

//---------------------------------------------------------------------------------
var Led = React.createClass({
  getInitialState:function() {
    var state = {type:this.props.ledState.type};
    if (state.type == 'solid')
      state.solid = this.props.ledState.solid;
    else if (state.type == 'pattern')
      state.pattern = this.props.ledState.pattern;
     return state;
  },
  

  shouldComponentUpdate:function(nextProps, nextState) {
    // If the mode has change, we need to re-render
    if (nextProps.mode != this.props.mode)
      return true;
    // If the rotational offset has changed, we need to re-render
    if (nextProps.rotOffset != this.props.rotOffset)
      return true;
    // if ledState has changed, we need to re-render
    if (nextState.ledState != this.state.ledState)
      return true;

    return true;
  },

  setLed: function() {
    // Colors can only be set in design mode
    if (this.props.mode != "design")
      return

    // set the color/pattern in the ledState property, so that it updates the ledStateArr
    // Also set the color/pattern in the state, so that it triggers a render
    var ledState = this.props.ledState;
    ledState.type = patternSelector.state.type;
    if (ledState.type == "solid") {
      ledState.solid = patternSelector.state.solid;
      this.setState({type:ledState.type, solid:ledState.solid, pattern:undefined});
    } else if (ledState.type == "pattern") {
      ledState.pattern = patternSelector.state.pattern;
      ledState.patternDelay = 0; //total of all the delays
      for(var i = 0; i < ledState.pattern.length; i++) {
        var p = ledState.pattern[i];
        ledState.patternDelay += p.delay;
      }
      //console.log("setLed : pattern", ledState);
      this.setState({type:ledState.type, solid:undefined, pattern:ledState.pattern, patternDelay:ledState.patternDelay});
    }
  },

  toSvgPath: function(pattern, i, x, y, dx, dy) {
    var n = pattern.length;
    var path = [];


    for(var j = 0; j < n; j++) {
      var p = "M" + x + "," + y + " ";  // Go to bottom middle
      p += "m" + (+dy/2-(j/n*dy)) + "," + (dx/2-(j/n*dx)) + " "; // Go to bottom right
      p += "l" + (+dx) + "," + (-dy) + " "; // Go up
      p += "l" + (-dy/n) + "," + (-dx/n) + " "; // Go left 1/n
      p += "l" + (-dx) + "," + (+dy) + " "; // Go down
      p += "z" + " ";
      var rgb = pattern[j].rgb;
      path.push(<path key={j} d={p}
        fill={"rgb(" + rgb.r + "," + rgb.g + "," +  rgb.b + ")"}
        stroke = "white" 
        onClick = {this.setLed}/>);
    }
    //if (n > 1)
    //  console.log("toSvgPath", n, path);
    return (<g key={i}>{path}</g>);
  },

  render: function() {
    var x = this.props.x;
    var y = this.props.y;
    var i = this.props.ledIndex;
    var a = this.props.angle;
    var thickness = this.props.thickness;
    var dx = Math.round(Math.cos(a) * (thickness-2));
    var dy = Math.round(Math.sin(a) * (thickness-2));
    var ledState = this.props.ledState;

    //console.log("Led.render", this.state, this.props);
    // In the design mode, patterns are shown as multi colors
    if (this.props.mode == "design") {
      if (ledState.type == 'solid') {
        return this.toSvgPath([{rgb:ledState.solid}], i, x, y, dx, dy);
      } else if (ledState.type == 'pattern') {
        return this.toSvgPath( ledState.pattern, i, x, y, dx, dy);
      }
    }
    else if (this.props.mode == "run") {
      // If it is solid, just show the color
      if (ledState.type == 'solid') {
        return this.toSvgPath([{rgb:ledState.solid}], i, x, y, dx, dy);
      } else if (ledState.type == 'pattern') {
        var c = this.props.count % ledState.patternDelay;
        //console.log("Led.render  run/pattern", c, ledState, this.props, this.state);
        for(var i = 0; i < ledState.pattern.length; i++) {
          var p = ledState.pattern[i];
          if (c < p.delay)
            return this.toSvgPath([p], i, x, y, dx, dy);
          else
            c = c - p.delay;
        }
      }
    }
  }
})
 
//---------------------------------------------------------------------------------
var LedOneWheel = React.createClass({
  getInitialState:function() {
    var ledStateArr = [];
    for(var i= 0; i < this.props.n; i++)
      ledStateArr.push({type:'solid', solid:{r:0, g:0, b:0}}); // Set every led to black
    return {speed:0, delay:16, ledStateArr:ledStateArr};
  },
  
    
  render:function() {
    var rotOffset = 0;
    if (this.props.mode == 'run' && this.state.speed != 0) {
      var count2 = this.props.count / this.props.div; // Divide by this.props.div so that smaller wheel rotates at same speed as larger wheel
      rotOffset = Math.floor(count2/this.state.delay) % this.props.n;
      if (this.state.speed == -1) // reverse direction
        rotOffset = (this.props.n - 1) - rotOffset;
    }
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
      
      var ledState = this.state.ledStateArr[(i+rotOffset)%this.props.n];
      leds.push(<Led key={i} angle={a1} thickness={thickness-2} x={x} y={y} n={n} 
        ledIndex={i} rotOffset={rotOffset} mode={this.props.mode} ledState={ledState} count={this.props.count}/>);
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
    return {radius:this.props.radius, mode:'design', count:0};
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

  tick:function(count) {
    this.setState({count:count});
  },

  componentDidMount: function() {
    this.computeAvailableRadius();
    window.addEventListener('resize', this.handleResize);
    timersList.push(this.tick);    
  },

  componentWillUnmount: function() {
    window.removeEventListener('resize', this.handleResize);
    var index = timersList.indexof(this.tick); 
    if (index > -1) timersList.splice( index, 1 );
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

    //console.log("LedWheel.render", this.props, this.state);
    var self = this;
    return (<svg 
      ref={function(input) { self.elem = input; }}
      height={radius*2} width={radius*2}>
        <LedOneWheel  
          ref={function(input) { outerWheel = input; }}
          key="g0" n={24} div={1} radius={radius} thickness={thickness} circleIndex={0} r={r1}
          mode={this.state.mode} count={this.state.count}/>
        <LedOneWheel 
          ref={function(input) { innerWheel = input; }}
          key="g1" n={12} div={2} radius={radius} thickness={thickness} circleIndex={1} r={r2}
          mode={this.state.mode} count={this.state.count}/>
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
    wheels.setState({mode:'run'});
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
    count = 0;
    wheels.setState({mode:'design', count:0});
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
  getInitialState: function() {
    return {type:"solid", solid:{r:255,g:0,b:0}, pattern:[{rgb:{r:255,g:0,b:0}, delay:16}, {rgb:{r:0,g:0,b:255}, delay:16}]};
  },
  
  clonePattern: function() {
    var pattern2 = [];
    for(var i = 0; i < this.state.pattern.length; i++) {
      var p = this.state.pattern[i];
      pattern2.push({rgb:p.rgb, delay:p.delay});
    }
    return pattern2;
  },

  // Convert an rgb object to a JSX style object
  toStyleObj: function(rgb) {
    return {color:"rgb(" + rgb.r + "," + rgb.g + "," +  rgb.b + ")"};
  },

  // onClickHandler for changing colors
  changeColor : function(type, i) {
    //console.log("In changeColor");

    if (type == "solid") {
      this.setState({solid:globalColorWheel.state.rgb})
    } else if (type == "pattern") {
      // Make a shallow copy of the old pattern, just change selected pattern's color, and set the state
      var pattern2 = this.clonePattern();
      pattern2[i].rgb = globalColorWheel.state.rgb;
      this.setState({pattern:pattern2});
    }
  },

  componentDidMount: function() {
    var self = this;
    patternSelector = this;
    /* Radio button that selects - Solid or Pattern */
    $('.ui.radio.checkbox').checkbox({
      onChecked: function () {
        //console.log("onChecked", this, $(this));
        if ($(this).val() != undefined)
          self.setState({type: $(this).val()});
      }
    }); 
    /* Dropdown for each part of the Pattern */
    $('.ui.inline.dropdown').dropdown({
      onChange: function(value, text, $selectedItem) {
        // The id will be of the form pat0, pat1 etc. chop off the first 3 letters
        var i = $(this).attr('id').substr(3);
        var pattern2 = self.clonePattern();
        pattern2[i].delay = value;
        console.log("Setting state to ", pattern2);
        self.setState({pattern:pattern2});
      }
    });
  },
  
  render: function() {
    //console.log("SelectPattern: state", this.state);
    var pat = [];
    for(var i = 0; i < this.state.pattern.length; i++) {
      var p = this.state.pattern[i];
      pat.push(
        <span key={i}>
          <i className="stop icon" style={this.toStyleObj(p.rgb)} onClick={this.changeColor.bind(this, 'pattern', i)}></i>
          <div className="ui inline dropdown" id={"pat" + i}>
            <input type="hidden" name="delay"/>
            <i className="dropdown icon"></i>
            <div className="default text">1</div>
            <div className="menu">
              <div className="item" data-value="16">1</div>
              <div className="item" data-value="8"><sup>1</sup> &frasl; <sub>2</sub></div>
              <div className="item" data-value="4"><sup>1</sup> &frasl; <sub>4</sub></div>
              <div className="item" data-value="2"><sup>1</sup> &frasl; <sub>8</sub></div>
              <div className="item" data-value="1"><sup>1</sup> &frasl; <sub>16</sub></div>
            </div>
          </div>
        </span>);
    }
    return (
      <form className="ui form">
        <div className="grouped fields">
          <div className="field">
            <div className="ui radio checkbox">
              <input type="radio" name="type" value="solid" defaultChecked="true"/>
              <label>Solid</label>
            </div>
            <label>
              <i className="stop icon" style={this.toStyleObj(this.state.solid)} onClick={this.changeColor.bind(this, 'solid')}></i>
            </label>
          </div>
          <div className="field">
            <div className="ui radio checkbox">
              <input type="radio" name="type" value="pattern"/>
              <label>Pattern</label>
            </div>
            <label>{pat}</label>
          </div>
        </div>
      </form>);
  }
})

//---------------------------------------------------------------------------------
ReactDOM.render(
      <LedWheel radius={200}  
      ref={function(input) { wheels = input; }}/>,
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
