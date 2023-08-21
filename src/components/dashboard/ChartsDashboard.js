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
export const primaryColor = '#0072B2';
export const secondryColor = '#E69F00';
export const graphColor1 = "#009E73";
export const graphColor2 = "#D55E00";
export const graphColor3 = "#CC79A7";
export const graphColor4 = "#F0E442";
export const graphColor5 = "#56B4E9";
export const graphColor6 = "#FFA500";
export const graphColor7 = "#00CC99";
export const graphColor8 = "#8A2BE2";
export const graphColor9 = "#6B8E23";
export const graphColor10 = "#1E90FF";
export const graphColor11 = "#8B008B";
export const graphColor12 = "#32CD32";
export const graphColor13 = "#BA55D3";
export const graphColor14 = "#ADFF2F";
export const graphColor15 = "#9932CC";
export const graphColor16 = "#FFD700";
// graph colors end

export const colorArray = ['#0072B2', '#E69F00', '#009E73', '#D55E00', '#CC79A7', '#9932CC', '#FFD700', '#8B4513', '#00CED1', '#A0522D', '#4682B4', '#CD853F', '#6495ED', '#FF4500', '#2E8B57', '#6A5ACD', '#FF6347', '#F0E442', '#56B4E9', '#FFA500', '#00CC99', '#FF7F50', '#8A2BE2', '#6B8E23', '#1E90FF', '#8B008B', '#32CD32', '#BA55D3', '#ADFF2F', '#5F9EA0', '#DA70D6', '#3CB371', '#9370DB', '#98FB98', '#8B008B', '#48D1CC', '#7FFF00', '#8B0000', '#AFEEEE', '#CD5C5C', '#F08080'];

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
  labels: ['15/01/2023', '02/02/2023', '20/03/2023', '22/04/2023', '10/05/2023', '01/06/2023'],
  datasets: [
    {
      label: 'RM',
      data: [2, 4, 7, 3, 5, 2, 8, 4],
      fill: false,
      borderColor: colorArray[0],
      backgroundColor: colorArray[0],
    },
    {
      label: 'BOP',
      data: [5, 7, 10, 6, 8, 5, 11, 7],
      fill: false,
      borderColor: colorArray[1],
      backgroundColor: colorArray[1],
    },
    {
      label: 'CC',
      data: [9, 11, 14, 10, 12, 9, 15, 12],
      fill: false,
      borderColor: colorArray[2],
      backgroundColor: colorArray[2],
    },
    {
      label: 'Others',
      data: [14, 16, 20, 15, 18, 17, 21, 24],
      fill: false,
      borderColor: colorArray[3],
      backgroundColor: colorArray[3],
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
        borderColor: colorArray,
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
      backgroundColor: colorArray,
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