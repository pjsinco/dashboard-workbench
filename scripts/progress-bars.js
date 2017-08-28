/**
 * @see http://bl.ocks.org/mbostock/5100636
 *
 */

window.onload = function() {

  const GENERAL_RECOMMENDATION = 120.0

  const decimalPlaces = 1
  const decimalFactor = Math.pow(10, decimalPlaces)

  const width = 300
  const height = 300

  let dataset
  
  const pieWidth = width
  const pieHeight = height
  const pieOuterRadius = pieWidth / 2
  const pieInnerRadius = (pieWidth / 2) - 20
  const tau = Math.PI * 2;
  const startAngle = 0

  //const donuts = []

//  const svgGeneral = d3.select('#cme #general .dbviz')
//    .append('svg')
//      .attr('width', width)
//      .attr('height', height)
//
//  const gGeneral = svgGeneral.append('g')
//    .attr('transform', 
//          'translate(' + width / 2+ ', ' + 
//           height / 2+ ')')
//  
  const svgPrimary = d3.select('#cme #primary .dbviz')
    .append('svg')
      .attr('width', width)
      .attr('height', height)

  const gPrimary = svgPrimary.append('g')
    .attr('transform', 
          'translate(' + width / 2+ ', ' + 
           height / 2+ ')')


  // Curried - it's ready to accept an object with an endAngle property
  // to compute the path of an arc
  const arc = d3.arc()
    .innerRadius(pieInnerRadius)
    .outerRadius(pieOuterRadius)
    .cornerRadius(10)
    .startAngle(0)

  // Add the background arc, from 0 to 100% (tau)
  //const backgroundGeneral = gGeneral.append('path')
    //.datum({endAngle: tau})
    //.attr('fill', '#d0d0d0')
    //.attr('d', arc)

  const backgroundPrimary = gPrimary.append('path')
    .datum({endAngle: tau})
    .attr('fill', '#d0d0d0')
    .attr('d', arc)

  // Start the foreground at 0
  //const foregroundGeneral = gGeneral.append('path')
    //.datum({endAngle: startAngle * tau})
    //.attr('fill', 'orange')
    //.attr('d', arc)

  const foregroundPrimary = gPrimary.append('path')
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

  function updateDonut(donutId, data) {

  }

  function setupDonut(donutId, donutDesc, earned, required) {

    const togo = Math.max((required - earned), 0).toFixed(1) 

    const html = `
      <div class="col text-center p-4" style="">
        <div class="dbviz__container" id="${donutId}">
          <h6 class="dbviz__title">${donutDesc}</h6>
          <div class="dbviz">
            <h4 class="dbviz__count">
              <span class="head">0.0</span> <span class="tail">earned</span>
            </h4>
          </div>
          <div class="dbviz__tail">
            <div class="togo">
              <span class="head">${togo}</span> <span class="tail">credits to go</span>
            </div>
            <div class="required">${required} required</div>
          </div>
        </div>
      </div> <!-- .col -->
    `

    $('#cme').append(html)

    const selector = `#cme #${donutId} .dbviz`

    const svg = d3.select(selector)
      .append('svg')
        .attr('width', width)
        .attr('height', height)

    const g = svg.append('g')
      .attr('transform', 
            'translate(' + width / 2+ ', ' + 
             height / 2+ ')')
  
    const background = g.append('path')
      .datum({endAngle: tau})
      .attr('fill', '#d0d0d0')
      .attr('d', arc)

    const foreground = g.append('path')
      .datum({endAngle: startAngle * tau})
      .attr('fill', 'orange')
      .attr('d', arc)

    updateProgressBar({ type: 'General', earned, required }, foreground)

    $(`#${donutId}`).find('.dbviz__count > .head').animateNumber({ 
      number: earned * decimalFactor,
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
   * @param target string CSS selector of targeted element
   * @param callback function Callback function to handle 'change' event
   * @param array options An array of { value, text } objects
   *
   * @return void
   *
   * TODO Do we need to use d3 for this? Maybe can use JS or JQuery instead
   */
  function renderSelect(target, callback, options) {

    const select = d3.select(target)
      .append('select')
      .attr('id', 'primaries')
      .classed('custom-select', true)
      .on('change', callback)

    select.selectAll('option')
      .data(options)
      .enter()
      .append('option')
        .attr('value', d => d.value)
        .text(d => d.text)
  }
  

  /**
   * @param object data
   * @return
   */
  function setupUi(data) {

    //const genTotal = data.cme_facets.filter(item => item.type == "General")[0]
    const genTotal = data.general.earned;

    setupDonut('general', 'Total', data.general.earned, GENERAL_RECOMMENDATION)

    if (! data.primaries) {
  
      // TODO ideal API
      //const general = new Progress(data.general.earned, GENERAL_RECOMMENDATION)
      //general.render()

    } else {
               //<!--<option value="primary-1">Radiology</option>-->
               //<!--<option value="primary-2">Diagnostic Roentgenology</option>-->

      // render Primary select
      renderSelect(
        '.cme-select',
        () => { console.log('changed'); },
        [ { value: "primary-1", text: "Radiology" },
          { value: "primary-2", text: "Diagnostic Roentgenology" }, ]
      )

      // render Subs select
      

    }



//    const primaries = data
//
//    let togo = Math.max((genTotal.required - genTotal.earned), 0).toFixed(1) 
//
//    const decimalPlaces = 1
//    const decimalFactor = Math.pow(10, decimalPlaces)
//
//    //$('.dbviz__count').html(genTotal.earned + '<span>credits</span>');
//    $('#general').find('.dbviz__title').text('Total');
//    $('#general').find('.dbviz__tail .togo > .head').html(togo);
//    $('#general').find('.dbviz__tail .required').text(genTotal.required + ' required');
//
//    updateProgressBar(genTotal)
//
//    $('#general').find('.dbviz__count > .head').animateNumber({ 
//      number: genTotal.earned * decimalFactor,
//      numberStep: function(now, tween) {
//        let floored_number = Math.floor(now) / decimalFactor,
//            target = $(tween.elem);
//
//        if (decimalPlaces > 0) {
//          // force decimal places even if they are 0
//          floored_number = floored_number.toFixed(decimalPlaces);
//        }
//
//        target.text(floored_number);
//      }
//    }, 700)
//
//    const pri = data.cme_facets.filter(item => item.type == 'Primary')
//    const primaries = [pri[0]]
//
//    primaries.forEach(primary => {
//      togo = Math.max((primary.required - primary.earned), 0).toFixed(1) 
//
//      $('#primary').find('.dbviz__title').text(primary.desc);
//      $('#primary').find('.dbviz__tail .togo > .head').html(togo);
//      $('#primary').find('.dbviz__tail .required').text(primary.required + ' required');
//
//      updateProgressBar(primary)
//
//      $('#primary').find('.dbviz__count > .head').animateNumber({ 
//        number: primary.earned * decimalFactor,
//        numberStep: function(now, tween) {
//          let floored_number = Math.floor(now) / decimalFactor,
//              target = $(tween.elem);
//
//          if (decimalPlaces > 0) {
//            // force decimal places even if they are 0
//            floored_number = floored_number.toFixed(decimalPlaces);
//          }
//
//          target.text(floored_number);
//        }
//      }, 700)
//
//    })
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

  function init() {

  }

  /**
   * @param object facet - required properties: earned, required
   * @return void
   */
  function updateProgressBar(facet, foreground) {

    if (facet.type === 'General') {
      foreground.transition()
        .duration(750)
        //.ease(d3.easeQuadOut)
        //.ease(d3.easeLinear)
        .attrTween('d', arcTween((facet.earned / facet.required) * tau))
    } else if (facet.type === 'Primary') {
      foregroundPrimary.transition()
        .duration(750)
        //.ease(d3.easeQuadOut)
        //.ease(d3.easeLinear)
        .attrTween('d', arcTween((facet.earned / facet.required) * tau))
    }


    

  }
  
  d3.json('./../data/wrangled-1.json', function(err, data) {

    if (err) throw (err)

    dataset = data;
    init();

    console.dir(dataset);
    setupUi(dataset)

  }); // end d3.json
  
};
