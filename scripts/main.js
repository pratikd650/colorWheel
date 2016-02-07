// thickeness is calculated from radius as follows
//    radius^2 = thickness/2 ^2  + (x + thickness)^2
//    thickness/2  / x  = tan(PI/24)
// Solving
//   radius^2 = thickness^2 (  1/4   +  (1+1/(2*tan(PI/24)))^2  )

//---------------------------------------------------------------------------------
var LedWheel = React.createClass({
  render: function() {
    var radius = this.props.radius == undefined ? 200 : parseInt(this.props.radius);
    var thickness = radius / Math.sqrt(0.25 + (1 + 1/(2*Math.tan(Math.PI/24)))^2 );
    var r1 = thickness / (2 * Math.tan(Math.PI/24));
    var r2 = thickness / (2 * Math.tan(Math.PI/12));
    
    console.log("thickness = " + thickness);
    var colorSquares = [];
    var circs = [{n:24, r: r1}, {n:12, r:r2}];
    for(var j = 0; j < 2; j++) {
      var n = circs[j].n;
      var r = circs[j].r;
      var r2 = r - thickness;
      for(var i = 0; i < n; i++) {
        var a1 = Math.PI * 2 * i / n;
        var x = radius + Math.round(Math.cos(a1)*r);
        var y = radius - Math.round(Math.sin(a1)*r);
        var dx = Math.round(Math.cos(a1) * thickness);
        var dy = Math.round(Math.sin(a1) * thickness);
        
        colorSquares.push(<path
          key={"led" + j + "-" + i}
          id={"led" + j + "-" + i}
          d={
            "M" + x + "," + y + " " +
            "l" + (+dy/2) + "," + (-dx/2) + " " +
            "l" + dx + "," + dy + " " + 
            "l" + (-dy) + "," + dx + " " +
            "l" + (-dx) + "," + (-dy) + " " +
            "z"
          }
          fill="red"
          stroke = "black" 
      />);
      }
    }
    return (<svg height={radius*2+2} width={radius*2+2}>{colorSquares}</svg>);
  }  
})

//---------------------------------------------------------------------------------
var ColorWheel = React.createClass({
  getInitialState: function() {
    return { selectedHue:0 };  
  },
  

  selectHue: function(event) {
    var id = parseInt(event.target.id.substr(4));
    this.setState({selectedHue:id});
  },
  
  render: function() {
    var n = this.props.n == undefined ? 24 : parseInt(this.props.n);
    var radius = this.props.radius == undefined ? 200 : parseInt(this.props.radius);
    var thickness = this.props.thickness == undefined ? 40 : parseInt(this.props.thickness);
    // radus is the outer radius
    
    var radius2 = radius - thickness - thickness/2;
    var radius3 = radius - thickness/2;
    var colorDots = [];
    for(var i = 0; i < n; i++) {
      var a1 = Math.PI * 2 * i / n;
      var a2 = Math.PI * 2 * (i+1)/n;
      var hsv = {hue:Math.round(256 * i/n), sat:255, val:255};
      var rgb = hsv2rgb_rainbow(hsv);
      var r = this.state.selectedHue == i ? radius : radius3;
      
      //console.log(hsv, rgb);
      colorDots.push(<path
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
        strokeWidth = {this.state.selectedHue == i ? "1.5" : "1"}
        onClick = {this.selectHue}
      />);
    }
    return (<svg height={radius*2+2} width={radius*2+2}>{colorDots}</svg>);
  }
})

ReactDOM.render(
      <LedWheel radius="200"/>,
      document.getElementById('main')
)

ReactDOM.render(
      <ColorWheel radius="100" n="24" thickness="30"/>,
      document.getElementById('right')
)
