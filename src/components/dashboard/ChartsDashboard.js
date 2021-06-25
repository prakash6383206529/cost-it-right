// graph 1 dashboard 
const color1 = "#3E88CB";
const color2 = "#73B0F4";
const color3 = "#76E2C5";
const color4 = "#F199CE";
const color5 = "#256BD1";

export const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        boxWidth: '20',
      },
    },
  };

export const data1 = {
    labels: ['1', '2', '3', '4', '5', '6'],
    datasets: [
      {
        label: 'RM',
        data: [2, 4, 7, 3, 5, 2, 8, 4],
        fill: false,
        borderColor: color1,
        backgroundColor:color1,
      },
      {
        label: 'CC',
        data: [5, 7, 10, 6, 8, 5, 11, 7],
        fill: false,
        borderColor: color2,
        backgroundColor:color2,
      },
      {
        label: 'VA',
        data: [9, 11, 14, 10, 12, 9, 15, 12],
        fill: false,
        borderColor: color3,
        backgroundColor:color3,
      },
      {
        label: 'Others',
        data: [14, 16, 20, 15, 18, 17, 21, 24],
        fill: false,
        borderColor: color4,
        backgroundColor:color4,
      }
    ],
  };

export const chart1 = {
    credits: {
        enabled: false
   },
    title: {
      text: ''
    },
    series: [{
        name: 'Rm',
        data: [2, 4, 7, 3, 5, 2, 8, 4],
        color:color1
    }, {
        name: 'CC',
        data: [5, 7, 10, 6, 8, 5, 11, 7],
        color:color2
    }, {
        name: 'VA',
        data: [9, 11, 14, 10, 12, 9, 15, 12],
        color:color3
    }, {
        name: 'Others',
        data: [14, 16, 20, 15, 18, 17, 21, 24],
        color:color4
    }],
  }
  // graph 1 dashboard end

  // graph 2 dashboard 
export const chart2 = {
    credits: {
        enabled: false
    },
    chart: {
        type: 'bar'
    },
    title: {
        text: ''
    },
    xAxis: {
        categories: ['']
    },
    yAxis: {
        min: 0,
    },
    legend: {
        reversed: true
    },
    series: [{
        name: 'Plant5',
        data: [10],
        color:color1
    }, {
        name: 'Plant4',
        data: [33],
        color:color2
    }, {
        name: 'Plant3',
        data: [54],
        color:color3
    }, {
        name: 'Plant2',
        data: [76],
        color:color4
    }, {
      name: 'Plant1',
      data: [96],
      color:color5
    }]
  }
  // graph 2 dashboard end

  // graph 3 dashboard 
export const chart3 = {
    credits: {
        enabled: false
    },
    title: {
        text: '',
    },
    tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
    },
    accessibility: {
        point: {
            valueSuffix: '%'
        }
    },
    colors: [color1,color2,color3,color4,color5],
    plotOptions: {
        pie: {
            dataLabels: {
                enabled: false,
                distance: -10,
                style: {
                    fontWeight: 'bold',
                    color: 'white'
                }
            },
            startAngle: 0,
            endAngle: 360,
            center: ['50%', '50%'],
            size: '100%',
            showInLegend: true
        }
    },
    series: [{
        type: 'pie',
        name: 'Browser share',
        innerSize: '50%',
        data: [
            ['Vendor1', 15],
            ['Vendor2', 35],
            ['Vendor3', 16],
            ['Vendor4', 34],
        ]
    }]
  }
  // graph 3 dashboard  end

  // graph 4 dashboard 
export const chart4 = {
    credits: {
        enabled: false
    },
    colors: [color1,color2,color3,color4,color5],
    chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie'
    },
    title: {
        text: ''
    },
    tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
    },
    accessibility: {
        point: {
            valueSuffix: '%'
        }
    },
    plotOptions: {
        pie: {
            cursor: 'pointer',
            dataLabels: {
                enabled: true,
                format: '{point.percentage:.1f} %',
                distance: -50,
            },
            showInLegend: true
        }
    },
    series: [{
        name: 'Cost Ratio(PFS)',
        colorByPoint: true,
        data: [{
            name: 'RM',
            y: 63,
        }, {
            name: 'CC',
            y: 17
        }, {
            name: 'Other',
            y: 20
        }]
    }]
  }
  // graph 4 dashboard end

  // graph 5 dashboard 
export const chart5 = {
    credits: {
        enabled: false
    },
    colors: [color1,color2,color3,color4,color5],
    chart: {
        type: 'column'
    },
    title: {
        text: ''
    },
    xAxis: {
        categories: ['Vendor 1', 'Vendor 2', 'Vendor 3', 'Vendor 4', 'Vendor 5']
    },
    yAxis: {
        min: 0,
        title: {
            text: ''
        }
    },
    tooltip: {
        pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.percentage:.0f}%)<br/>',
        shared: true
    },
    plotOptions: {
        column: {
            stacking: 'percent'
        }
    },
    series: [{
        name: 'RM',
        data: [5, 3, 4, 7, 2]
    }, {
        name: 'CC',
        data: [2, 2, 3, 2, 1]
    }, {
        name: 'Other',
        data: [3, 4, 4, 2, 5]
    }]
  }
  // graph 5 dashboard end