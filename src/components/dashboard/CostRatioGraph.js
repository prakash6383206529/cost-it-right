import React from 'react'
import {data4, options4,} from "./ChartsDashboard";
import { Pie  } from 'react-chartjs-2';

export function Costratiograph(props) {
    

    return (
        <>
            <div className="graph-container">
                <Pie data={data4} options={options4} />
            </div>
        </>
    )
}
