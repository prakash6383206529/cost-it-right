import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { getCurrencySymbol } from '../../../helper';
import { Bar } from 'react-chartjs-2';

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
          backgroundColor: 'rgba(255, 99, 132, 0.3)',
        },
        {
          label: 'Net BOP',
          data: filteredCostingData?.map(item => item?.netBOP),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
        },
        {
          label: 'Net Conversion Cost',
          data: filteredCostingData?.map(item => item?.nConvCost),
          backgroundColor: 'rgba(255, 206, 86, 0.6)',
        },
        {
          label: 'Net Surface Treatment Cost',
          data: filteredCostingData?.map(item => item?.netSurfaceTreatmentCost),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        },
        {
          label: 'Net Overheads & Profits',
          data: filteredCostingData?.map(item => item?.nOverheadProfit),
          backgroundColor: 'rgba(153, 102, 255, 0.6)',
        },
        {
          label: 'Net Packaging & Freight',
          data: filteredCostingData?.map(item => item?.nPackagingAndFreight),
          backgroundColor: 'rgba(255, 159, 64, 0.6)',
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
    barThickness: 55, // Adjust this value to make bars thinner or thicker
    maxBarThickness: 77, // This sets a maximum thickness
    scales: {
      
      x: {
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
      
      y: {
        stacked: true,
        title: { display: true, text: `Cost` },
        ticks: {
          callback: function (value) {
            return getCurrencySymbol(currency) + value.toFixed(0);
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
        text: `Costing Comparison`,
        font: { size: 14 }
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => tooltipItems[0].label,
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${getCurrencySymbol(currency)}${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          },
          footer: (tooltipItems) => {
            const total = tooltipItems.reduce((sum, item) => sum + item.parsed.y, 0);
            return `Total: ${getCurrencySymbol(currency)}${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          }
        }
      }
    },
  };

  return (
    <div className="chart-container" style={{ width: `${graphWidth}px`, margin: '0 auto' }}>
      <div className="graph-container d-flex align-items-center" style={{ height: `${graphHeight}px` }}>
        <div title={currency} className='mr-2 currency-symbol'>{getCurrencySymbol(currency)}</div>
        {graphData && <Bar data={graphData} options={options} />}
      </div>
    </div>
  );
}