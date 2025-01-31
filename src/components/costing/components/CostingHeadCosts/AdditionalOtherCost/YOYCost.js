import React, { Fragment, useState, useEffect } from 'react'
import { Row, Col, Table } from 'reactstrap'
import NoContentFound from '../../../../common/NoContentFound'
import { EMPTY_DATA } from '../../../../../config/constants'
// import AddYOYCost from './AddYOYCost'
import { Controller } from "react-hook-form";
import { TextFieldHookForm } from '../../../../../components/layout/HookFormInputs'
import { checkForDecimalAndNull, checkForNull, checkWhiteSpaces, getConfigurationKey, number, percentageOfNumber } from '../../../../../helper'
import { useDispatch, useSelector } from 'react-redux'
import { getYOYCostList, setYOYCostGrid } from '../../../actions/Costing'
import Toaster from '../../../../common/Toaster'
import _ from 'lodash'
import LoaderCustom from '../../../../common/LoaderCustom'
// import AddYOYCost from './AddYOYCost';

function YOYCost(props) {
    const { outside, patId, vendorId, hideAddButton } = props;
    const [tableData, setTableData] = useState([])
    const [oldData, setOldData] = useState([])
    const [yoyDrawerOpen, setYoyDrawerOpen] = useState(false)
    const [loader, setLoader] = useState(outside ? true : false)
    const [year, setYear] = useState(outside ? {} : props?.year)
    const { setValue, getValues, control, errors, register } = props
    const { yoyCostGrid } = useSelector(state => state.costing)
    // const { quotationIdForRFQ } = useSelector(state => state?.RFQ)
    const dispatch = useDispatch()

    useEffect(() => {

        if (outside && props?.isRfqCosting) {

            let requestObject = {
                quotationId: props?.quotationId,
                partId: patId,
                vendorId: vendorId
            }

            // set data from api
            // Define initial data sets
            let tempDataYear1_5_One = {}
            let tempDataYear1_5_Two = {}
            let tempDataYear1_5_Three = {}
            let tempDataYear1_5_Four = {}
            let tempDataYear1_5_Five = {}
            let yearName = {}

            dispatch(getYOYCostList(requestObject, (res) => {
                setLoader(false)
                _.map(res?.data?.Data?.yoyResponseDetails, (item, index) => {
                    yearName[`Y${index + 1}`] = item.YearName ? item.YearName : 0
                    tempDataYear1_5_One[`Y${index + 1}`] = item.Quantity ? item.Quantity : 0
                    tempDataYear1_5_Two[`Y${index + 1}`] = item.DiscountPercent ? item.DiscountPercent : 0
                    tempDataYear1_5_Four[`Y${index + 1}`] = item.NetCostPerPiece ? item.NetCostPerPiece : 0
                    // tempDataYear1_5_Four[`Y${index + 1}`] = item.RemainingCost ? item.RemainingCost : 0
                    tempDataYear1_5_Five[`Y${index + 1}`] = item.Discount ? item.Discount : 0
                    tempDataYear1_5_Four[`Y${index + 1}`] = item.NetCostPerPiece ? item.NetCostPerPiece : 0
                });

                // Define initial array of data objects
                let tempData = [
                    { Heading: "Forecast Quantity" },
                    { Heading: "YOY Discount(%)" },
                    { Heading: "Discount" },
                    { Heading: "Effective Price/Yr" },
                    // { Heading: "Net Cost / Pc" },
                ]

                // Map through tempData array and modify each object with the appropriate data
                let finalList = tempData.map(item => {
                    switch (item.Heading) {
                        case 'Forecast Quantity':
                            return { ...item, ...tempDataYear1_5_One }
                        case 'YOY Discount(%)':
                            return { ...item, ...tempDataYear1_5_Two }
                        case 'Discount':
                            return { ...item, ...tempDataYear1_5_Five }
                        case 'Effective Price/Yr':
                        case 'Net Cost / Pc':
                            return { ...item, ...tempDataYear1_5_Four }
                        // case 'Net Cost / Pc':
                        //     return { ...item, ...tempDataYear1_5_Three }
                        default:
                            return item
                    }
                })
                // Set state variables with modified data
                setYear(yearName)
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

    const removeAllData = () => {
        if (checkForNull(getValue("Y1")) === 0) {
            setValue("Y2", 0)
            setValue("Y3", 0)
            setValue("Y4", 0)
            setValue("Y5", 0)
        } else if (checkForNull(getValue("Y2")) === 0) {
            setValue("Y3", 0)
            setValue("Y4", 0)
            setValue("Y5", 0)
        } else if (checkForNull(getValue("Y3")) === 0) {
            setValue("Y4", 0)
            setValue("Y5", 0)
        } else if (checkForNull(getValue("Y4")) === 0) {
            setValue("Y5", 0)
        }
    }

    const handleChangeYears = (e) => {
        // Delay the execution of the function to allow time for other updates to complete
        setTimeout(() => {
            // Create a copy of the current table data to avoid modifying the original
            const tempList = [...tableData];
            // Get the two objects representing the first two rows of the table
            const [object1, object3, object2] = tempList.slice(1, 4);

            // A helper function to calculate the percentage of the NetPOPrice for a given year
            const percentOfNetPOPrice = (NetPOPrice, year) => {
                return percentageOfNumber(NetPOPrice, getValue(year));
            };
            removeAllData()
            // Update the values of object1 based on the form input
            const updatedObject1 = {
                ...object1, Y1: getValue("Y1"),
                Y2: getValue("Y2"),
                Y3: getValue("Y3"),
                Y4: getValue("Y4"),
                Y5: getValue("Y5"),
            };
            let updatedObject2 = { ...object2 }
            let updatedObject3 = { ...object3 }
            let remainingCost = props?.NetPOPrice
            for (let i = 1; i < Object.keys(updatedObject1)?.length; i++) {
                updatedObject3[`Y${i}`] = percentOfNetPOPrice(checkForNull(remainingCost), `Y${i}`)

                if (getValue(`Y${i}`) > 100) {
                    updatedObject2[`Y${i}`] = percentOfNetPOPrice(0, `Y${i}`)
                    remainingCost = 0
                } else {
                    updatedObject2[`Y${i}`] = checkForNull(remainingCost) - percentOfNetPOPrice(checkForNull(remainingCost), `Y${i}`)
                    remainingCost = checkForNull(remainingCost) - percentOfNetPOPrice(checkForNull(remainingCost), `Y${i}`)
                }

            }

            // Update the table data with the updated objects
            const updatedTempList = Object.assign([...tempList], { [1]: updatedObject1 }, { [2]: updatedObject3 }, { [3]: updatedObject2 });
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
                {outside && !hideAddButton && !props.viewMode &&
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
                                    {<th>{year?.Y1}</th>}
                                    {<th>{year?.Y2}</th>}
                                    {<th>{year?.Y3}</th>}
                                    {<th>{year?.Y4}</th>}
                                    {<th>{year?.Y5}</th>}
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
                                                            id={props.outside ? "" : "yoyCostInput1"}
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
                                                            customClassName={`withBorder mb-0 ${outside ? 'ml-n2 min-h-auto' : ''}`}
                                                            errors={errors.Y1}
                                                            disabled={outside ? true : false}
                                                        /></td>
                                                    }
                                                    {index !== 1 ? < td > {checkForDecimalAndNull(item.Y2, getConfigurationKey().NoOfDecimalForPrice)}</td> :
                                                        <td className={getValues("Y2") === 0 ? "error-none" : ""}>  <TextFieldHookForm
                                                            label={false}
                                                            name={'Y2'}
                                                            id={props.outside ? "" : "yoyCostInput2"}
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
                                                            disabled={outside || Number(getValues("Y1")) === 0 ? true : false}
                                                        /></td>
                                                    }
                                                    {index !== 1 ? < td > {checkForDecimalAndNull(item.Y3, getConfigurationKey().NoOfDecimalForPrice)}</td> :
                                                        <td className={getValues("Y3") === 0 ? "error-none" : ""}>  <TextFieldHookForm
                                                            label={false}
                                                            name={'Y3'}
                                                            id={props.outside ? "" : "yoyCostInput3"}
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
                                                            disabled={outside || Number(getValues("Y2")) === 0 ? true : false}
                                                        /></td>
                                                    }
                                                    {index !== 1 ? < td > {checkForDecimalAndNull(item.Y4, getConfigurationKey().NoOfDecimalForPrice)}</td> :
                                                        <td className={getValues("Y4") === 0 ? "error-none" : ""}>  <TextFieldHookForm
                                                            label={false}
                                                            name={'Y4'}
                                                            id={props.outside ? "" : "yoyCostInput4"}
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
                                                            disabled={outside || Number(getValues("Y3")) === 0 ? true : false}
                                                        /></td>
                                                    }
                                                    {index !== 1 ? < td > {checkForDecimalAndNull(item.Y5, getConfigurationKey().NoOfDecimalForPrice)}</td> :
                                                        <td className={getValues("Y5") === 0 ? "error-none" : ""}>  <TextFieldHookForm
                                                            label={false}
                                                            name={'Y5'}
                                                            id={props.outside ? "" : "yoyCostInput5"}
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
                                                            disabled={outside || Number(getValues("Y4")) === 0 ? true : false}
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
                year={year}
            />} */}
        </Fragment >
    )
}
export default React.memo(YOYCost)