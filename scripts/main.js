
var ColorWheel = React.createClass({
  render: function() {
    var n = this.props.n == undefined ? 24 : parseInt(this.props.n);
    var radius = this.props.radius == undefined ? 200 : parseInt(this.props.radius);
    var thickness = this.props.thickness == undefined ? 40 : parseInt(this.props.thickness);
    // radus is the outer radius
    
    var radius2 = radius - thickness;
    var colorDots = [];
    for(var i = 0; i < n; i++) {
      var a1 = Math.PI * 2 * i / n;
      var a2 = Math.PI * 2 * (i+1)/n;
      var hsv = {hue:Math.round(256 * i/n), sat:255, val:255};
      var rgb = hsv2rgb_rainbow(hsv);
      console.log(hsv, rgb);
      colorDots.push(<path
        key={"path" + i}
        d={
          "M" + (radius + Math.round(Math.cos(a1) * radius)) + "," + (radius - Math.round(Math.sin(a1) * radius)) + " " +
          "A" + radius + "," + radius + " 0 0,0 " + (radius + Math.round(Math.cos(a2) * radius)) + "," + (radius - Math.round(Math.sin(a2) * radius)) + " " +
          "L" + (radius + Math.round(Math.cos(a2) * radius2)) + "," + (radius - Math.round(Math.sin(a2) * radius2)) + " " +
          "A" + radius2 + "," + radius2 + " 0 0,1 " + (radius + Math.round(Math.cos(a1) * radius2)) + "," + (radius - Math.round(Math.sin(a1) * radius2)) + " " +
          "Z"  
        }
        fill={"rgb(" + rgb.r + "," + rgb.g + "," +  rgb.b + ")"}
        stroke = "black"
      />);
    }
    return (<svg height={radius*2+2} width={radius*2+2}>{colorDots}</svg>);
  }
})

ReactDOM.render(
      <ColorWheel radius="200" n="24" thickness="40"/>,
      document.getElementById('example')
)
