import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { getCurrencySymbol } from '../../../helper';
import { Bar } from 'react-chartjs-2';
import { colorArray } from '../../dashboard/ChartsDashboard';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function BarChartComparison({ costingData, currency, graphHeight = 500, graphWidth = 1000 }) {
  const [graphData, setGraphData] = useState(null);

  useEffect(() => {
    const prepareGraphData = () => {
      // Filter out items with costingHeaders === "variance" or "old costing"

      const filteredCostingData = costingData.filter(item =>
        item?.CostingHeading !== "Variance" && item?.CostingHeading !== "Old Costing"
      );
      const labels = filteredCostingData?.map(item => {
        if (item?.zbc === 2) {
          return `${item?.plantName} (${item?.vendorName})`;
        } else if (item?.zbc === 3) {
          return `${item?.plantName} (${item?.customerName})`;
        } else {
          return item?.plantName;
        }
      });

      const datasets = [
        {
          label: 'Net RM',
          data: filteredCostingData?.map(item => item?.netRM),
          backgroundColor: colorArray[0],
        },
        {
          label: 'Net BOP',
          data: filteredCostingData?.map(item => item?.netBOP),
          backgroundColor: colorArray[1],
        },
        {
          label: 'Net Conversion Cost',
          data: filteredCostingData?.map(item => item?.nConvCost),
          backgroundColor: colorArray[2],
        },
        {
          label: 'Net Surface Treatment Cost',
          data: filteredCostingData?.map(item => item?.netSurfaceTreatmentCost),
          backgroundColor: colorArray[3],
        },
        {
          label: 'Net Overheads & Profits',
          data: filteredCostingData?.map(item => item?.nOverheadProfit),
          backgroundColor: colorArray[4],
        },
        {
          label: 'Net Packaging & Freight',
          data: filteredCostingData?.map(item => item?.nPackagingAndFreight),
          backgroundColor: colorArray[5],
        },
        // {
        //   label: 'Total Net Cost',
        //   data: filteredCostingData?.map(item =>
        //     item?.totalTabSum
        //   ),
        //   backgroundColor: 'rgba(0, 0, 0, 0.6)',
        //   type: 'bar',
        //   stack: 'total'
        // }
      ];

      return { labels, datasets };
    };

    setGraphData(prepareGraphData());
  }, [costingData]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    barThickness: 40, // Adjust this value to make bars thinner or thicker
    maxBarThickness: 70, // This sets a maximum thickness
    indexAxis: 'y',
    scales: {

      y: {
        stacked: true,
        ticks: {
          autoSkip: false,
          maxRotation: 0,
          minRotation: 0
        },
        grid: {
          display: false
        },
      },

      x: {
        stacked: true,
        title: { display: true, text: `Cost` },
        ticks: {
          callback: function (value) {
            return getCurrencySymbol(currency) + value.toFixed(2);
          }
        },
        grid: {
          display: false
        },

      },

    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 15,
          font: { size: 10 }
        }
      },
      title: {
        display: true,
        font: { size: 14 }
      },
      datalabels: {
        display: true, // Always display the value
        color: 'black', // Set the text color (adjust for contrast)
        font: {
          weight: 'bold',
          size: 12, // Adjust font size if needed
        },
        align: 'center', // Center text horizontally in each segment
        anchor: 'center', // Center text vertically in each segment
        formatter: (value, context) => {
          // Format the value to display inside each bar segment
          return `${value.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}`;
        },
        afterDatasetsDraw: (chart) => {
          const ctx = chart.ctx;
          const datasets = chart.data.datasets;

          datasets.forEach((dataset, i) => {
            const meta = chart.getDatasetMeta(i);
            meta.data.forEach((bar, index) => {
              // Get the value to display
              const value = dataset.data[index];

              // Get the position of the bar
              const position = bar.getCenterPoint();

              // Adjust text color based on the background color for contrast
              ctx.fillStyle = 'black'; // Change color if needed
              ctx.font = 'bold 12px Arial'; // Set font style and size

              // Display the value inside the bar segment
              ctx.fillText(
                value.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }),
                position.x,
                position.y
              );
            });
          });
        }
      }
    }
  };

  return (
    <div className="chart-container" style={{ width: window.screen.width - 100, margin: '0 auto' }}>
      <div className="graph-container d-flex align-items-center" style={{ height: `${graphHeight}px` }}>
        {graphData && <Bar data={graphData} options={options} />}
      </div>
    </div>
  );
}