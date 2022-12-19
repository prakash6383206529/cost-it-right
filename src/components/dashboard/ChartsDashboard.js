// graph colors start
const color1 = "#F199CE";
const color2 = "#78AAD8";
const color3 = "#73B0F4";
const color4 = "#3E88CB";
const color5 = "#B1CEEE";
const color6 = "#76E2C5";
const color7 = "#D6DDEB";
// graph colors end

// graph colors start
export const primaryColor = '#256bd1';
export const secondryColor = '#1adcb3';
export const graphColor1 = "#007ed6";
export const graphColor2 = "#e01e84";
export const graphColor3 = "#8e6cef";
export const graphColor4 = "#26d7ae";
export const graphColor5 = "#97d9ff";
export const graphColor6 = "#52d726";
export const graphColor7 = "#ffec00";
export const graphColor8 = "#8399eb";
export const graphColor9 = "#ff7300";
export const graphColor10 = "#7cdddd";
export const graphColor11 = "#ffaf00";
export const graphColor12 = "#19aa2d";
export const graphColor13 = "#5fb7d4";
export const graphColor14 = "#ff0000";
export const graphColor15 = "#9f9f9f";
export const graphColor16 = "#c758d0";
// graph colors end

export const colorArray = ['#77dd77', '#ff9899', '#007ed6', '#836953', '#89cff0', '#99c5c4', '#bdb0d0', '#befd73', '#9adedb', '#aa9499', '#e01e84', '#7cdddd', '#aaf0d1', '#b2fba5', '#b39eb5', '#bee7a5', '#c1c6fc', '#c6a4a4', '#c8ffb0', '#cb99c9', '#cef0cc', '#d8a1c4', '#cfcfc4', '#d6fffe', '#dea5a4', '#deece1', '#dfd8e1', '#e5d9d3', '#e9d1bf', '#ffb7ce', '#f49ac2', '#f4bfff', '#fdfd96', '#ff6961', '#ca9bf7', '#ff964f',]

// graph 1 (Cost Movement by Cost Drivers) dashboard  
export const options1 = {
  responsive: true,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        boxWidth: 15,
      }
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
      backgroundColor: color1,
    },
    {
      label: 'CC',
      data: [5, 7, 10, 6, 8, 5, 11, 7],
      fill: false,
      borderColor: color6,
      backgroundColor: color6,
    },
    {
      label: 'VA',
      data: [9, 11, 14, 10, 12, 9, 15, 12],
      fill: false,
      borderColor: color3,
      backgroundColor: color3,
    },
    {
      label: 'Others',
      data: [14, 16, 20, 15, 18, 17, 21, 24],
      fill: false,
      borderColor: color4,
      backgroundColor: color4,
    },
  ],
  borderWidth: 1,
};
// graph 1 (Cost Movement by Cost Drivers) dashboard end

// graph 2(Cost Comparison by Plant) dashboard 
export const options2 = {
  indexAxis: 'y',
  responsive: true,
  plugins: {
    legend: {
      display: false, //This will do the task
      position: 'bottom',
      labels: {
        boxWidth: 15,
      }
    },
  },
};

export const data2 = {
  labels: ['Plant 1', 'Plant 2', 'Plant 3', 'Plant 4', 'Plant 5'],
  datasets: [
    {
      label: '',
      data: [10, 17, 36, 76, 88],
      backgroundColor: [color4, color3, color1, color2, color5],
      borderColor: [color4, color3, color1, color2, color5],
    },
  ],
}

// export const data2 = {
//     labels: ['', '', '', '', ''],
//     datasets: [
//         {
//         label: 'Plant 1',
//         data: [10, 0, 0, 0, 0],
//         backgroundColor: [color4],
//         borderColor: [color4],
//         },
//         {
//         label: 'Plant 2',
//         data: [0, 33, 0, 0, 0],
//         backgroundColor: [color3],
//         borderColor: [color3],
//         },
//         {
//         label: 'Plant 3',
//         data: [0, 0, 54, 0, 0],
//         backgroundColor: [color1],
//         borderColor: [color1],
//         },
//         {
//         label: 'Plant 4',
//         data: [0, 0, 0, 70, 0],
//         backgroundColor: [color2],
//         borderColor: [color2],
//         },
//         {
//         label: 'Plant 5',
//         data: [0, 0, 0, 0, 75],
//         backgroundColor: [color5],
//         borderColor: [color5],
//         },        
//     ],
// }
// graph 2(Cost Comparison by Plant) dashboard end


// graph 3(Supplier Contribution(SOB) dashboard
export const options3 = {
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        boxWidth: 15,
        borderWidth: 1,
        borderColor: [
          color1,
          color4,
          color3,
          color7,
        ],
      }
    },
  },
};

export const data3 = {
  labels: ['Vendor1', 'Vendor2', 'Vendor3', 'Vendor4'],
  datasets: [
    {
      label: '',
      data: [15, 35, 16, 34,],
      backgroundColor: [
        color1,
        color4,
        color3,
        color7,
      ],
      borderColor: [
        '#fff',
        '#fff',
        '#fff',
        '#fff',
      ],
      borderWidth: 2,
    },
  ],
};
// graph 3(Supplier Contribution(SOB) dashboard  end

// graph 4 (Cost Ratio(PFS) dashboard
export const options4 = {
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        boxWidth: 15,
        borderWidth: 1,
        borderColor: [
          color1,
          color3,
          color4,
        ],
      }
    },
  },
};

export const data4 = {
  labels: ['RM', 'CC', 'Other'],
  datasets: [
    {
      label: '',
      data: [30, 25, 45],
      backgroundColor: [
        color1,
        color3,
        color4,
      ],
      borderColor: [
        '#fff',
        '#fff',
        '#fff',
      ],
      borderWidth: 1,
    },
  ],
};
// graph 4 (Cost Ratio(PFS) dashboard  end

// graph 5(Cost Ratio(Buying)) dashboard 
export const options5 = {
  responsive: true,
  scales: {
    x: {
      stacked: true,
    },
    y: {
      stacked: true
    }
  },
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        boxWidth: 15,
      }
    },
  },
};

export const data5 = {
  labels: ['1', '2', '3', '4', '5', '6'],
  datasets: [
    {
      label: 'RM',
      data: [12, 19, 3, 5, 2, 3],
      backgroundColor: color4,
      barThickness: 15,
      maxBarThickness: 15,
      minBarLength: 2,
    },
    {
      label: 'CC',
      data: [2, 3, 20, 5, 1, 4],
      backgroundColor: color3,
      barThickness: 15,
      maxBarThickness: 15,
      minBarLength: 2,
    },
    {
      label: 'Other',
      data: [3, 10, 13, 15, 22, 30],
      backgroundColor: color1,
      barThickness: 15,
      maxBarThickness: 15,
      minBarLength: 2,
    },
  ],
};
// graph 5(Cost Ratio(Buying)) dashboard end