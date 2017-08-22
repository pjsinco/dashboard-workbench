/**
 * @see http://bl.ocks.org/mbostock/5100636
 *
 */

window.onload = function() {

  const width = 300
  const height = 300
  
  const pieWidth = width
  const pieHeight = height
  const pieOuterRadius = pieWidth / 2
  const pieInnerRadius = (pieWidth / 2) - 20

  const svg = d3.select('#svg')
                .append('svg')
                  .attr('width', width)
                  .attr('height', height)

  const g = svg.append('g')
                .attr('transform', 
                      'translate(' + width / 2+ ', ' + 
                       height / 2+ ')')
  
  const tau = Math.PI * 2;

  const arc = d3.arc()
    .innerRadius(pieInnerRadius)
    .outerRadius(pieOuterRadius)
    .cornerRadius(10)
    .startAngle(0)

  // Add the background arc, from 0 to 100% (tau)
  const background = g.append('path')
    .datum({endAngle: tau})
    .attr('fill', '#d0d0d0')
    .attr('d', arc)

  // Add the foreground in orange, currently 12%
  const foreground = g.append('path')
    .datum({endAngle: .37 * tau})
    .attr('fill', 'orange')
    .attr('d', arc)

  // Every so often, start a transition to a new random angle.
  d3.interval(function() {
    foreground.transition()
      .duration(750)
      .attrTween('d', arcTween(Math.random() * tau))
  }, 1500)

  // Returns the tween for a transition's "d" attribute, transitioning any 
  // selected arcs from their current angle to the specified new angle
  function arcTween(newAngle) {
    return function(d) {
      const interpolate = d3.interpolate(d.endAngle, newAngle)
      return function(t) {
        d.endAngle = interpolate(t);
        return arc(d);
      }
    }
  }

  
  
};
