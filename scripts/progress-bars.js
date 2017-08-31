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
  let currentPrimary

  const scenes = []
//    [
//      { type: 'general', data: {earned: 0, required: 0} },
//      { type: 'cat1a', data: {earned: 0, required: 0} },
//      { type: 'primary', data: {earned: 0, required: 0}, subs: [] },
//    ],
//    [
//      { type: 'general', data: {earned: 0, required: 0} },
//      { type: 'cat1a', data: {earned: 0, required: 0} },
//      { type: 'primary', data: {earned: 0, required: 0}, subs: [] },
//    ],
  
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

  /**
   * Go through the dataset and set up all our scenes, which will container
   * everythign we'll need for the viz.
   *
   * @return void
   */
  function setupScenes(dataset) {

    if (dataset.primaries.length === 0) {
      let donutData = makeDonutData('general', 
                                    'General', 
                                    dataset.general.earned, 
                                    GENERAL_RECOMMENDATION);
      scenes.push([ donutData ]);

    } else {

      dataset.primaries.forEach(primary => {

        let scene = processPrimary(primary, 
                                   dataset.general.earned, 
                                   dataset.general.cat1aEarned)

        scenes.push(scene);

      });
    }
  }

  function processPrimary(primary, generalEarned = 0.0, cat1aEarned = 0.0) {

    const scene = []

    // General
    scene.push(makeDonutData('general',
                              'General', 
                              generalEarned,
                              primary.generalRequired));

    // Cat1A
    if (primary.cat1aRequired > 0) {
      scene.push(makeDonutData('cat1a',
                                'AOA Category 1-A', 
                                cat1aEarned,
                                primary.cat1aRequired));
    }

    const subs = primary.subs.map(sub => {
      return makeDonutData('sub', sub.desc, sub.earned, sub.required)
    });

    // Primary and subs
    scene.push(makeDonutData('primary',
                              primary.desc,
                              primary.earned,
                              primary.required,
                              subs ? subs: null));

    return scene;
  }

  function makeDonutData(type = '', title = '', earned = 0, required = 0, subs = null) {

    if (subs) {
      return { type, title, earned, required, subs }
    }

    return { type, title, earned, required }
  }

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

  function setupDonut(donutElemId, donutTitle, earned, required) {

    const togo = Math.max((required - earned), 0).toFixed(1) 

    const html = `
      <div class="col text-center p-4" style="">
        <div class="dbviz__container" id="${donutElemId}">
          ${donutTitle ? '<h6 class="dbviz__title">' + donutTitle + '</h6>': ''}
          <div class="dbviz">
            <h4 class="dbviz__count">
              <span class="head">0.0</span> <span class="tail">earned</span>
            </h4>
          </div>
          <div class="dbviz__tail">
            <div class="togo">
              <span class="head">${togo}</span> <span class="tail">credits to go</span>
            </div>
            <div class="required">
              ${required} required <i class="fa fa-question-circle" aria-hidden="true"></i>
            </div>
          </div>
        </div>
      </div> <!-- .col -->
    `

    $('#cme').append(html)

    const selector = `#cme #${donutElemId} .dbviz`

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
   * @param string target CSS selector of targeted element
   * @param string selectId The ID to apply to the select element
   * @param callback function Callback function to handle 'change' event
   * @param array options An array of { value, text } objects
   *
   * @return void
   *
   * TODO Do we need to use d3 for this? Maybe can use JS or JQuery instead
   */
  function renderSelect(target, selectId, callback, options) {


//<div class="mb-4 specialty-select" style="text-align: center;">
  //<select class="form-control form-control-sm" id="select-primary">
    //<option value="Radiology">Radiology</option>
    //<option value="Diagnostic Roentgenology">Diagnostic Roentgenology</option>
  //</select>
//</div>

    const select = d3.select(target)
      .insert('select', ':first-child')
      .classed('custom-select', true)
      .classed('mb-4', true)
      .attr('id', selectId)
      .on('change', callback)

    select.selectAll('option')
      .data(options)
      .enter()
      .append('option')
        .attr('value', d => d.text)
        .text(d => d.text)
  }

  function hasSubs(primary) {
    return primary.subs.length > 0
  }

  function updateUi(data) {

  }

  function setScene(scene) {
    scene.forEach(item => {
      setupDonut(item.type, item.title, item.earned, item.required)
    })
  }

  /**
   * @param object data
   * @return
   */
  function setupUi(data) {

    const genTotal = data.general.earned;

    // TODO we're just grabbing a temp value for now
    const primary = data.primaries[0]

    setupDonut('general', 'General', data.general.earned, GENERAL_RECOMMENDATION)

    const donutTitle = hasSubs(primary) ? null : primary.desc
    setupDonut('primary', donutTitle, primary.earned, primary.required)

    if (! data.primaries) {
  
      // TODO ideal API?
      //const general = new Progress(data.general.earned, GENERAL_RECOMMENDATION)
      //general.render()

    } else {

      // render Primary select
      renderSelect(
        '.cme-select',
        'select-primary',
        handlePrimarySelectChange,
        data.primaries.map(primary => {
          return {
            value: primary.desc,
            text: primary.desc
          }
        })
      )

      // TODO
      // render Subs select
      if (hasSubs(primary)) {
        const subSelectItems = 
          [
            { value: primary.desc, text: primary.desc }, 
            ...primary.subs.map(sub => { 
              return { 
                value: sub.desc, 
                text: sub.desc } 
              }
            )
          ]

        renderSelect(
          '#primary',
          'select-sub',
          () => console.log('sub change'),
          subSelectItems
        )
      }
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
console.dir(dataset);

    setupScenes(dataset)
    setScene(scenes[0])

console.dir(scenes);

    //updateUi(scenes[0])

    //renderScene(scenes[0])

    //setupUi(dataset)


  }

  function handlePrimarySelectChange() {

    const newPrimary = d3.event.target.value;
    const data = dataset.primaries.filter(primary => primary.desc === newPrimary)

    if (!data || data.length === 0) {
      throw new Error('Could not find that primary in the dataset')
    }

    const dataPrimary = data[0]

    const donutElemId = d3.event.target.id.split('-')[1]
    updateProgressBar(dataPrimary, d3.select(`#${donutElemId} svg path.foreground`))

    // Update donut text
    const selector = `.dbviz__container#${donutElemId}`
    animateCount(dataPrimary.earned, 
                 selector + ' .dbviz__count > .head', 
                 COUNT_ANIMATION_DURATION)
    $(selector + ' .dbviz__title').text(dataPrimary.desc)
    const togo = Math.max((dataPrimary.required - dataPrimary.earned), 0).toFixed(1) 
    $(selector + ' .togo .head').text(togo)
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
  
  d3.json('./../data/wrangled-2.json', function(err, data) {

    if (err) throw (err)

    dataset = data;
    init(dataset);

  }); // end d3.json
  
//};
