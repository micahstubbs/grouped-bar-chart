// https://github.com/micahstubbs/grouped-bar-chart#readme Version 0.1.3. Copyright 2016 undefined.
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3'), require('lodash')) :
  typeof define === 'function' && define.amd ? define(['exports', 'd3', 'lodash'], factory) :
  (factory((global.d3 = global.d3 || {}),global.d3,global._));
}(this, function (exports,d3,_) { 'use strict';

  d3 = 'default' in d3 ? d3['default'] : d3;
  _ = 'default' in _ ? _['default'] : _;

  function plot (selector, inputData, options) {
    // set default configuration
    var cfg = {
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
      for (var i in options) {
        if (typeof options[i] !== 'undefined') {
          cfg[i] = options[i];
        }
      }
    }

    var margin = cfg.margin;
    var width = cfg.baseWidth - margin.left - margin.right;
    var height = cfg.baseHeight - margin.top - margin.bottom;
    var groupByVariable = cfg.groupByVariable;
    var barColors = cfg.barColors;

    // console.log(`width ${width} height ${height}`);

    var x0 = d3.scale.ordinal().rangeRoundBands([0, width], 0.1);

    var x1 = d3.scale.ordinal();

    var y = d3.scale.linear().range([height, 0]);

    var color = d3.scale.ordinal().range(barColors);

    var svg = d3.select(selector).append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom).append('g').attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

    var data = _.cloneDeep(inputData);
    var labels = d3.keys(data[0]).filter(function (key) {
      return key !== groupByVariable;
    });

    data.forEach(function (d) {
      d.seriesValues = labels.map(function (category) {
        return {
          category: category,
          value: +d[category]
        };
      });
    });

    x0.domain(data.map(function (d) {
      return d[groupByVariable];
    }));
    x1.domain(labels).rangeRoundBands([0, x0.rangeBand()]);
    y.domain([0, d3.max(data, function (d) {
      return d3.max(d.seriesValues, function (e) {
        return e.value;
      });
    })]);

    // console.log('x0.domain()', x0.domain());
    // console.log('x1.domain()', x1.domain());
    // console.log('y.domain()', y.domain());
    // console.log('data', data);

    var label = svg.selectAll('.label').data(data).enter().append('g').attr('class', 'label').attr('transform', function (d) {
      return 'translate(' + x0(d[groupByVariable]) + ', 0)';
    });

    label.selectAll('rect').data(function (d) {
      return d.seriesValues;
    }).enter().append('rect').attr('width', x1.rangeBand()).attr('x', function (d) {
      return x1(d.category);
    }).attr('y', function (d) {
      return y(d.value);
    }).attr('height', function (d) {
      return height - y(d.value);
    }).style('fill', function (d) {
      return color(d.category);
    });
  }

  exports.plot = plot;

  Object.defineProperty(exports, '__esModule', { value: true });

}));