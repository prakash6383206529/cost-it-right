import React from 'react'
import _ from "lodash"
import { Pie, Line, Bar } from 'react-chartjs-2';
import { colorArray } from './ChartsDashboard';

export function CommonSummaryReportGraph(props) {
  const labelData = _.get(props, 'labelData', '')
  const chartData = _.get(props, 'chartData', '')
  const pieChartData = {
    labels: labelData,
    datasets: [
      {
        label: '',
        data: chartData,
        backgroundColor: colorArray,
        borderWidth: 0.5,
        hoverOffset: 10
      },
    ],
  }
  const pieChartOption = {
    plugins: {
      legend: {
        position: 'bottom',
        align: 'start',
        labels: {
          boxWidth: 16,
          borderWidth: 0,
          padding: 8,
          color: '#000'
        }
      },
    },
    layout: {
      padding: {
        top: 30
      }
    }
  }
  
  
  // const options2 = {
  //   indexAxis: 'y',
  //   responsive: true,
  //   plugins: {
  //     legend: {
  //       display: false, //This will do the task
  //       position: 'bottom',
  //       labels: {
  //         boxWidth: 15,
  //       }
  //     },
  //   },
  // }

  // const data2 = {
  //   labels: ['Plant 1', 'Plant 2', 'Plant 3', 'Plant 4', 'Plant 5'],
  //   datasets: [
  //     {
  //       label: '',
  //       data: [10, 17, 36, 76, 88],
  //       backgroundColor: colorArray,
  //       borderColor: colorArray,
  //     },
  //   ],
  // }

  return (
    <>
      <div className="graph-container">
        <Pie data={pieChartData} options={pieChartOption} />
      </div>
      {/* <div className="graph-container">
        <Line data={data2} options={options2} />
      </div> */}
    </>
  )
}
