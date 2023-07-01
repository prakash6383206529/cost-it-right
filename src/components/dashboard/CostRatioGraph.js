import React from 'react'
import { Pie } from 'react-chartjs-2';

export function Costratiograph(props) {

    return (
        <>
            <div className="graph-container">
                <Pie data={props?.data} options={props.options} />
            </div>
        </>
    )
}
