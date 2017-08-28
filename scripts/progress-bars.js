/**
 * @see http://bl.ocks.org/mbostock/5100636
 *
 */

//window.onload = function() {

  const GENERAL_RECOMMENDATION = 120.0
  const COUNT_ANIMATION_DURATION = 700

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

  // Curried - it's ready to accept an object with an endAngle property
  // to compute the path of an arc
  const arc = d3.arc()
    .innerRadius(pieInnerRadius)
    .outerRadius(pieOuterRadius)
    .cornerRadius(10)
    .startAngle(0)

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
      .classed('background', true)
      .datum({endAngle: tau})
      .attr('fill', '#d0d0d0')
      .attr('d', arc)

    const foreground = g.append('path')
      .classed('foreground', true)
      .datum({endAngle: startAngle * tau})
      .attr('fill', 'orange')
      .attr('d', arc)

    updateProgressBar({ type: 'General', earned, required }, foreground)

    const countSelector = `${selector} .dbviz__count > .head`
    animateCount(earned, countSelector, COUNT_ANIMATION_DURATION)
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
      .classed('custom-select', true)
      .attr('id', 'select-primary')
      .on('change', callback)

    select.selectAll('option')
      .data(options)
      .enter()
      .append('option')
        .attr('value', d => d.text)
        .text(d => d.text)
  }
  

  /**
   * @param object data
   * @return
   */
  function setupUi(data) {
    //const genTotal = data.cme_facets.filter(item => item.type == "General")[0]
    const genTotal = data.general.earned;

    // TODO we're just grabbing a temp value for now
    const primary = data.primaries[0]

    setupDonut('general', 'Total', data.general.earned, GENERAL_RECOMMENDATION)
    setupDonut('primary', primary.desc, primary.earned, primary.required)
  

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
        handlePrimarySelectChange,
        data.primaries.map(primary => {
          return {
            value: primary.desc,
            text: primary.desc
          }
        })
      )

      // render Subs select

    }
  }

  function animateCount(maxCount, selector, duration) {

    $(selector).animateNumber({ 
      number: maxCount * decimalFactor,
      numberStep: function(now, tween) {
        let floored_number = Math.floor(now) / decimalFactor,
            target = $(tween.elem);

        if (decimalPlaces > 0) {
          // force decimal places even if they are 0
          floored_number = floored_number.toFixed(decimalPlaces);
        }

        target.text(floored_number);
      }
    }, duration)
  }

  function init() {

  }

  function handlePrimarySelectChange() {

    const newPrimary = d3.event.target.value;
    const data = dataset.primaries.filter(primary => primary.desc === newPrimary)

    if (!data || data.length === 0) {
      throw new Error('Could not find that primary in the dataset')
    }

    const dataPrimary = data[0]

    const donutId = d3.event.target.id.split('-')[1]
    updateProgressBar(dataPrimary, d3.select(`#${donutId} svg path.foreground`))

    const selector = `.dbviz__container#${donutId}`
    animateCount(dataPrimary.earned, 
                 selector + ' .dbviz__count > .head', 
                 COUNT_ANIMATION_DURATION)

    $(selector + ' .dbviz__title').text(dataPrimary.desc)
    
  }

  /**
   * @param object facet - required properties: earned, required
   * @return void
   */
  function updateProgressBar(data, foreground) {
    foreground.transition()
      .duration(750)
      .ease(d3.easeQuadOut)
      .attrTween('d', arcTween((data.earned / data.required) * tau))
  }
  
  d3.json('./../data/wrangled-1.json', function(err, data) {

    if (err) throw (err)

    dataset = data;
    init();

    console.dir(dataset);
    setupUi(dataset)

  }); // end d3.json
  
//};
