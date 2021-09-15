import React from 'react'
import {data2,options2} from "./ChartsDashboard";
import {Bar  } from 'react-chartjs-2';

export function Costcomparisonplantgraph(props) {
    

    return (
        <>
            <div className="graph-container">
                  <Bar data={data2} options={options2} />
                </div>
        </>
    )
}
