import { AgGridColumn, AgGridReact } from "ag-grid-react"
import _ from "lodash"
import React from "react"
import { useEffect } from "react"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useSelector, useDispatch } from "react-redux"
import { reactLocalStorage } from "reactjs-localstorage"
import { Col, Row } from "reactstrap"
import { getPlantSelectListByType } from "../../../actions/Common"
import { defaultPageSize, EMPTY_DATA, searchCount, ZBC } from "../../../config/constants"
import { MESSAGES } from "../../../config/message"
import { loggedInUserId } from "../../../helper"
import { autoCompleteDropdown } from "../../common/CommonFunctions"
import DayTime from "../../common/DayTimeWrapper"
import LoaderCustom from "../../common/LoaderCustom"
import NoContentFound from "../../common/NoContentFound"
import Toaster from "../../common/Toaster"
import { checkPartWithTechnology, getCostingSpecificTechnology, getPartCostingVendorSelectList, getPartInfo, getPartSelectListByTechnology } from "../../costing/actions/Costing"
import { AsyncSearchableSelectHookForm, DatePickerHookForm, SearchableSelectHookForm } from "../../layout/HookFormInputs"
import { getFormGridData, getRevisionNoFromPartId } from "../actions/ReportListing"



const gridOptions = {}
function CostReportForm(props) {
    const { isDateMandatory } = props
    const [technology, setTechnology] = useState([])
    const [partName, setpartName] = useState('')
    const [part, setPart] = useState([]);
    const [plant, setPlant] = useState([]);
    const [revision, setRevision] = useState([]);
    const [IsTechnologySelected, setIsTechnologySelected] = useState(false);
    const [vendor, setVendor] = useState([])
    const [fromDate, setFromDate] = useState('')
    const [toDate, setToDate] = useState('')
    const [minDate, setMinDate] = useState('')
    const [maxDate, setMaxDate] = useState('')

    const dispatch = useDispatch()

    const technologySelectList = useSelector((state) => state.costing.costingSpecifiTechnology)
    const vendorSelectList = useSelector((state) => state.costing.costingVendorList)
    const DestinationplantSelectList = useSelector(state => state.comman.plantSelectList);

    const costReportFormData = useSelector(state => state.report.costReportFormGridData)

    let gridData = costReportFormData && costReportFormData.gridData ? costReportFormData.gridData : [];
    let startDate = costReportFormData && costReportFormData.fromDate
    let endDate = costReportFormData && costReportFormData.toDate




    // const toDate = useSelector(state => state.report.costReportFormGridData?.toDate)
    // const fromDate = useSelector(state => state.report.costReportFormGridData?.fromDate)


    const { handleSubmit, control, register, getValues, setValue, formState: { errors } } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })


    useEffect(() => {
        dispatch(getCostingSpecificTechnology(loggedInUserId(), () => { }))
        dispatch(getPartInfo('', () => { }))
        setValue('fromDate', startDate ? startDate : '')
        setValue('toDate', endDate ? endDate : '')

    }, [])

    /**
    * @Method onSubmit
    * @description Insert data in the bottom table
    */
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

        gridData && gridData.map((item) => {
            if (item.TechnologyId === obj.TechnologyId && item.PartId === obj.PartId && item.RevisionNumber === obj.RevisionNumber && item.VendorId === obj.VendorId && item.PlantId === obj.PlantId) {
                isDuplicateEntry = true
            }
        })
        if (isDuplicateEntry) {
            Toaster.warning("This data is already exist in the row.")
            return false
        }
        let arr = [...gridData, obj];

        dispatch(getFormGridData({ toDate, fromDate, gridData: arr }))
        resetData()
    }

    /**
    * @Method handleFromDate
    * @description Handle change for from date input field
    */
    const handleFromDate = (value) => {
        setMinDate(value)
        setFromDate(value)
    }

    /**
    * @Method handleToDate
    * @description Handle change for To date input field
    */
    const handleToDate = (value) => {
        setMaxDate(value)
        setToDate(value)
    }

    /**
    * @Method resetRevisionVendorPlant
    * @description Reset Revision Number, Plant and Vendor Field
    */
    const resetRevisionVendorPlant = () => {
        setVendor([])
        setPlant([])
        setRevision([])
        setValue('Revision', '')
        setValue('Vendor', '')
        setValue('Plant', '')
    }

    /**
    * @Method renderListing
    * @description Dropdown data list
    */
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
        params.api.sizeColumnsToFit();
        params.api.paginationGoToPage(0);
    }

    /**
    * @Method handleTechnologyChange
    * @description Change other field data basis of the technology change
    */
    const handleTechnologyChange = (newValue) => {
        if (newValue && newValue !== '') {
            setTechnology(newValue)
            setIsTechnologySelected(true)
            setPart([])
            dispatch(getPartInfo('', () => { }))
            setValue('Part', '')
            resetRevisionVendorPlant()
        } else {
            setTechnology([])
            setIsTechnologySelected(false)
        }
        reactLocalStorage.setObject('PartData', [])
    }

    /**
    * @Method handlePartChange
    * @description Change other field data basis of the Part change
    */
    const handlePartChange = (newValue) => {
        if (newValue && newValue !== '') {
            if (IsTechnologySelected) {
                const data = { TechnologyId: technology.value, PartId: newValue.value }
                resetRevisionVendorPlant()
                dispatch(checkPartWithTechnology(data, (response) => {
                    if (response.status === 412) {
                        setPart([])
                        setValue('Part', '')
                    } else {
                        setPart(newValue)
                    }
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

    /**
    * @Method filterList
    * @description get data from backend after entering three char
    */
    const filterList = async (inputValue) => {

        const resultInput = inputValue.slice(0, 3)
        if (inputValue?.length >= searchCount && partName !== resultInput) {
            const res = await getPartSelectListByTechnology(technology.value, resultInput);
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

    /**
* @Method deleteItemFromTable
* @description remove data from table on the click of delete icon
*/
    const deleteItemFromTable = (gridData, props) => {
        let arr = []
        gridData && gridData.map((item, index) => {
            if (index !== props?.node?.rowIndex) {
                arr.push(item)
            }
        })
        dispatch(getFormGridData({ toDate, fromDate, gridData: arr }))
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

    /**
    * @Method resetData
    * @description Reset all field after click on reset button
    */
    const resetData = () => {
        setPart([])
        setTechnology([])
        dispatch(getPartInfo('', () => { }))
        setValue('Technology', '')
        setValue('Part', '')
        resetRevisionVendorPlant()
    }



    return (
        <>
            <div className="cost-ratio-report">
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
                                    rules={{ required: isDateMandatory }}
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
                                    mandatory={isDateMandatory}
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
                                    handleChange={handleToDate}
                                    minDate={minDate}
                                    rules={{ required: isDateMandatory }}
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
                                    mandatory={isDateMandatory}
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
                <div className={`ag-grid-wrapper height-width-wrapper ${(gridData && gridData?.length <= 0) ? "overlay-contain" : ""}`}>
                    < div className={`ag-theme-material `}>
                        <AgGridReact
                            defaultColDef={defaultColDef}
                            floatingFilter={true}
                            domLayout='autoHeight'
                            // columnDefs={c}
                            rowData={gridData}
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
                            <AgGridColumn field="Plant" headerName="Plant (Code)"></AgGridColumn>
                            <AgGridColumn field="action" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'buttonFormatter'}></AgGridColumn>
                        </AgGridReact>
                        {/* {<PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} />} */}
                    </div>
                </div>
            </div>
        </>
    )
}
export default CostReportForm