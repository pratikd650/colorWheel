
//---------------------------------------------------------------------------------
var LedWheel = React.createClass({
  render: function() {
    var radius = this.props.radius == undefined ? 200 : parseInt(this.props.radius);
    var thickness = 2 * Math.sin(Math.PI / 24);
    var colorSquares = [];
    var circs = [{n:24, r: radius}, {n:12, r:radius/2}];
    for(var j = 0; j < 2; j++) {
      var n = circs[j].n;
      var r = circs[j].r;
      var r2 = r - thickness;
      for(var i = 0; i < n; i++) {
        var a1 = Math.PI * 2 * i / n;
        var a2 = Math.PI * 2 * (i+1)/n;
  
        colorSquares.push(<path
          key={"led" + j + "-" + i}
          id={"led" + j + "-" + i}
          d={
            "M" + (radius + Math.round(Math.cos(a1) * r)) + "," + (radius - Math.round(Math.sin(a1) * r)) + " " +
            "L" + (radius + Math.round(Math.cos(a2) * r)) + "," + (radius - Math.round(Math.sin(a2) * r)) + " " +
            "L" + (radius + Math.round(Math.cos(a2) * r2)) + "," + (radius - Math.round(Math.sin(a2) * r2)) + " " +
            "L" + (radius + Math.round(Math.cos(a1) * r2)) + "," + (radius - Math.round(Math.sin(a1) * r2)) + " " +
            "Z"  
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
    console.log(id);
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
