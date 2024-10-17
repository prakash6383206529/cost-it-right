import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { checkForDecimalAndNull, getCurrencySymbol } from '../../../helper';
import { Bar } from 'react-chartjs-2';
import { colorArray } from '../../dashboard/ChartsDashboard';
import { useSelector } from 'react-redux';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

export function BarChartComparison({ costingData, currency, graphHeight = 500, graphWidth = 1000 }) {
  const [graphData, setGraphData] = useState(null);
  const { NoOfDecimalForPrice } = useSelector(state => state.auth?.initialConfiguration)

  useEffect(() => {
    const prepareGraphData = () => {
      const filteredCostingData = costingData.filter(item =>
        item?.CostingHeading !== "Variance" && item?.CostingHeading !== "Old Costing"
      );
      const labels = filteredCostingData?.map(item => {
        if (item?.zbc === 2) {
          return `${item?.plantName} - (${item?.vendorName}) (${item?.vendorCode})`;
        } else if (item?.zbc === 3) {
          return `${item?.plantName} - (${item?.customerName}) (${item?.customerCode})`;
        } else {
          return item?.plantName;
        }
      });

      const datasets = [
        {
          label: 'RM Cost',
          data: filteredCostingData?.map(item => item?.netRM),
          backgroundColor: colorArray[0],
        },
        {
          label: 'BOP Cost',
          data: filteredCostingData?.map(item => checkForDecimalAndNull(item?.netBOP, NoOfDecimalForPrice)),
          backgroundColor: colorArray[1],
        },
        {
          label: 'Conversion Cost',
          data: filteredCostingData?.map(item => checkForDecimalAndNull(item?.nConvCost, NoOfDecimalForPrice)),
          backgroundColor: colorArray[2],
        },
        {
          label: 'Surface Treatment Cost',
          data: filteredCostingData?.map(item => checkForDecimalAndNull(item?.netSurfaceTreatmentCost, NoOfDecimalForPrice)),
          backgroundColor: colorArray[3],
        },
        {
          label: 'Overheads & Profits',
          data: filteredCostingData?.map(item => checkForDecimalAndNull(item?.nOverheadProfit, NoOfDecimalForPrice)),
          backgroundColor: colorArray[4],
        },
        {
          label: 'Packaging & Freight',
          data: filteredCostingData?.map(item => checkForDecimalAndNull(item?.nPackagingAndFreight, NoOfDecimalForPrice)),
          backgroundColor: colorArray[5],
        },
        {
          label: 'Tool Cost',
          data: filteredCostingData?.map(item => checkForDecimalAndNull(item?.totalToolCost, NoOfDecimalForPrice)),
          backgroundColor: colorArray[6],
        },
        {
          label: 'Discount Cost',
          data: filteredCostingData?.map(item => checkForDecimalAndNull(item?.otherDiscountCost, NoOfDecimalForPrice)),
          backgroundColor: colorArray[7],
        },
        {
          label: 'Other Cost',
          data: filteredCostingData?.map(item => checkForDecimalAndNull(item?.anyOtherCostTotal, NoOfDecimalForPrice)),
          backgroundColor: colorArray[8],
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
          color: '#71737b',
          borderColor: '#71737b',
          borderWidth: 1.5
        },
      },
      x: {
        stacked: true,
        ticks: {
          callback: function (value) {
            return getCurrencySymbol(currency) + value.toFixed(2);
          }
        },
        grid: {
          display: false,
          color: '#71737b',
          borderColor: '#71737b',
          borderWidth: 1.5
        },
      },
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 15,
          font: { size: 13 }
        }
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
          return value !== 0 ? getCurrencySymbol(currency) + value : "";
        },
      }
    }
  };

  return (
    <div className="chart-container mt-4 mb-2" style={{ width: window.screen.width - 100, margin: '0 auto' }}>
      <div style={{ position: 'relative', height: `${graphHeight}px` }}>
        <div style={{
          position: 'absolute',
          top: '-20px',
          left: '0px',
          zIndex: 10,
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          Plant (Code) - Vendor (Code) / Customer (Code)
        </div>
        <div className="graph-container d-flex align-items-center" style={{ height: '100%' }}>
          {graphData && <Bar data={graphData} options={options} />}
        </div>
      </div>
    </div>
  );
}
