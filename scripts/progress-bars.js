// TODO Much refactoring!
// TODO Much refactoring!
// TODO Much refactoring!

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

  let currentScene
  const scenes = []
  // Example
  // [
  //    {
  //      title: "General",
  //      data: [
  //        { type: 'general', earned: 0, required: 0 },
  //      ]
  //    },
  // ]
  //
  // Example
  // [
  //    {
  //      title: "Radiology",
  //      data: [
  //        { type: 'general', earned: 0, required: 0 },
  //        { type: 'cat1a', earned: 0, required: 0 },
  //        { type: 'primary', earned: 0, required: 0, subs: [] },
  //      ],
  //    },
  //    {
  //      title: "Diagnostic Roentgenology",
  //      data: [
  //        { type: 'general', earned: 0, required: 0 },
  //        { type: 'cat1a', earned: 0, required: 0 },
  //        { type: 'primary', earned: 0, required: 0, subs: [] },
  //      ]
  //    },
  // ];
  
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
   * everything we'll need for the viz.
   *
   * @return void
   */
  function setupScenes(dataset) {

    if (dataset.primaries.length === 0) {

      const title = 'General'

      let donutData = makeDonutData('general', 
                                    title, 
                                    dataset.general.earned, 
                                    GENERAL_RECOMMENDATION);

      scenes.push({ title, data: [donutData] });

    } else {

      dataset.primaries.forEach(primary => {

        let scene = processPrimary(primary, 
                                   dataset.general.earned, 
                                   dataset.general.cat1aEarned)
        scenes.push({ title: primary.desc, data: scene });
      });
    }

    return; // not needed, but being explicit for the time being
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

  function setupDonut({ title, type: donutElemId, earned, required, subs }, 
                      insertInMiddle = false) {

    const creditsTogo = togo({ earned, required });

    // TODO improve
    let type
    if (donutElemId === 'cat1a') {
      type = 'Cat. 1-A'
    } else if (donutElemId === 'primary') {
      type = 'specialty'
    }

    const html = `
      <div class="col text-center p-4" style="">
        <div class="dbviz__container" id="${donutElemId}">
          ${subs ? '<h6 class="dbviz__title title-alt">Certification</h6><div id="subSelect"></div>': '<h6 class="dbviz__title">' + title + '</h6>'}
          <div class="dbviz">
            <h4 class="dbviz__count">
              <span class="head">0.0</span> <span class="tail">earned</span>
            </h4>
          </div>
          <div class="dbviz__tail">
            <div class="creditsTogo">
              <span class="head">${creditsTogo}</span> <span class="tail">${type ? type + ' ' : ''}credits to go</span>
            </div>
            <div class="required">
              <span class="head">${required}</span> required <i class="fa fa-question-circle" aria-hidden="true"></i>
            </div>
          </div>
        </div>
      </div> <!-- .col -->
    `

    if (! insertInMiddle) {
      $('#cme').append(html)
    } else {
      $(html).insertAfter('#cme > div:first-child')
    }
  
    if (subs) {
      const subSelectItems = [
        { value: title, text: title },
        ...subs.map(sub => {
          return {
            value: sub.title,
            text: sub.title,
          }
        })
      ];

      renderSubSelect(
        '#subSelect',
        'select-sub',
        handleSubSelectChange,
        //() => console.log('sub-select-change'),
        subSelectItems
      );
    }

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

    updateProgressBar({ earned, required }, foreground)
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
  function renderPrimarySelect(target, selectId, callback, options, selected) { 
//<div class="mb-4 specialty-select" style="text-align: center;">
  //<select class="form-control form-control-sm" id="select-primary">
    //<option value="Radiology">Radiology</option>
    //<option value="Diagnostic Roentgenology">Diagnostic Roentgenology</option>
  //</select>
//</div>

    const group = d3.select(target)
      .insert('div', ':first-child')
      .classed('form-group', true)

    group.append('label')
      .classed('mr-sm-2', true)
      .classed('text-secondary', true)
      .attr('style', 'transform: translateY(-50%); line-height: 1.1;')
      .text('Show progress for your');

    const select = group.append('select')
      .classed('custom-select', true)
      .classed('mb-4', true)
      .attr('id', selectId)
      .on('change', callback)

    select.selectAll('option')
      .data(options)
      .enter()
      .append('option')
        .attr('value', d => d.text)
        //.attr('selected', d => d.text === selected)
        .text(d => d.text)

    group.append('label')
      .classed('ml-sm-2 text-secondary', true)
      .attr('style', 'transform: translateY(-50%); line-height: 1.1;')
      .text('primary certification');
  }

  function renderSubSelect(target, selectId, callback, options) {

    // Remove any existing <select> element
    d3.select(target).select('select').remove();
    d3.select(target).text('');

    const select = d3.select(target)
      .classed('form-group', true)
      .append('select')
        .classed('form-control form-control-sm', true)
        .attr('id', selectId)
        .on('change', callback)

    select.selectAll('option')
      .data(options)
      .enter()
      .append('option')
        .attr('value', d => d.value)
        .text(d => d.text)

  }

  /**
   * @param d3.selection group
   * @param string labelText
   *
   */
  function addSelectLabel(group, labelText, extra) {
  }

  function setScene(scene) {
    scene.data.forEach(donut => {
      //setupDonut(donut.type, donut.title, donut.earned, donut.required)
      setupDonut(donut)
    })
  }

  /**
   * @param object data
   * @return
   */
//  function setupUi(data) {
//
//    const genTotal = data.general.earned;
//
//    // TODO we're just grabbing a temp value for now
//    const primary = data.primaries[0]
//
//    setupDonut('general', 'General', data.general.earned, GENERAL_RECOMMENDATION)
//
//    const donutTitle = hasSubs(primary) ? null : primary.desc
//    setupDonut('primary', donutTitle, primary.earned, primary.required)
//
//    if (! data.primaries) {
//  
//      // TODO ideal API?
//      //const general = new Progress(data.general.earned, GENERAL_RECOMMENDATION)
//      //general.render()
//
//    } else {
//
//      // render Primary select
//      renderSelect(
//        '.cme-select',
//        'select-primary',
//        handlePrimarySelectChange,
//        data.primaries.map(primary => {
//          return {
//            value: primary.desc,
//            text: primary.desc
//          }
//        })
//      )
//
//      // TODO
//      // render Subs select
//      if (hasSubs(primary)) {
//        const subSelectItems = 
//          [
//            { value: primary.desc, text: primary.desc }, 
//            ...primary.subs.map(sub => { 
//              return { 
//                value: sub.desc, 
//                text: sub.desc } 
//              }
//            )
//          ]
//
//        renderSelect(
//          '#primary',
//          'select-sub',
//          () => console.log('sub change'),
//          subSelectItems
//        )
//      }
//    }
//  }

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

  function init(data) {

    setupScenes(data)

    renderPrimarySelect(
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

    currentScene = scenes[0];

    setScene(currentScene)
    //updateUi(scenes[0])
    //renderScene(scenes[0])
    //setupUi(dataset)
  }

  /**
   * Determine if a scene has an item of a certain type
   * @param string type
   * @param object scene
   */
  function sceneHasType(type, scene) {
    return scene.data.filter(item => item.type === type).length > 0;
  }

  /**
   * Calculate credits needed to fulfill a requirement.
   *
   * @param object data - required properties: earned, required
   */
  function togo({ required, earned }) {
    return Math.max((required - earned), 0).toFixed(1);
  }

  function handlePrimarySelectChange() {

    const newScene = scenes.filter(scene => scene.title === d3.event.target.value)[0]
    if (!newScene) return;

    currentScene = newScene;

    const donutElemId = d3.event.target.id.split('-')[1];
    //const selector = `.dbviz__container#${donutElemId}`

    // TODO Refactor later. For now, we're working out this process step by step.

    // TODO
    // 1. Update general
    const general = newScene.data.filter(item => item.type === 'general')[0];
    if (general) {
      updateProgressBar(general, d3.select(`#general svg path.foreground`));
    }
    animateCount(general.earned, 
                 `#general .dbviz__count > .head`,
                 COUNT_ANIMATION_DURATION);
    const generalTogo = togo(general);
    $('#general .creditsTogo .head').text(generalTogo);
    $('#general .required .head').text(general.required);

    // 2. Add/remove/update cat1a
    const newSceneHasCat1a = sceneHasType('cat1a', newScene);
    const alreadyHaveCat1aElem = $('#cat1a').length > 0;
    if (newSceneHasCat1a && ! alreadyHaveCat1aElem) {
      const cat1a = newScene.data.filter(item => item.type === 'cat1a')[0]
      // fetch cat1a data and setup donut
      if (cat1a) {
        //setupDonut(cat1a.type, cat1a.title, cat1a.earned, cat1a.required, true)
        setupDonut(cat1a, true);
      }
    } else if (! newSceneHasCat1a && alreadyHaveCat1aElem) {
      $('#cat1a').parent().remove()
    }

    // TODO
    // 3. Update primary
    const primary = newScene.data.filter(item => item.type === 'primary')[0];

    $(`#primary .dbviz__title`)
      //.text(newScene.title)
      .text('Certification')
      .removeClass('title-alt')

    if (primary.subs.length > 0) {
      const subSelectItems = [
        { value: primary.title, text: primary.title },
        ...primary.subs.map(sub => {
          return {
            value: sub.title,
            text: sub.title,
          }
        })
      ];

      $(`#primary .dbviz__title`)
        .addClass('title-alt')

      renderSubSelect(
        '#subSelect',
        'select-sub',
        handleSubSelectChange,
        subSelectItems
      );
    } else {
      $('#subSelect > select').remove();
    }

    if (primary) {
      updateProgressBar(primary, d3.select(`#primary svg path.foreground`));
    }
    animateCount(primary.earned, 
                 `#primary .dbviz__count > .head`,
                 COUNT_ANIMATION_DURATION);
    $('#primary .creditsTogo .head').text(togo(primary));
    $('#primary .required .head').text(primary.required);


    
    //const data = scenes.filter(scene => scene.filterprimary.title === newPrimary)
    //console.dir(data);

//    if (!data || data.length === 0) {
//      throw new Error('Could not find that primary in the dataset')
//    }
//
//    const dataPrimary = data[0]
//
//    const donutElemId = d3.event.target.id.split('-')[1]
//    updateProgressBar(dataPrimary, d3.select(`#${donutElemId} svg path.foreground`))
//
//    // Update donut text
//    const selector = `.dbviz__container#${donutElemId}`
//    animateCount(dataPrimary.earned, 
//                 selector + ' .dbviz__count > .head', 
//                 COUNT_ANIMATION_DURATION)
//    $(selector + ' .dbviz__title').text(dataPrimary.desc)
//    const togo = Math.max((dataPrimary.required - dataPrimary.earned), 0).toFixed(1) 
//    $(selector + ' .togo .head').text(togo)
  }
  
  function handleSubSelectChange() {
    const primary = currentScene.data.filter(item => item.type === 'primary')[0];
    let newDonut = {}

    if (!primary) return;

    if (d3.event.target.value === primary.title) {
      newDonut = { earned: primary.earned, required: primary.required };
    } else {
      const data = primary.subs.filter(item => item.title === d3.event.target.value)[0];
      if (!data) return;
      newDonut = { earned: data.earned, required: data.required };
    }

    updateProgressBar(newDonut, d3.select(`#primary svg path.foreground`));

    animateCount(newDonut.earned, 
                 `#primary .dbviz__count > .head`,
                 COUNT_ANIMATION_DURATION);

    const specialtyTogo = togo(newDonut);
    $('#primary .creditsTogo .head').text(specialtyTogo);
    $('#primary .required .head').text(newDonut.required);
  }

  /**
   * @param object facet - required properties: earned, required
   * @return void
   */
  function updateProgressBar({ earned, required }, foreground) {
    
    // Reset donut to 0.0, so it always sweeps forward
    foreground
      .datum({endAngle: startAngle * tau})
      .attr('d', arc);

    foreground.transition()
      .duration(750)
      .ease(d3.easeQuadOut)
      .attrTween('d', arcTween((earned / required) * tau));
  }
  
  d3.json('./../data/wrangled-3.json', function(err, data) {

    if (err) throw (err)

    dataset = data;
    init(dataset);

  }); // end d3.json
  
//};
