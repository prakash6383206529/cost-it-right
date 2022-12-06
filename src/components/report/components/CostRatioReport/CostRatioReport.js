import { AgGridColumn, AgGridReact } from "ag-grid-react"
import _ from "lodash"
import React from "react"
import { useEffect } from "react"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useSelector, useDispatch } from "react-redux"
import { reactLocalStorage } from "reactjs-localstorage"
import { Col, Row } from "reactstrap"
import { getPlantSelectListByType } from "../../../../actions/Common"
import { defaultPageSize, EMPTY_DATA, searchCount, ZBC } from "../../../../config/constants"
import { MESSAGES } from "../../../../config/message"
import { loggedInUserId } from "../../../../helper"
import { autoCompleteDropdown } from "../../../common/CommonFunctions"
import DayTime from "../../../common/DayTimeWrapper"
import LoaderCustom from "../../../common/LoaderCustom"
import NoContentFound from "../../../common/NoContentFound"
import Toaster from "../../../common/Toaster"
import { checkPartWithTechnology, getCostingSpecificTechnology, getPartCostingVendorSelectList, getPartInfo, getPartSelectListByTechnology } from "../../../costing/actions/Costing"
import { AsyncSearchableSelectHookForm, DatePickerHookForm, SearchableSelectHookForm } from "../../../layout/HookFormInputs"
import { getRevisionNoFromPartId } from "../../actions/ReportListing"
import CostRatioListing from "./CostRatioListing"


const gridOptions = {}
function CostRatioReport(props) {

    const [gridApi, setGridApi] = useState(null)
    const [gridColumnApi, setGridColumnApi] = useState(null)
    const [rowData, setRowData] = useState([])
    const [technology, setTechnology] = useState([])
    const [partName, setpartName] = useState('')
    const [part, setPart] = useState([]);
    const [plant, setPlant] = useState([]);
    const [revision, setRevision] = useState([]);
    const [IsTechnologySelected, setIsTechnologySelected] = useState(false);
    const [showRatioListing, setShowRatioListing] = useState(false)
    const [vendor, setVendor] = useState([])
    const [fromDate, setFromDate] = useState('')
    const [toDate, setToDate] = useState('')
    const [minDate, setMinDate] = useState('')
    const [maxDate, setMaxDate] = useState('')
    const [costRatioGridData, setCostRatioGridData] = useState({})

    const dispatch = useDispatch()

    const technologySelectList = useSelector((state) => state.costing.costingSpecifiTechnology)
    const vendorSelectList = useSelector((state) => state.costing.costingVendorList)
    const DestinationplantSelectList = useSelector(state => state.comman.plantSelectList);


    const { handleSubmit, control, register, getValues, setValue, formState: { errors } } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    })


    useEffect(() => {
        dispatch(getCostingSpecificTechnology(loggedInUserId(), () => { }))
        dispatch(getPartInfo('', () => { }))

        // dispatch(getPartCostingVendorSelectList(partNo.value !== undefined ? partNo.value : partNo.partId, () => { }))
    }, [])


    const onSubmit = () => {
        let obj = {}
        let isDuplicateEntry = false;
        obj.TechnologyId = getValues('Technology')?.value
        obj.PartId = getValues('Part')?.value
        obj.RevisionNumber = getValues('Revision')?.label ? getValues('Revision')?.label : ''
        obj.VendorId = getValues('Vendor')?.value
        obj.PlantId = getValues('Plant')?.value
        obj.TechnologyName = getValues('Technology')?.label
        obj.PartNo = getValues('Part')?.label
        obj.ShowRevisionNumber = getValues('Revision')?.label ? getValues('Revision')?.label : '-'
        obj.Vendor = getValues('Vendor')?.label ? getValues('Vendor')?.label : '-'
        obj.Plant = getValues('Plant')?.label ? getValues('Plant')?.label : '-'


        rowData && rowData.map((item) => {
            if (item.TechnologyId === obj.TechnologyId && item.PartId === obj.PartId && item.RevisionNumber === obj.RevisionNumber && item.VendorId === obj.VendorId && item.PlantId === obj.PlantId) {
                isDuplicateEntry = true
            }
        })
        if (isDuplicateEntry) {
            Toaster.warning("This data is already exist in the row.")
            return false
        }

        let arr = [...rowData, obj];
        setRowData(arr)

    }
    const handleFromDate = (value) => {
        setMinDate(value)
        setFromDate(value)
    }
    const handleToDate = (value) => {
        setMaxDate(value)
        setToDate(value)
    }
    const renderListing = (label) => {
        const temp = []

        if (label === 'Technology') {
            technologySelectList && technologySelectList.map((item) => {


                if (item.Value === '0') return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            })
            return temp
        }
        if (label === 'Vendor') {
            vendorSelectList && vendorSelectList.map((item) => {
                if (item.Value === '0') return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            })
            return temp
        }
        if (label === 'Plant') {
            DestinationplantSelectList && DestinationplantSelectList.map((item) => {
                if (item.PlantId === '0') return false
                temp.push({ label: item.PlantNameCode, value: item.PlantId })
                return null
            })
            return temp
        }
        if (label === 'Revision') {
            revision && revision.map((item) => {
                if (item.PlantId === '0') return false
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

    const handleTechnologyChange = (newValue) => {
        if (newValue && newValue !== '') {
            setTechnology(newValue)
            setIsTechnologySelected(true)
            setPart([])
            setVendor([])
            setPlant([])
            setRevision([])
            dispatch(getPartInfo('', () => { }))
            setValue('Part', '')
            setValue('Revision', '')
            setValue('Vendor', '')
            setValue('Plant', '')
        } else {
            setTechnology([])
            setIsTechnologySelected(false)
        }
        reactLocalStorage.setObject('PartData', [])
    }
    const handlePartChange = (newValue) => {
        if (newValue && newValue !== '') {
            if (IsTechnologySelected) {
                const data = { TechnologyId: technology.value, PartId: newValue.value }
                dispatch(checkPartWithTechnology(data, (response) => {
                    setPart(newValue)
                    if (response.data.Result) {

                        dispatch(getPartCostingVendorSelectList(newValue.value, () => { }))
                        dispatch(getPlantSelectListByType(ZBC, () => { }))
                        dispatch(getRevisionNoFromPartId(newValue.value, (res) => {
                            let Data = res && res.data && res.data.SelectList
                            setRevision(Data)
                        }))

                    } else {
                        dispatch(getPartInfo('', () => { }))
                    }
                }),
                )
            }
        } else {
            setPart([])
            dispatch(getPartInfo('', () => { }))
        }
    }
    const handleVendorChange = (value) => {
        setVendor(value)
    }

    const plantHandleChange = (value) => {
        setPlant(value)
    }
    const filterList = async (inputValue) => {

        const resultInput = inputValue.slice(0, 3)
        if (inputValue?.length >= searchCount && partName !== resultInput) {
            //   setInputLoader(true)
            const res = await getPartSelectListByTechnology(technology.value, resultInput);
            //   setInputLoader(false)
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
    const deleteItemFromTable = (gridData, props) => {
        let arr = []
        gridData && gridData.map((item) => {

            if (item?.PartId !== props?.node?.data?.PartId) {
                arr.push(item)
            }
        })
        setRowData(arr)
    }
    const buttonFormatter = (props) => {
        return (
            <>
                {<button title='Delete' className="Delete align-middle" type={'button'} onClick={() => deleteItemFromTable(props?.agGridReact?.gridOptions.rowData, props)} />}
            </>
        )
    };
    const frameworkComponents = {
        customNoRowsOverlay: NoContentFound,
        buttonFormatter: buttonFormatter,

    };

    const resetData = () => {
        setPart([])
        setTechnology([])
        setVendor([])
        setPlant([])
        setRevision([])
        dispatch(getPartInfo('', () => { }))
        setValue('Technology', '')
        setValue('Part', '')
        setValue('Revision', '')
        setValue('Vendor', '')
        setValue('Plant', '')
    }

    const runReport = () => {
        if (rowData.length === 0) {
            Toaster.warning("Please add atleast one row")
        } else {
            setShowRatioListing(true)
            setCostRatioGridData(
                {
                    fromDate: fromDate,
                    toDate: toDate,
                    rowData: rowData
                }
            )
            setValue('Technology', '')
            setValue('Part', '')
            setValue('Revision', '')
            setValue('Vendor', '')
            setValue('Plant', '')

        }
    }
    const viewListingHandler = (value) => {
        setShowRatioListing(value)

    }

    return (
        <>
            {!showRatioListing && <div className="container-fluid ag-grid-react">
                <div className="cost-ratio-report">
                    <h1 className="mb-0">Cost Ratio Report</h1>
                    <form onSubmit={handleSubmit(onSubmit)} noValidate>
                        {false && <LoaderCustom message={MESSAGES.DOWNLOADING_MESSAGE} customClass="loader-center mt-n2" />}

                        <Row className="pt-2 mb-5">
                            <div className="form-group mb-0 col-md-3">
                                <div className="inputbox date-section">
                                    <DatePickerHookForm
                                        name={`fromDate`}
                                        label={'From Date'}
                                        selected={fromDate !== "" ? DayTime(fromDate).format('DD/MM/YYYY') : ""}
                                        handleChange={(date) => {
                                            handleFromDate(date);
                                        }}
                                        rules={{ required: true }}
                                        maxDate={maxDate}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        showMonthDropdown
                                        showYearDropdown
                                        dateFormat="DD/MM/YYYY"
                                        dropdownMode="select"
                                        placeholder="Select date"
                                        customClassName="withBorder"
                                        className="withBorder"
                                        autoComplete={"off"}
                                        disabledKeyboardNavigation
                                        onChangeRaw={(e) => e.preventDefault()}
                                        // disabled={rowData.length !== 0}
                                        mandatory={true}
                                        errors={errors && errors.fromDate}
                                    />
                                </div>
                            </div>
                            <div className="form-group mb-0 col-md-3">
                                <div className="inputbox date-section">
                                    <DatePickerHookForm
                                        name={`toDate`}
                                        label={'To Date'}
                                        selected={toDate !== "" ? DayTime(toDate).format('DD/MM/YYYY') : ""}
                                        handleChange={(date) => {
                                            handleToDate(date);
                                        }}
                                        minDate={minDate}
                                        rules={{ required: true }}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        showMonthDropdown
                                        showYearDropdown
                                        dateFormat="DD/MM/YYYY"
                                        dropdownMode="select"
                                        placeholder="Select date"
                                        customClassName="withBorder"
                                        className="withBorder"
                                        autoComplete={"off"}
                                        disabledKeyboardNavigation
                                        onChangeRaw={(e) => e.preventDefault()}
                                        // disabled={rowData.length !== 0}
                                        mandatory={true}
                                        errors={errors && errors.toDate}
                                    />
                                </div>
                            </div>
                        </Row>
                        <Row>
                            <Col md="3">
                                <SearchableSelectHookForm
                                    label={"Technology"}
                                    name={"Technology"}
                                    placeholder={"Select"}
                                    Controller={Controller}
                                    control={control}
                                    rules={{ required: true }}
                                    register={register}
                                    defaultValue={technology.length !== 0 ? technology : ""}
                                    options={renderListing("Technology")}
                                    mandatory={true}
                                    handleChange={handleTechnologyChange}
                                    errors={errors.Technology}
                                />
                            </Col>

                            <Col md="3">

                                <AsyncSearchableSelectHookForm
                                    label={"Part No."}
                                    name={"Part"}
                                    placeholder={"Select"}
                                    Controller={Controller}
                                    control={control}
                                    rules={{ required: true }}
                                    register={register}
                                    defaultValue={part.length !== 0 ? part : ""}
                                    asyncOptions={filterList}
                                    mandatory={true}
                                    //   isLoading={loaderObj}
                                    handleChange={handlePartChange}
                                    errors={errors.Part}
                                    disabled={(technology.length === 0) ? true : false}
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
                                    defaultValue={revision.length !== 0 ? revision : ""}
                                    options={renderListing("Revision")}
                                    mandatory={false}
                                    handleChange={() => { }}
                                    errors={errors.revision}
                                    disabled={part.length === 0 ? true : false}
                                />
                            </Col>
                            <Col md="3">
                                <SearchableSelectHookForm
                                    label={"Vendor"}
                                    name={"Vendor"}
                                    placeholder={"Select"}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    defaultValue={vendor.length !== 0 ? vendor : ''}
                                    options={renderListing('Vendor')}
                                    mandatory={false}
                                    handleChange={handleVendorChange}
                                    errors={errors.vendor}
                                    disabled={part.length === 0 ? true : false}
                                />
                            </Col>
                            <Col md="3">
                                <SearchableSelectHookForm
                                    label={"Plant (Code)"}
                                    name={"Plant"}
                                    placeholder={"Select"}
                                    Controller={Controller}
                                    control={control}
                                    rules={{ required: false }}
                                    register={register}
                                    defaultValue={plant.length !== 0 ? plant : ""}
                                    options={renderListing("Plant")}
                                    mandatory={false}
                                    handleChange={plantHandleChange}
                                    errors={errors.plant}
                                    disabled={part.length === 0 ? true : false}
                                />
                            </Col>
                            <Col md="3" className="mt-4 pt-1">
                                <button
                                    type="submit"
                                    className={"user-btn  pull-left mt-1"}

                                >
                                    <div className={"plus"}></div>ADD
                                </button>
                                <button
                                    type="button"
                                    className={"reset-btn pull-left mt-1 ml5"}
                                    onClick={resetData}
                                >
                                    Reset
                                </button>
                            </Col>

                        </Row>
                    </form>
                    <div className={`ag-grid-wrapper height-width-wrapper ${(rowData && rowData?.length <= 0) ? "overlay-contain" : ""}`}>
                        < div className={`ag-theme-material `}>
                            {false && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />}
                            <AgGridReact
                                defaultColDef={defaultColDef}
                                floatingFilter={true}
                                domLayout='autoHeight'
                                // columnDefs={c}
                                rowData={rowData}
                                pagination={true}
                                paginationPageSize={defaultPageSize}
                                onGridReady={onGridReady}
                                gridOptions={gridOptions}
                                noRowsOverlayComponent={'customNoRowsOverlay'}
                                noRowsOverlayComponentParams={{
                                    title: EMPTY_DATA,
                                    imagClass: 'imagClass'
                                }}
                                rowSelection={'multiple'}
                                suppressRowClickSelection={true}
                                // onSelectionChanged={onRowSelect}
                                // onFilterModified={onFloatingFilterChanged}
                                frameworkComponents={frameworkComponents}
                            >
                                <AgGridColumn field="TechnologyName" headerName="Tehnology"></AgGridColumn>
                                <AgGridColumn field="PartNo" headerName="Part No."></AgGridColumn>
                                <AgGridColumn field="ShowRevisionNumber" headerName="Revision No."></AgGridColumn>
                                <AgGridColumn field="Vendor" headerName="Vendor (Code)"></AgGridColumn>
                                <AgGridColumn field="Plant" headerName="Plant"></AgGridColumn>
                                <AgGridColumn field="action" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'buttonFormatter'}></AgGridColumn>
                            </AgGridReact>
                            {/* {<PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} />} */}
                        </div>
                    </div>
                </div>
                <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                    <div className="col-sm-12 text-right bluefooter-butn mt-3">
                        <div className="d-flex justify-content-end bd-highlight w100 my-2 align-items-center">
                            <button type="button" className={"user-btn save-btn"} disabled={rowData.length === 0} onClick={runReport}> <div className={"Run-icon"}></div>RUN REPORT</button>
                        </div>
                    </div>
                </Row>
            </div>}
            {showRatioListing && <CostRatioListing hideListing={showRatioListing} viewListing={viewListingHandler} costRatioGridData={costRatioGridData} />}
        </>
    )
}
export default CostRatioReport