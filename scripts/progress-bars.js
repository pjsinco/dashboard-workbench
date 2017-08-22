/**
 * @see http://bl.ocks.org/mbostock/5100636
 *
 */

window.onload = function() {

  const width = 300
  const height = 300

  let dataset
  
  const pieWidth = width
  const pieHeight = height
  const pieOuterRadius = pieWidth / 2
  const pieInnerRadius = (pieWidth / 2) - 20

  const svg = d3.select('#cme .dbviz')
                .append('svg')
                  .attr('width', width)
                  .attr('height', height)

  const g = svg.append('g')
                .attr('transform', 
                      'translate(' + width / 2+ ', ' + 
                       height / 2+ ')')
  
  const tau = Math.PI * 2;
  const startAngle = 0

  // Curried - it's ready to accept an object with an endAngle property
  // to compute the path of an arc
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

  // Start the foreground at 0
  const foreground = g.append('path')
    .datum({endAngle: startAngle * tau})
    .attr('fill', 'orange')
    .attr('d', arc)

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


  // Get 2 data values from a facet: earned, required.
  // These will be used to make the progress indicator
  function parseFacet(facet) {
    
  }

  /**
   * @param object data
   * @return
   */
  function updateUi(data) {
    const general = data.cme_facets.filter(item => item.type == "General")[0]
    const togo = (general.required - general.earned).toFixed(1)
    const decimalPlaces = 1
    const decimalFactor = Math.pow(10, decimalPlaces)


    //$('.dbviz__count').html(general.earned + '<span>credits</span>');
    $('.dbviz__tail .togo > .head').html(togo);
    $('.dbviz__tail .required').text(general.required + ' required');

    updateProgressBar(general)

    $('.dbviz__count > .head').animateNumber({ 
      number: general.earned * decimalFactor,
      numberStep: function(now, tween) {
        let floored_number = Math.floor(now) / decimalFactor,
            target = $(tween.elem);

        if (decimalPlaces > 0) {
          // force decimal places even if they are 0
          floored_number = floored_number.toFixed(decimalPlaces);
        }

        target.text(floored_number);
      }
    }, 700)
  }

  /**
   * TODO Not working
   *
   */
  function animateCount(maxCount, selector, duration) {

    let animationDuration = duration || 750;
    const delay = animationDuration / (maxCount * 10)
    let count = 0;
    $elem = $(selector);

    let interval = setInterval(function() {

      if (count > maxCount) {
        clearInterval(interval);
      }

      $elem.html(count.toFixed(1))
      count += 0.1
    }, delay)
  }

  /**
   * @param object facet - required properties: earned, required
   * @return void
   */
  function updateProgressBar(facet) {

    foreground.transition()
      .duration(750)
      //.ease(d3.easeQuadOut)
      //.ease(d3.easeLinear)
      .attrTween('d', arcTween((facet.earned / facet.required) * tau))
  }
  
  d3.json('./../data/cme-data-1.json', function(err, data) {

    dataset = data[4] 
    console.dir(dataset);

    updateUi(dataset)

  }); // end d3.json
  
};
