var globalColorWheel;

//---------------------------------------------------------------------------------
var Led = React.createClass({
  getInitialState:function() {
    return {rgb:{r:255, g:0, b:0}}; // Set it to red
  },
  
  setLed: function() {
    this.setState({rgb:globalColorWheel.state.rgb});
  },

  render: function(){
    var x = this.props.x;
    var y = this.props.y;
    var a = this.props.angle;
    var thickness = this.props.thickness;
    var dx = Math.round(Math.cos(a) * (thickness-2));
    var dy = Math.round(Math.sin(a) * (thickness-2));
    var rgb = this.state.rgb;
    
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
var LedWheel = React.createClass({
  // thickeness is calculated from radius as follows
  //    radius^2 = thickness/2 ^2  + (r1 + thickness)^2
  //    thickness/2  / r1  = tan(PI/24)
  // Solving
  //   r1 = thickness / (2*tan(PI/24))
  //   radius^2 = thickness^2 * (  (1/2)^2 + (1/(2*tan(PI/24) + 1)^2 )

  render: function() {
    var radius = this.props.radius == undefined ? 200 : parseInt(this.props.radius);
    var thickness = radius / Math.sqrt(0.25 + Math.pow(1 + (1/(2*Math.tan(Math.PI/24))), 2) );
    var r1 = thickness / (2 * Math.tan(Math.PI/24));
    var r2 = thickness / (2 * Math.tan(Math.PI/12));
    
    var leds = [];
    var circs = [{n:24, r: r1}, {n:12, r:r2}];
    for(var j = 0; j < 2; j++) {
      var n = circs[j].n;
      var r = circs[j].r;
      var r2 = r - thickness;
      for(var i = 0; i < n; i++) {
        var a1 = Math.PI * 2 * i / n;
        var x = radius + Math.round(Math.cos(a1)*r);
        var y = radius - Math.round(Math.sin(a1)*r);
        
        leds.push(<Led key={j+"_"+i} circleIndex={j} ledIndex={i} angle={a1} thickness={thickness-2} x={x} y={y}/>);
      }
    }
    return (<svg height={radius*2+2} width={radius*2+2}>{leds}</svg>);
  }  
})

//---------------------------------------------------------------------------------
var HueSquare = React.createClass({
  getInitialState: function() {
    return {hue:0}; // initial hue is 0, inicial color is red
  },

  render: function() {
    var n = this.props.n == undefined ? 8 : parseInt(this.props.n);
    var radius = this.props.radius == undefined ? 200 : parseInt(this.props.radius);
    var thickness = this.props.thickness == undefined ? 40 : parseInt(this.props.thickness);
  
    var radius2 = radius - thickness - thickness/2;
    var squareSize = 2 * radius2/Math.sqrt(2) - 2; // side of square that fits in inner circle 
    var smallSquareSize = squareSize/n;
    
    var colorSquares = [];
    var sat = 255;
    for(var j = 0; j < n; j++) {
      var val = 255;
      for(var i = 0; i < n; i++) {
        var hsv = {hue:this.state.hue, sat:sat, val:val};
        var rgb = hsv2rgb_rainbow(hsv);

        //console.log(hsv, rgb);
        colorSquares.push(<path
          key={"path" + j + "_" + i}
          d={
            "M" + (radius -squareSize/2 + squareSize*j/n) + "," + (radius - squareSize/2 + squareSize*i/n)) + " " +
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
  componentDidMount: function() {
    globalColorWheel = this;
  },
    
  getInitialState: function() {
    return {hueIndex:0, hue:0, rgb:{r:255,g:0,b:0}}; // initial hue is 0, inicial color is red
  },
  

  selectHue: function(i, hue, rgb) {
    this.setState({hueIndex:i, hue:hue, rgb:rgb});
    this.hueSquare.setState({hue:hue});
  },
  
  render: function() {
    var n = this.props.n == undefined ? 24 : parseInt(this.props.n);
    var radius = this.props.radius == undefined ? 200 : parseInt(this.props.radius);
    var thickness = this.props.thickness == undefined ? 40 : parseInt(this.props.thickness);
    // radus is the outer radius
    
    var radius2 = radius - thickness - thickness/2;
    var radius3 = radius - thickness/2;
    
    
    var colorSegments = [];
    for(var i = 0; i < n; i++) {
      var a1 = Math.PI * 2 * i / n;
      var a2 = Math.PI * 2 * (i+1)/n;
      var hue = Math.round(256 * i/n);
      var hsv = {hue:hue, sat:255, val:255};
      var rgb = hsv2rgb_rainbow(hsv);
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
    
    var self = this;
    return (<svg height={radius*2+2} width={radius*2+2}>
      <g>{colorSegments}</g>
      <HueSquare 
        ref={function(input) {self.hueSquare = input }}
        radius={this.props.radius} n={8} thickness={this.props.thickness} />
    </svg>);
  }
})

ReactDOM.render(
      <LedWheel radius={200}/>,
      document.getElementById('main')
)

ReactDOM.render(
      <ColorWheel radius={100} n={24} thickness={30}/>,
      document.getElementById('right')
)
