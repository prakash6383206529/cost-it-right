import React from 'react'
import { Bar, Line } from 'react-chartjs-2';
import { getCurrencySymbol } from '../../helper';
import { data1, options1 } from "./ChartsDashboard";

export function Costmovementgraph(props) {
    const { graphData = data1, graphOptions = options1, graphHeight, currency } = props;
    return (
        <>
            <div className="graph-container d-flex align-items-center pr-3">
                <div title={currency ? currency : ''} className='mb-5 pb-5 mr-2 currency-symbol'>{currency ? getCurrencySymbol(currency) : ''}</div>
                <Bar data={graphData} options={props.options1} height={graphHeight} />
            </div>
        </>
    )
}
