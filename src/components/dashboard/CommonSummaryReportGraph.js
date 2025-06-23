import React from 'react'
import _ from "lodash"
import { Pie, Line, Bar } from 'react-chartjs-2';
import { colorArray } from './ChartsDashboard';

export function CommonSummaryReportGraph(props) {
  const labelData = _.get(props, 'labelData', '')
  const chartData = _.get(props, 'chartData', '')
  const graphType = _.get(props, 'graphType', 'Bar Chart')

  // Pie Pattern Chart Data
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
      datalabels: {
        color: '#fff',
      }
    },
    layout: {
      padding: {
        top: 30
      }
    }
  }

  // Bar Pattern Chart Data
  const barOptions = {
    indexAxis: 'x',
    responsive: true,
    plugins: {
      legend: {
        display: false,
        position: 'bottom',
        labels: {
          boxWidth: 15,
        }
      },
      datalabels: {
        color: '#fff',
      }
    }
  }

  const barData = {
    labels: labelData,
    datasets: [
      {
        label: '',
        data: chartData,
        backgroundColor: colorArray,
        borderColor: colorArray,
        maxBarThickness: 40
      },
    ],
  }

  const lineData = {
    labels: labelData,
    datasets: [
      {
        data: chartData,
        borderColor: colorArray,
        backgroundColor: colorArray,
        tension: 0.3, // for smooth curves; set 0 for sharp angles
        borderWidth: 2, // line thickness
        pointRadius: 4, // dot size
        pointHoverRadius: 6, // dot size on hover
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
      },
      y: {
        beginAtZero: true,
      },
    },
  }


  return (
    <>
      {graphType === 'Pie Chart' && (
        <div className="graph-container">
          <Pie data={pieChartData} options={pieChartOption} />
        </div>
      )}
      {graphType === 'Bar Chart' && (
        <div className="graph-container">
          <Bar data={barData} options={barOptions} />
        </div>
      )}
      {graphType === 'Line Chart' && (
        <div className="graph-container">
          <Line data={lineData} options={lineOptions} />
        </div>
      )}
    </>
  )
}
