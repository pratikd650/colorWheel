

var ColorWheel = React.createClass({
  render: function() {
    var n = 24;
    var radius = 200, thickness = 40; // outer radius, thickness of ring
    var radius2 = radius - thickness;
    var colorDots = [];
    for(var i = 0; i < n; i++) {
      var a1 = Math.PI * 2 * i / n;
      var a2 = Math.PI * 2 * (i+1)/n;
      colorDots.push(<path
        d={
          "M" + (radius + Math.round(Math.cos(a1) * radius)) + "," + (radius - Math.round(Math.sin(a1) * radius)) + " " +
          "A" + radius + "," + radius + " 0 0,0 " + (radius + Math.round(Math.cos(a2) * radius)) + "," + (radius - Math.round(Math.sin(a2) * radius)) + " " +
          "L" + (radius + Math.round(Math.cos(a2) * radius2)) + "," + (radius - Math.round(Math.sin(a2) * radius2)) + " " +
          "A" + radius2 + "," + radius2 + " 0 0,1 " + (radius + Math.round(Math.cos(a1) * radius2)) + "," + (radius - Math.round(Math.sin(a1) * radius2)) + " " +
          "Z"  
        }
        fill={i%2 == 0 ? "red" : "blue" }
        stroke = "black"
      >);
    }
    return (
      <svg height={radius*2+2} width={radius*2+2}>{colorDots}</svg>
    );
  }
})
