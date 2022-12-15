import React from 'react'
import { Bar, Line } from 'react-chartjs-2';
import { data1, options1 } from "./ChartsDashboard";

export function Costmovementgraph(props) {
    const { graphData = data1, graphOptions = options1, graphHeight } = props;
    return (
        <>
            <div className="graph-container">
                <Bar data={graphData} options={props.options1} height={graphHeight} />
            </div>
        </>
    )
}
