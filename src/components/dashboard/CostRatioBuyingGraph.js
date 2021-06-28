import React from 'react'
import {data5, options5,} from "./ChartsDashboard";
import {Bar } from 'react-chartjs-2';

export function Costratiobuyinggraph(props) {
    

    return (
        <>
            <div className="graph-container">
                <Bar data={data5} options={options5}/>
            </div>
        </>
    )
}
