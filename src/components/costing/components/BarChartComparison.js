import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { getCurrencySymbol } from '../../../helper';
import { Bar } from 'react-chartjs-2';
import { colorArray } from '../../dashboard/ChartsDashboard';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

export function BarChartComparison({ costingData, currency, graphHeight = 500, graphWidth = 1000 }) {
  const [graphData, setGraphData] = useState(null);

  useEffect(() => {
    const prepareGraphData = () => {
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
      ];

      return { labels, datasets };
    };

    setGraphData(prepareGraphData());
  }, [costingData]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    barThickness: 40,
    maxBarThickness: 70,
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
          display: false,
          color: '#71737b',  // Dark color for y-axis line
          borderColor: '#71737b',  // Dark color for y-axis border
          borderWidth: 1.5
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
          display: false,
          color: '#71737b',  // Dark color for y-axis line
          borderColor: '#71737b',  // Dark color for y-axis border
          borderWidth: 1.5
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
      tooltip: {
        enabled: true,
      },
      datalabels: {
        display: true,
        color: 'white',
        font: {
          weight: 'bold',
          size: 11,
        },

        align: 'center',
        anchor: 'center',
        formatter: (value) => {
          return getCurrencySymbol(currency) + value.toFixed(2);
        },
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