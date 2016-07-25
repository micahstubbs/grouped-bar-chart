
import d3 from 'd3';
import _ from 'lodash';

export default function (selector, inputData, options) {
  // set default configuration
  const cfg = {
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    baseWidth: 200,
    baseHeight: 100,
    groupByVariable: 'name',
    // http://colorbrewer2.org/?type=qualitative&scheme=Set3&n=7
    barColors: ['#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69']
  };

  // console.log('options passed in', options);

  // Put all of the options into a the cfg object
  // overwrite the default value where an option is specified
  if (typeof options !== 'undefined') {
    for (const i in options) {
      if (typeof options[i] !== 'undefined') { cfg[i] = options[i]; }
    }
  }

  const margin = cfg.margin;
  // const width = cfg.baseWidth - margin.left - margin.right;
  // const height = cfg.baseHeight - margin.top - margin.bottom;
  const groupByVariable = cfg.groupByVariable;
  const barColors = cfg.barColors;

  // use these dimensions for the parent SVG
  const innerWidth = cfg.baseWidth;
  const innerHeight = cfg.baseHeight;

  let svgWidth;
  if (String(innerWidth).indexOf('%') > -1) {
    svgWidth = innerWidth;
  }
  else {
    svgWidth = innerWidth + margin.left + margin.right
  }

  let svgHeight;
  if (String(innerHeight).indexOf('%') > -1) {
    svgHeight = innerHeight;
  }
  else {
    svgHeight = innerHeight + margin.top + margin.bottom
  }

  const svg = d3.select(selector).append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight)
    .attr('viewBox', '0 0 100 100')
    .attr('preserveAspectRatio', 'none')
    .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

  // use these dimensions for everything else
  // and know that they will be SVG-scaled
  // since we set the viewBox attribute
  const width = 100;
  const height = 100;

  // console.log(`width ${width} height ${height}`);

  const x0 = d3.scale.ordinal()
    .rangeRoundBands([0, width], 0.1);

  const x1 = d3.scale.ordinal();

  const y = d3.scale.linear()
    .range([height, 0]);

  const color = d3.scale.ordinal()
    .range(barColors);

  let data = _.cloneDeep(inputData);
  const labels = d3.keys(data[0]).filter(key => key !== groupByVariable);

  data.forEach(d => {
    d.seriesValues = labels.map(category => ({
      category,
      value: +d[category]
    }));
  });

  x0.domain(data.map(d => d[groupByVariable]));
  x1.domain(labels).rangeRoundBands([0, x0.rangeBand()]);
  y.domain([0, d3.max(data, d => d3.max(d.seriesValues, e => e.value))]);

  // console.log('x0.domain()', x0.domain());
  // console.log('x1.domain()', x1.domain());
  // console.log('y.domain()', y.domain());
  // console.log('data', data);

  const label = svg.selectAll('.label')
    .data(data)
    .enter().append('g')
      .attr('class', 'label')
      .attr('transform', d => `translate(${x0(d[groupByVariable])}, 0)`);

  label.selectAll('rect')
    .data(d => d.seriesValues)
    .enter().append('rect')
      .attr('width', x1.rangeBand())
      .attr('x', d => x1(d.category))
      .attr('y', d => y(d.value))
      .attr('height', d => height - y(d.value))
      .style('fill', d => color(d.category));
}
