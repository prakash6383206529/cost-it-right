import React, { Fragment, useState, useEffect } from 'react'
import { Row, Col, Table } from 'reactstrap'
import NoContentFound from '../../../../common/NoContentFound'
import { EMPTY_DATA } from '../../../../../config/constants'
// import AddYOYCost from './AddYOYCost'
import { Controller } from "react-hook-form";
import { TextFieldHookForm } from '../../../../../components/layout/HookFormInputs'
import { checkForDecimalAndNull, checkWhiteSpaces, getConfigurationKey, number, percentageOfNumber } from '../../../../../helper'
import { useDispatch, useSelector } from 'react-redux'
import { getYOYCostList, setYOYCostGrid } from '../../../actions/Costing'
import Toaster from '../../../../common/Toaster'
import _ from 'lodash'
import LoaderCustom from '../../../../common/LoaderCustom'

function YOYCost(props) {
    const { outside, patId, vendorId, hideAddButton } = props;
    const [tableData, setTableData] = useState([])
    const [oldData, setOldData] = useState([])
    const [yoyDrawerOpen, setYoyDrawerOpen] = useState(false)
    const [loader, setLoader] = useState(outside ? true : false)
    const { setValue, getValues, control, errors, register } = props
    const { yoyCostGrid } = useSelector(state => state.costing)
    const { quotationIDForRFQ } = useSelector(state => state.rfq)
    const dispatch = useDispatch()

    useEffect(() => {
        if (outside && props.activeTab === '6') {
            console.log('quotationIDForRFQ: ', quotationIDForRFQ);
            let requestObject = {
                quotationId: quotationIDForRFQ,
                partId: patId,
                vendorId: vendorId
            }

            // set data from api
            // Define initial data sets
            let tempDataYear1_5_One = {}
            let tempDataYear1_5_Two = {}
            let tempDataYear1_5_Three = {}
            dispatch(getYOYCostList(requestObject, (res) => {
                setLoader(false)
                _.map(res?.data?.Data?.yoyResponseDetails, (item, index) => {
                    tempDataYear1_5_One[`Y${index + 1}`] = item.Quantity ? item.Quantity : 0
                    tempDataYear1_5_Two[`Y${index + 1}`] = item.DiscountPercent ? item.DiscountPercent : 0
                    tempDataYear1_5_Three[`Y${index + 1}`] = item.NetCostPerPiece ? item.NetCostPerPiece : 0
                });

                // Define initial array of data objects
                let tempData = [
                    { Heading: "Forecast Quantity" },
                    { Heading: "YOY Discount(%)" },
                    { Heading: "Net Cost / Pc" },
                ]

                // Map through tempData array and modify each object with the appropriate data
                let finalList = tempData.map(item => {
                    switch (item.Heading) {
                        case 'Forecast Quantity':
                            return { ...item, ...tempDataYear1_5_One }
                        case 'YOY Discount(%)':
                            return { ...item, ...tempDataYear1_5_Two }
                        case 'Net Cost / Pc':
                            return { ...item, ...tempDataYear1_5_Three }
                        default:
                            return item
                    }
                })
                // Set state variables with modified data
                setTableData(finalList)
                setOldData(finalList)
                dispatch(setYOYCostGrid(finalList)) // set data from api
                setDataInFields(finalList[1])
            }))
        }


        if (!outside) {
            setTableData(yoyCostGrid)
            setDataInFields(yoyCostGrid[1])
        }
    }, [])

    const setDataInFields = (data) => {
        const configurationKey = getConfigurationKey();
        setValue('Y1', checkForDecimalAndNull(data?.Y1, configurationKey.NoOfDecimalForInputOutput))
        setValue('Y2', checkForDecimalAndNull(data?.Y2, configurationKey.NoOfDecimalForInputOutput))
        setValue('Y3', checkForDecimalAndNull(data?.Y3, configurationKey.NoOfDecimalForInputOutput))
        setValue('Y4', checkForDecimalAndNull(data?.Y4, configurationKey.NoOfDecimalForInputOutput))
        setValue('Y5', checkForDecimalAndNull(data?.Y5, configurationKey.NoOfDecimalForInputOutput))
    }
    const openCloseYOYDrawer = (value, type, tableData) => {
        // Delay the execution of the function using setTimeout
        setTimeout(() => {
            if (value === true) {
                // If value is true, set YoyDrawerOpen to true
                setYoyDrawerOpen(true)
            } else {
                if (type === 'Save') {
                    // If type is 'Save', set old data and update fields and grids
                    if (String(tableData[1]?.Y1) === "0" && String(tableData[1]?.Y2) === "0" &&
                        String(tableData[1]?.Y3) === "0" && String(tableData[1]?.Y4) === "0" && String(tableData[1]?.Y5) === "0") {
                        Toaster.warning("Please enter a numerical value for a minimum of one year.")
                        return false
                    }
                    setOldData(tableData)
                    setDataInFields(tableData[1])
                    dispatch(setYOYCostGrid(tableData))
                    setTableData(tableData)
                } else {
                    // If type is not 'Save', set tableData and data fields to old data
                    setTableData(oldData)
                    setDataInFields(oldData[1])
                }
                // Delay closing the drawer to allow time for state updates to occur
                setTimeout(() => {
                    setYoyDrawerOpen(false)
                }, 100);
            }
        }, 50);
    }

    const getValue = (year) => {
        return getValues(year) ? getValues(year) : 0;
    };

    const handleChangeYears = (e) => {
        // Delay the execution of the function to allow time for other updates to complete
        setTimeout(() => {
            // Create a copy of the current table data to avoid modifying the original
            const tempList = [...tableData];
            // Get the two objects representing the first two rows of the table
            const [object1, object2] = tempList.slice(1, 3);

            // A helper function to calculate the percentage of the NetPOPrice for a given year
            const percentOfNetPOPrice = (year) => {
                return percentageOfNumber(props?.NetPOPrice, getValue(year));
            };

            // Update the values of object1 based on the form input
            const updatedObject1 = {
                ...object1, Y1: getValue("Y1"),
                Y2: getValue("Y2"),
                Y3: getValue("Y3"),
                Y4: getValue("Y4"),
                Y5: getValue("Y5"),
            };

            // Update the values of object2 based on the updated values of object1
            const updatedObject2 = {
                ...object2,
                Y1: percentOfNetPOPrice("Y1"),
                Y2: percentOfNetPOPrice("Y2"),
                Y3: percentOfNetPOPrice("Y3"),
                Y4: percentOfNetPOPrice("Y4"),
                Y5: percentOfNetPOPrice("Y5"),
            };

            // Update the table data with the updated objects
            const updatedTempList = Object.assign([...tempList], { [1]: updatedObject1 }, { [2]: updatedObject2 });
            // Call a function passed in as a prop to update the parent component's state with the new table data
            props?.getTableData(updatedTempList);
            // Update the local state with the new table data
            setTableData(updatedTempList);
        }, 100);
    };

    return (
        <Fragment>
            {loader && <LoaderCustom customClass="attachment-loader" />}
            <Row className='pr-0'>
                {/* If outside is true, display the YOY Cost */}
                {outside && !hideAddButton &&
                    <div className='d-flex align-items-center mb-2'>
                        <Col md="12">
                            <div className="">
                                <button
                                    type="button"
                                    className={"user-btn"}
                                    onClick={() => openCloseYOYDrawer(true, '', yoyCostGrid)}
                                    title="Add"
                                >
                                    <div className={"plus mr-1"}></div>Add
                                </button>
                            </div>
                        </Col>
                    </div>}
                {/* Display the net PO price */}
                <Col md="12">
                    {!outside && <div className="pb-2">
                        {`Quoted Cost: ${checkForDecimalAndNull(props?.NetPOPrice, getConfigurationKey().NoOfDecimalForPrice)}`}
                    </div>}
                    {/* Table */}
                    <form>
                        <Table className={`table mb-0 border forging-cal-table ${outside ? 'yoy-costing-table' : 'drawer-table'}`} size="sm">
                            <thead>
                                <tr>
                                    {<th style={{ minWidth: '140px' }}>{`Year`}</th>}
                                    {<th>{`Y1`}</th>}
                                    {<th>{`Y2`}</th>}
                                    {<th>{`Y3`}</th>}
                                    {<th>{`Y4`}</th>}
                                    {<th>{`Y5`}</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {/* Map over the table data and display the rows */}
                                {tableData &&
                                    tableData.map((item, index) => {
                                        return (
                                            <Fragment>
                                                <tr key={index}>
                                                    <td>{item.Heading}</td>
                                                    {/* If the index is not 1, display the value from the table data */}
                                                    {index !== 1 ? < td > {checkForDecimalAndNull(item.Y1, getConfigurationKey().NoOfDecimalForPrice)}</td> :
                                                        <td>  <TextFieldHookForm
                                                            label={false}
                                                            name={'Y1'}
                                                            Controller={Controller}
                                                            control={control}
                                                            register={register}
                                                            mandatory={false}
                                                            handleChange={(e) => handleChangeYears(e)}
                                                            rules={{
                                                                required: true,
                                                                validate: { number, checkWhiteSpaces },
                                                                max: {
                                                                    value: 100,
                                                                    message: 'Percentage cannot be greater than 100'
                                                                }
                                                            }}
                                                            defaultValue={''}
                                                            className=""
                                                            customClassName={`withBorder mb-0 ${outside ? 'ml-n2' : ''}`}
                                                            errors={errors.Y1}
                                                            disabled={outside ? true : false}
                                                        /></td>
                                                    }
                                                    {index !== 1 ? < td > {checkForDecimalAndNull(item.Y2, getConfigurationKey().NoOfDecimalForPrice)}</td> :
                                                        <td>  <TextFieldHookForm
                                                            label={false}
                                                            name={'Y2'}
                                                            Controller={Controller}
                                                            control={control}
                                                            register={register}
                                                            mandatory={false}
                                                            rules={{
                                                                required: true,
                                                                validate: { number, checkWhiteSpaces },
                                                                max: {
                                                                    value: 100,
                                                                    message: 'Percentage cannot be greater than 100'
                                                                }
                                                            }}
                                                            handleChange={(e) => handleChangeYears(e)}
                                                            defaultValue={''}
                                                            className=""
                                                            customClassName={`withBorder mb-0 ${outside ? 'ml-n2' : ''}`}
                                                            errors={errors.Y2}
                                                            disabled={outside ? true : false}
                                                        /></td>
                                                    }
                                                    {index !== 1 ? < td > {checkForDecimalAndNull(item.Y3, getConfigurationKey().NoOfDecimalForPrice)}</td> :
                                                        <td>  <TextFieldHookForm
                                                            label={false}
                                                            name={'Y3'}
                                                            Controller={Controller}
                                                            control={control}
                                                            register={register}
                                                            mandatory={false}
                                                            rules={{
                                                                required: true,
                                                                validate: { number, checkWhiteSpaces },
                                                                max: {
                                                                    value: 100,
                                                                    message: 'Percentage cannot be greater than 100'
                                                                }
                                                            }}
                                                            handleChange={(e) => handleChangeYears(e)}
                                                            defaultValue={''}
                                                            className=""
                                                            customClassName={`withBorder mb-0 ${outside ? 'ml-n2' : ''}`}
                                                            errors={errors.Y3}
                                                            disabled={outside ? true : false}
                                                        /></td>
                                                    }
                                                    {index !== 1 ? < td > {checkForDecimalAndNull(item.Y4, getConfigurationKey().NoOfDecimalForPrice)}</td> :
                                                        <td>  <TextFieldHookForm
                                                            label={false}
                                                            name={'Y4'}
                                                            Controller={Controller}
                                                            control={control}
                                                            register={register}
                                                            mandatory={false}
                                                            rules={{
                                                                required: true,
                                                                validate: { number, checkWhiteSpaces },
                                                                max: {
                                                                    value: 100,
                                                                    message: 'Percentage cannot be greater than 100'
                                                                }
                                                            }}
                                                            handleChange={(e) => handleChangeYears(e)}
                                                            defaultValue={''}
                                                            className=""
                                                            customClassName={`withBorder mb-0 ${outside ? 'ml-n2' : ''}`}
                                                            errors={errors.Y4}
                                                            disabled={outside ? true : false}
                                                        /></td>
                                                    }
                                                    {index !== 1 ? < td > {checkForDecimalAndNull(item.Y5, getConfigurationKey().NoOfDecimalForPrice)}</td> :
                                                        <td>  <TextFieldHookForm
                                                            label={false}
                                                            name={'Y5'}
                                                            Controller={Controller}
                                                            control={control}
                                                            register={register}
                                                            mandatory={false}
                                                            rules={{
                                                                required: true,
                                                                validate: { number, checkWhiteSpaces },
                                                                max: {
                                                                    value: 100,
                                                                    message: 'Percentage cannot be greater than 100'
                                                                }
                                                            }}
                                                            handleChange={(e) => handleChangeYears(e)}
                                                            defaultValue={''}
                                                            className=""
                                                            customClassName={`withBorder mb-0 ${outside ? 'ml-n2' : ''}`}
                                                            errors={errors.Y5}
                                                            disabled={outside ? true : false}
                                                        /></td>
                                                    }
                                                </tr>
                                            </Fragment>
                                        )
                                    })}
                                {
                                    tableData && tableData.length === 0 && (
                                        <tr>
                                            <td colspan="15">
                                                <NoContentFound title={EMPTY_DATA} />
                                            </td>
                                        </tr>
                                    )
                                }
                            </tbody >

                        </Table >
                    </form >

                </Col >
            </Row >
            {/* {yoyDrawerOpen && <AddYOYCost
                anchor="right"
                isOpen={yoyDrawerOpen}
                NetPOPrice={props?.NetPOPrice}
                tableData={tableData}
                openCloseYOYDrawer={openCloseYOYDrawer}
                errors={errors}
                activeTab={props.activeTab}
            />} */}
        </Fragment >
    )
}
export default React.memo(YOYCost)