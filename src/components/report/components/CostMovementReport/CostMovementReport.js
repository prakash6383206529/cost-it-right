import { AgGridColumn, AgGridReact } from "ag-grid-react"
import React from "react"
import { useEffect } from "react"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useDispatch } from "react-redux"
import { reactLocalStorage } from "reactjs-localstorage"
import { Col, Row } from "reactstrap"
import { EMPTY_DATA, searchCount } from "../../../../config/constants"
import { MESSAGES } from "../../../../config/message"
import { loggedInUserId } from "../../../../helper"
import { autoCompleteDropdown } from "../../../common/CommonFunctions"
import DayTime from "../../../common/DayTimeWrapper"
import LoaderCustom from "../../../common/LoaderCustom"
import NoContentFound from "../../../common/NoContentFound"
import Toaster from "../../../common/Toaster"
import { getCostingSpecificTechnology, getPartInfo } from "../../../costing/actions/Costing"
import { AsyncSearchableSelectHookForm, DatePickerHookForm, SearchableSelectHookForm } from "../../../layout/HookFormInputs"
import { getRevisionNoFromPartId } from "../../actions/ReportListing"
import CostMovementGraph from "./CostMovementGraph"
import { getPartSelectList } from '../../../masters/actions/Part'

const gridOptions = {}
function CostMovementReport(props) {

    const [gridApi, setGridApi] = useState(null)
    const [gridColumnApi, setGridColumnApi] = useState(null)
    const [partName, setpartName] = useState('')
    const [revisionNo, setRevisionNo] = useState([])
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [revisionNoArray, setRevisionNoArray] = useState([])
    const [disableRunReportButton, setDisableRunReportButton] = useState(true)
    const [reportListing, setReportListing] = useState(true)
    const [graphListing, setGraphListing] = useState(false)
    const [isEditFlag, setIsEditFlag] = useState(false);
    const [partList, setPartList] = useState([])
    const [updateButtonPartNoTable, setUpdateButtonPartNoTable] = useState(false)
    const [selectedRowPartNoTable, setSelectedRowPartNoTable] = useState({})
    const [minDate, setMinDate] = useState('')
    const [maxDate, setMaxDate] = useState('')

    const dispatch = useDispatch()

    const { control, register, getValues, setValue, formState: { errors } } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    })

    useEffect(() => {
        dispatch(getCostingSpecificTechnology(loggedInUserId(), () => { }))
        dispatch(getPartInfo('', () => { }))

    }, [])


    const handleFromEffectiveDateChange = (value) => {
        if (value) {
            setStartDate(DayTime(value).format('DD/MM/YYYY'))
            setMinDate(value)
        }
    }


    const handleToEffectiveDateChange = (value) => {
        if (value) {
            setEndDate(DayTime(value).format('DD/MM/YYYY'))
            setMaxDate(value)
        }
    }

    const renderListing = (label) => {
        const temp = []
        if (label === 'Revision') {
            revisionNoArray && revisionNoArray.map((item) => {
                if (item.Value === '0') return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            })
            return temp
        }
    }

    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: false,
        headerCheckboxSelectionFilteredOnly: true,
    };
    const onGridReady = (params) => {
        setGridApi(params.api)
        params.api.sizeColumnsToFit();
        setGridColumnApi(params.columnApi)
        params.api.paginationGoToPage(0);
    }


    const buttonFormatter = (props) => {
        return (
            <>
                {< button title='Edit' className="Edit mr-2 align-middle" disabled={false} type={'button'} onClick={() => editItemPartTable(props?.agGridReact?.gridOptions.rowData, props)} />}
                {<button title='Delete' className="Delete align-middle" disabled={false} type={'button'} onClick={() => deleteItemPartTable(props?.agGridReact?.gridOptions.rowData, props)} />}
            </>
        )
    };


    const editItemPartTable = (gridData, props) => {

        setSelectedRowPartNoTable(props.node.data)
        setUpdateButtonPartNoTable(true)
        setValue('partNumber', { label: props?.node?.data?.PartNo, value: props?.node?.data?.PartId })
        setValue('Revision', { label: props?.node?.data?.RevisionNo, value: props?.node?.data?.RevisionId })

    }

    const deleteItemPartTable = (gridData, props) => {

        let arr = []
        gridData && gridData.map((item) => {

            if (item?.PartId !== props?.node?.data?.PartId) {
                arr.push(item)
            }
        })

        if (arr.length === 0) {
            setDisableRunReportButton(true)
        } else {
            setDisableRunReportButton(false)
        }
        setPartList(arr)
        onResetPartNoTable()
    }


    const handleRevisionChange = (newValue) => {

        if (newValue && newValue !== '') {
            setRevisionNo(newValue)
        }
    }

    const handlePartChange = (newValue) => {

        if (newValue && newValue !== '') {
            dispatch(getRevisionNoFromPartId(newValue.value, (res) => {
                if (res?.data) {
                    setRevisionNoArray(res.data.SelectList)
                }
            }))
        }
        setValue('Revision', "")
    }


    const filterList = async (inputValue) => {

        const resultInput = inputValue.slice(0, 3)
        if (inputValue?.length >= searchCount && partName !== resultInput) {
            const res = await getPartSelectList(1, resultInput);
            setpartName(resultInput)
            let partDataAPI = res?.data?.SelectList
            reactLocalStorage.setObject('PartData', partDataAPI)
            let partData = []
            if (inputValue) {
                partData = reactLocalStorage.getObject('PartData')
                return autoCompleteDropdown(inputValue, partData)

            } else {
                return partData
            }
        }
        else {
            if (inputValue?.length < searchCount) return false
            else {
                let partData = reactLocalStorage.getObject('PartData')
                if (inputValue) {
                    partData = reactLocalStorage.getObject('PartData')
                    return autoCompleteDropdown(inputValue, partData)
                } else {
                    return partData
                }
            }
        }
    }

    const frameworkComponents = {
        customNoRowsOverlay: NoContentFound,
        buttonFormatter: buttonFormatter,

    };
    const runReport = () => {

        setReportListing(false)
        setGraphListing(true)

    }

    const addRowPartNoTable = () => {

        let isDuplicateEntry = false
        let obj = {}

        obj.PartNo = getValues('partNumber')?.label
        obj.PartId = getValues('partNumber')?.value
        obj.RevisionNo = getValues('Revision')?.label ? getValues('Revision')?.label : '-'
        obj.RevisionId = getValues('Revision')?.value ? getValues('Revision')?.value : ''

        if (!updateButtonPartNoTable) {
            partList && partList.map((item) => {
                if (item.PartNo === obj.PartNo && item.RevisionNo === obj.RevisionNo) {
                    isDuplicateEntry = true
                }
            })
        }

        if (isDuplicateEntry) {
            Toaster.warning("This part no is already added.")
            return false;
        }

        if (obj.PartId === null || obj.PartId === undefined) {
            Toaster.warning("Please enter part no.")
            return false;
        }

        let arr = [...partList, obj]

        if (updateButtonPartNoTable) {   //EDIT CASE
            arr = []
            partList && partList.map((item) => {
                if (JSON.stringify(selectedRowPartNoTable) === JSON.stringify(item)) {
                    return false
                } else {
                    arr.push(item)
                }
            })

            arr.map((item) => {
                if (item.PartNo === obj.PartNo) {
                    isDuplicateEntry = true
                }
            })

            if (isDuplicateEntry) {
                Toaster.warning("This part no is already added.")
                return false;
            }

            arr.push(obj)
        }

        setPartList(arr)
        if (arr.length > 0) {
            setDisableRunReportButton(false)
        }
        setValue('partNumber', "")
        setValue('Revision', "")
        setUpdateButtonPartNoTable(false)

    }

    const onResetPartNoTable = () => {
        setUpdateButtonPartNoTable(false)
        setValue('partNumber', "")
        setValue('Revision', "")
    }

    const closeGraph = () => {
        setReportListing(true)
        setGraphListing(false)
    }


    return (

        <>{reportListing &&
            <div className="container-fluid">
                <form noValidate className="cost-ratio-report">
                    <h1 className="mb-0">Cost Movement Report</h1>
                    {false && <LoaderCustom message={MESSAGES.DOWNLOADING_MESSAGE} customClass="loader-center mt-n2" />}
                    <Row className="pt-2 mb-5">
                        <div className="form-group mb-0 col-md-3">
                            <div className="inputbox date-section">
                                <DatePickerHookForm
                                    name={`fromDate`}
                                    label={'From Date'}
                                    handleChange={(date) => {
                                        handleFromEffectiveDateChange(date);
                                    }}
                                    rules={{ required: false }}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    showMonthDropdown
                                    showYearDropdown
                                    dateFormat="DD/MM/YYYY"
                                    dropdownMode="select"
                                    maxDate={maxDate}
                                    placeholderText="Select date"
                                    customClassName="withBorder"
                                    className="withBorder"
                                    autoComplete={"off"}
                                    disabledKeyboardNavigation
                                    onChangeRaw={(e) => e.preventDefault()}
                                    disabled={false}
                                    mandatory={false}
                                    errors={errors && errors.fromDate}
                                />
                            </div>
                        </div>
                        <div className="form-group mb-0 col-md-3">
                            <div className="inputbox date-section">
                                <DatePickerHookForm
                                    name={`toDate`}
                                    label={'To Date'}
                                    handleChange={(date) => {
                                        handleToEffectiveDateChange(date);
                                    }}
                                    rules={{ required: false }}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    showMonthDropdown
                                    showYearDropdown
                                    dateFormat="DD/MM/YYYY"
                                    minDate={minDate}
                                    dropdownMode="select"
                                    placeholderText="Select date"
                                    customClassName="withBorder"
                                    className="withBorder"
                                    autoComplete={"off"}
                                    disabledKeyboardNavigation
                                    onChangeRaw={(e) => e.preventDefault()}
                                    disabled={false}
                                    mandatory={false}
                                    errors={errors && errors.toDate}
                                />
                            </div>
                        </div>
                    </Row>


                    <Row className="part-detail-wrapper">
                        <Col md="3">
                            <AsyncSearchableSelectHookForm
                                label={"Part No"}
                                name={"partNumber"}
                                placeholder={"Select"}
                                Controller={Controller}
                                control={control}
                                rules={{ required: false }}
                                register={register}
                                //defaultValue={DestinationPlant.length !== 0 ? DestinationPlant : ""}
                                options={renderListing("partNo")}
                                mandatory={true}
                                // handleChange={handleDestinationPlantChange}
                                handleChange={handlePartChange}
                                errors={errors.partNumber}
                                disabled={false}
                                // isLoading={plantLoaderObj}
                                asyncOptions={filterList}
                                NoOptionMessage={"Enter 3 characters to show data"}
                            />
                        </Col>

                        <Col md="3">
                            <SearchableSelectHookForm
                                label={"Revision Number"}
                                name={"Revision"}
                                placeholder={"Select"}
                                Controller={Controller}
                                control={control}
                                rules={{ required: false }}
                                register={register}
                                //   defaultValue={technology.length !== 0 ? technology : ""}
                                options={renderListing("Revision")}
                                mandatory={false}
                                handleChange={handleRevisionChange}
                                errors={errors.revision}
                                disabled={false}
                            />
                        </Col>

                        <Col md="4" className='d-flex align-items-center mt-2 pt-1'>
                            <button
                                type="button"
                                className={'user-btn pull-left ml-2'}
                                onClick={() => addRowPartNoTable()}
                                disabled={isEditFlag}
                            >
                                <div className={'plus'}></div>{!updateButtonPartNoTable ? "ADD" : "UPDATE"}
                            </button>
                            <button
                                onClick={onResetPartNoTable} // Need to change this cancel functionality
                                type="submit"
                                value="CANCEL"
                                className="reset ml-10 ml-2"
                                disabled={isEditFlag}
                            >
                                <div className={''}></div>
                                RESET
                            </button>
                        </Col>
                    </Row>
                    <div>
                        {true && <div className={`ag-grid-react`}>
                            <Row>
                                <Col>
                                    <div className={`ag-grid-wrapper border-bottom height-width-wrapper ${partList && partList.length <= 0 ? "overlay-contain" : ""} `}>

                                        <div className={`ag-theme-material`}>
                                            <AgGridReact
                                                defaultColDef={defaultColDef}
                                                floatingFilter={true}
                                                domLayout='autoHeight'
                                                // columnDefs={c}
                                                rowData={partList}
                                                //pagination={true}
                                                paginationPageSize={10}
                                                onGridReady={onGridReady}
                                                gridOptions={gridOptions}
                                                noRowsOverlayComponent={'customNoRowsOverlay'}
                                                noRowsOverlayComponentParams={{
                                                    title: EMPTY_DATA,
                                                    imagClass: 'imagClass'
                                                }}
                                                frameworkComponents={frameworkComponents}
                                            >
                                                <AgGridColumn width={"230px"} field="PartNo" headerName="Part No" ></AgGridColumn>
                                                <AgGridColumn width={"230px"} field="PartId" headerName="PartId" hide={true} ></AgGridColumn>
                                                <AgGridColumn width={"230px"} field="RevisionNo" headerName="Revision No." cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                                <AgGridColumn width={"230px"} field="RevisionId" headerName="Revision Id." hide={true} cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                                <AgGridColumn width={"190px"} field="PartId" headerName="Action" floatingFilter={false} type="rightAligned" cellRenderer={'buttonFormatter'}></AgGridColumn>
                                            </AgGridReact>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                        }
                    </div>

                </form>

                <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                    <div className="col-sm-12 text-right bluefooter-butn mt-3">
                        <div className="d-flex justify-content-end bd-highlight w100 my-2 align-items-center">
                            <button type="button" className={"user-btn save-btn"} disabled={disableRunReportButton} onClick={runReport}> <div className={"Run-icon"}></div>RUN REPORT</button>
                        </div>
                    </div>
                </Row>
            </div >}

            {graphListing &&
                <CostMovementGraph fromDate={startDate} toDate={endDate} tableData={partList} closeDrawer={closeGraph} />


            }
        </>

    )
}
export default CostMovementReport