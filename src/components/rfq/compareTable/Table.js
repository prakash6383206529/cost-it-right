// Table.js
// Table.js
import React, { useState } from 'react';
import { getVendorPlantSelectList } from '../../../actions/Common';
import { useLabels } from '../../../helper/core';
import TooltipCustom from '../../common/Tooltip';

const Table = (props) => {
    const { headerData, sectionData, children,showConvertedCurrency, 
        onConvertedCurrencyChange,showConvertedCurrencyCheckbox,onViewOtherCost } = props;
    const { vendorLabel } = useLabels()
        
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
                            <div className="d-flex align-items-center justify-content-between mr-0">
                                <span>{item[item.length - 1] ?? '-'}</span>
                                {/* Add view icon for Other Net Cost column */}
                                {header[header.length - 1].includes('Other Net Cost') && headerData[index].bestCost !== "" && (
        <button
            id="view_conversion_cost"
            type="button"
            title='View'
                                   className="float-right mb-0 View mr-0 "
            onClick={() => onViewOtherCost(index)}
        >
        </button>
                                )}
                            </div>
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
        <>
        {showConvertedCurrencyCheckbox && (
            <div className="currency-controls d-flex justify-content-end align-items-center mb-3">
                <label className="custom-checkbox mb-0 mr-2 d-flex align-items-center">
                    <input
                        type="checkbox"
                        checked={showConvertedCurrency}
                        onChange={() => onConvertedCurrencyChange(!showConvertedCurrency)}
                    />
                    <span className="before-box mr-2" />
                    <span>Show Converted Currency</span>
                </label>
                <TooltipCustom 
                    id={'converted-currency-tooltip'} 
                    width={"290px"} 
                    tooltipText={"If you wish to see Best Cost, Please click on 'Show Converted Currency'."}
                />
            </div>
        )}
        <div className="table-container">
            <table className='table table-bordered costing-summary-table'>
                <thead>
                <tr>
                    <th></th>
                    {headerData.map((item, index) => {
                        return (<th>{item.bestCost==="" ? 'BestCost' : item.shouldCost ? 'ShouldCost' : ''}</th>)
                    })}
                </tr>
                <tr>
                    <th>{vendorLabel}</th>
                    {headerData.map((item, index) => {
                        return <th key={index}><div>{item.isCheckBox && <div className="custom-check1 d-inline-block">
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
                        </div>} {item.bestCost ? '' : item.vendorName}</div>{/* <span>{item.costingType}-{item.vendorCode}</span> */}</th>
                    })}
                </tr>
            </thead>
            <tbody>
                {sectionData.map(item => renderList(item))}
                {children}
            </tbody>
        </table>
        </div>
        </>
    );
};

export default Table;
