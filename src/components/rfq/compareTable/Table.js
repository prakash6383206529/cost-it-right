// Table.js
import React from 'react';

const Table = (props) => {
    const { headerData, sectionData, children } = props;


    const renderList = (sectionData) => {
        const { isHighlightedRow, header, data } = sectionData
        return <>
            {isHighlightedRow ? <> {header.length > 1 && <tr className='summary-table-main-row'>
                <td>
                    {header.slice(0, -1).map((item, index) => (
                        <div className='summary-table-seperate-data' key={index}>{item}</div>
                    ))}
                </td>
                {data.map((item, rowIndex) => (
                    <td key={rowIndex}>
                        {item.slice(0, -1).map((el, ind) => (
                            <div className='summary-table-seperate-data' key={ind}>{el ?? '-'}</div>
                        ))}
                    </td>
                ))}
            </tr>}
                <tr className='background-light-blue'>
                    <td>{header[header.length - 1]}</td>
                    {data.map((item, index) => (
                        <td key={index}>
                            <div>{item[item.length - 1] ?? '-'}</div>
                        </td>
                    ))}
                </tr>
            </>
                : <tr>
                    <td>
                        {header.map((item, index) => (
                            <div className='summary-table-seperate-data' key={index}>{item}</div>
                        ))}
                    </td>
                    {data.map((item, rowIndex) => (
                        <td key={rowIndex}>
                            {item.map((el, ind) => (
                                <div className='summary-table-seperate-data' key={ind}>{el ?? '-'}</div>
                            ))}
                        </td>
                    ))}
                </tr>}
        </>
    }
    return (
        <table className='table table-bordered costing-summary-table'>
            <thead>
                <tr>
                    <th></th>
                    {headerData.map((item, index) => {
                        return (<th>{item.bestCost ? 'BestCost' : item.shouldCost ? 'ShouldCost' : ''}</th>)
                    })}
                </tr>
                <tr>
                    <th>Vendor</th>
                    {headerData.map((item, index) => {
                        return <th key={index}><div>{item.isChecked && <div className="custom-check1 d-inline-block">
                            <label
                                className="custom-checkbox pl-0 mb-0"
                                onChange={item.onChange}
                            >
                                {''}
                                <input
                                    type="checkbox"
                                    value={"All"}
                                    id={`checkbox-${index}`}
                                    // disabled={true}
                                    checked={item.checked}
                                />
                                <span
                                    id={`checkbox-${index}`}
                                    className="before-box"
                                    checked={item.checked}
                                    onChange={() => item.onChange(index, item)}
                                />
                            </label>
                        </div>} {item.bestCost ? '' : item.vendorName}</div></th>
                    })}
                </tr>
            </thead>
            <tbody>
                {sectionData.map(item => renderList(item))}
                {children}
            </tbody>
        </table>
    );
};

export default Table;
