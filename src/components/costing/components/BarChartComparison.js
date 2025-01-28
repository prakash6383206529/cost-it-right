import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { checkForDecimalAndNull, getConfigurationKey, getCurrencySymbol } from '../../../helper';
import { Bar } from 'react-chartjs-2';
import { colorArray } from '../../dashboard/ChartsDashboard';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

export function BarChartComparison({ costingData, currency }) {
  const [graphData, setGraphData] = useState(null);
  const [graphHeight, setGraphHeight] = useState(240)

  useEffect(() => {
    const prepareGraphData = () => {
      const filteredCostingData = costingData.filter(item =>
        item?.CostingHeading !== "Variance" && item?.CostingHeading !== "Old Costing"
      );
      setGraphHeight(filteredCostingData?.length > 2 ? filteredCostingData?.length * 80 : 240)
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
          data: filteredCostingData?.map(item => checkForDecimalAndNull(item?.NetRawMaterialsCostConversion, getConfigurationKey()?.NoOfDecimalForPrice)),
          backgroundColor: colorArray[0],
        },
        {
          label: 'Net BOP',
          data: filteredCostingData?.map(item => checkForDecimalAndNull(item?.NetBoughtOutPartCostConversion, getConfigurationKey()?.NoOfDecimalForPrice)),
          backgroundColor: colorArray[1],
        },
        {
          label: 'Net Conversion Cost',
          data: filteredCostingData?.map(item => checkForDecimalAndNull(item?.NetConversionCostConversion, getConfigurationKey()?.NoOfDecimalForPrice)),
          backgroundColor: colorArray[2],
        },
        {
          label: 'Net Surface Treatment Cost',
          data: filteredCostingData?.map(item => checkForDecimalAndNull(item?.NetSurfaceTreatmentCostConversion, getConfigurationKey()?.NoOfDecimalForPrice)),
          backgroundColor: colorArray[3],
        },
        {
          label: 'Net Overheads & Profits',
          data: filteredCostingData?.map(item => checkForDecimalAndNull(item?.NetOverheadAndProfitCostConversion, getConfigurationKey()?.NoOfDecimalForPrice)),
          backgroundColor: colorArray[4],
        },
        {
          label: 'Net Packaging & Freight',
          data: filteredCostingData?.map(item => checkForDecimalAndNull(item?.NetFreightPackagingCostConversion, getConfigurationKey()?.NoOfDecimalForPrice)),
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
            return getCurrencySymbol(currency) + checkForDecimalAndNull(value, getConfigurationKey()?.NoOfDecimalForPrice);
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
          return getCurrencySymbol(currency) + checkForDecimalAndNull(value, getConfigurationKey()?.NoOfDecimalForPrice);
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
        <div className="graph-container d-flex align-items-center" style={{ height: `${graphHeight}px` }}>
          {graphData && <Bar data={graphData} options={options} />}
        </div>
      </div>
    </div>
  );
}