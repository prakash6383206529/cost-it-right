import React, { useEffect, useState, useRef } from 'react';
import { Row, Col, } from 'reactstrap';
import DayTime from '../../../common/DayTimeWrapper'
import { defaultPageSize, EMPTY_DATA } from '../../../../config/constants';
import NoContentFound from '../../../common/NoContentFound';
import { checkForDecimalAndNull, checkForNull, getConfigurationKey, loggedInUserId } from '../../../../helper';
import Toaster from '../../../common/Toaster';
import { runVerifySimulation } from '../../actions/Simulation';
import { Fragment } from 'react';
import { TextFieldHookForm } from '../../../layout/HookFormInputs';
import DatePicker from "react-datepicker";
import { useForm, Controller } from 'react-hook-form'
import RunSimulationDrawer from '../RunSimulationDrawer';
import VerifySimulation from '../VerifySimulation';
import { useDispatch, useSelector } from 'react-redux';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import Simulation from '../Simulation';
import { VBC, ZBC } from '../../../../config/constants';
import { debounce } from 'lodash'
import { PaginationWrapper } from '../../../common/commonPagination';
import WarningMessage from '../../../common/WarningMessage';
import { getMaxDate } from '../../SimulationUtils';
import PopupMsgWrapper from '../../../common/PopupMsgWrapper';

const gridOptions = {

};


function RMSimulation(props) {
    const { list, isbulkUpload, rowCount, technology, master, isImpactedMaster, costingAndPartNo, tokenForMultiSimulation } = props
    const [showRunSimulationDrawer, setShowRunSimulationDrawer] = useState(false)
    const [showverifyPage, setShowVerifyPage] = useState(false)
    const [token, setToken] = useState('')
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [showMainSimulation, setShowMainSimulation] = useState(false)
    const [textFilterSearch, setTextFilterSearch] = useState('')
    const [isDisable, setIsDisable] = useState(false)
    const [effectiveDate, setEffectiveDate] = useState('');
    const [maxDate, setMaxDate] = useState('');
    const [isEffectiveDateSelected, setIsEffectiveDateSelected] = useState(false);
    const [isWarningMessageShow, setIsWarningMessageShow] = useState(false)
    const [titleObj, setTitleObj] = useState({})
    const [showPopup, setShowPopup] = useState(false)
    const [popupMessage, setPopupMessage] = useState('There is no changes in scrap rate Do you want to continue')
    const gridRef = useRef();

    const { register, control, setValue, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })



    const dispatch = useDispatch()

    const { selectedMasterForSimulation } = useSelector(state => state.simulation)
    const { filteredRMData } = useSelector(state => state.material)
    useEffect(() => {
        if (isbulkUpload) {
            setValue('NoOfCorrectRow', rowCount.correctRow)
            setValue('NoOfRowsWithoutChange', rowCount.NoOfRowsWithoutChange)
            setTitleObj(prevState => ({ ...prevState, rowWithChanges: rowCount.correctRow, rowWithoutChanges: rowCount.NoOfRowsWithoutChange }))
        }

    }, [])
    useEffect(() => {
        if (list && list.length > 0) {
            if (isImpactedMaster) {
                window.screen.width >= 1600 && gridRef.current.api.sizeColumnsToFit();
            }
            window.screen.width >= 1921 && gridRef.current.api.sizeColumnsToFit();

            let maxDate = getMaxDate(list)
            setMaxDate(maxDate)

        }

    }, [list])

    const setValueFunction = () => {
        /**********POST METHOD TO CALL HERE AND AND SEND TOKEN TO VERIFY PAGE TODO ****************/
        let obj = {}
        obj.Technology = technology
        obj.SimulationTechnologyId = selectedMasterForSimulation.value
        obj.SimulationTypeId = list[0].CostingTypeId
        obj.Masters = master
        obj.LoggedInUserId = loggedInUserId()

        obj.TechnologyId = list[0].TechnologyId

        if (filteredRMData.plantId && filteredRMData.plantId.value) {
            obj.PlantId = filteredRMData.plantId ? filteredRMData.plantId.value : ''
        }
        let tempArr = []
        list && list.map(item => {
            if ((item.NewBasicRate !== undefined || item.NewScrapRate !== undefined) && ((item.NewBasicRate !== undefined ? Number(item.NewBasicRate) : Number(item.BasicRate)) !== Number(item.BasicRate) || (item.NewScrapRate !== undefined ? Number(item.NewScrapRate) : Number(item.ScrapRate)) !== Number(item.ScrapRate))) {
                let tempObj = {}
                tempObj.CostingHead = item.CostingHead === 'Vendor Based' ? VBC : ZBC
                tempObj.RawMaterialName = item.RawMaterial
                tempObj.MaterialType = item.MaterialType
                tempObj.RawMaterialGrade = item.RMGrade
                tempObj.RawMaterialSpecification = item.RMSpec
                tempObj.RawMaterialCategory = item.Category
                tempObj.UOM = item.UOM
                tempObj.OldBasicRate = item.BasicRate
                tempObj.NewBasicRate = item.NewBasicRate ? item.NewBasicRate : item.BasicRate
                tempObj.OldScrapRate = item.ScrapRate
                tempObj.NewScrapRate = item.NewScrapRate ? item.NewScrapRate : item.ScrapRate
                tempObj.RawMaterialFreightCost = checkForNull(item.RMFreightCost)
                tempObj.RawMaterialShearingCost = checkForNull(item.RMShearingCost)
                tempObj.OldNetLandedCost = item.NetLandedCost
                tempObj.NewNetLandedCost = Number(item.NewBasicRate ? item.NewBasicRate : item.BasicRate) + checkForNull(item.RMShearingCost) + checkForNull(item.RMFreightCost)
                tempObj.EffectiveDate = item.EffectiveDate
                tempObj.RawMaterialId = item.RawMaterialId
                tempObj.PlantId = item.PlantId
                tempObj.VendorId = item.VendorId
                tempObj.Delta = 0
                tempArr.push(tempObj)
            }
            return null;
        })


        obj.SimulationIds = tokenForMultiSimulation
        obj.SimulationRawMaterials = tempArr

        obj.EffectiveDate = DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss')
        dispatch(runVerifySimulation(obj, res => {
            setIsDisable(false)

            if (res?.data?.Result) {
                setToken(res.data.Identity)
                setShowVerifyPage(true)
            }
        }))
    }

    const verifySimulation = debounce(() => {
        if (!isEffectiveDateSelected) {
            setIsWarningMessageShow(true)
            return false
        }
        let basicRateCount = 0
        let isScrapRateGreaterThanBasiRate = false
        let scrapRateChangeArr = [];
        list && list.map((li) => {

            if (Number(li.BasicRate) === Number(li.NewBasicRate) || li?.NewBasicRate === undefined) {
                basicRateCount = basicRateCount + 1
            }

            if ((li.NewBasicRate && Number(li.BasicRate) !== Number(li.NewBasicRate)) && (Number(li.ScrapRate) === Number(li.NewScrapRate) || li?.NewScrapRate === undefined)) {
                scrapRateChangeArr.push(li)

            }
            if ((li?.NewBasicRate === undefined ? Number(li?.BasicRate) : Number(li?.NewBasicRate)) < (li?.NewScrapRate === undefined ? Number(li?.ScrapRate) : Number(li?.NewScrapRate))) {
                isScrapRateGreaterThanBasiRate = true
            }
            if (isScrapRateGreaterThanBasiRate) {
                li.NewBasicRate = li?.BasicRate
                li.NewScrapRate = li?.ScrapRate
                Toaster.warning('Scrap Rate should be less than Basic Rate')
                return false
            }
            return null;
        })
        if (basicRateCount === list.length) {
            Toaster.warning('There is no changes in new value. Please correct the data, then run simulation')
            return false
        }
        if (scrapRateChangeArr.length !== 0) {
            let rmName = []
            scrapRateChangeArr.map(item => rmName.push(item.RawMaterialCode))
            let rmNameString = rmName.join(', ')
            setPopupMessage(`Scrap rate is not changed for some raw material (${rmNameString}). Do you still wish to continue?`)
            setShowPopup(true)
            return false
        }
        setIsDisable(true)

        basicRateCount = 0
        setValueFunction();
    }, 600)


    const cancelVerifyPage = () => {

        setShowVerifyPage(false)
    }
    const resetState = () => {
        gridApi?.setQuickFilter('');
        setTextFilterSearch('')
        gridOptions?.columnApi?.resetColumnState();
        gridOptions?.api?.setFilterModel(null);
        if (isImpactedMaster) {
            window.screen.width >= 1600 && gridRef.current.api.sizeColumnsToFit();
        }
        window.screen.width >= 1921 && gridRef.current.api.sizeColumnsToFit();
    }

    /**
     * @method shearingCostFormatter
     * @description Renders buttons
     */
    const shearingCostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;

        return cell != null ? cell : '-';
    }

    /**
    * @method freightCostFormatter
    * @description Renders buttons
    */
    const freightCostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;

        return cell != null ? cell : '-';
    }


    const effectiveDateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;

        return cell != null ? DayTime(cell).format('DD/MM/YYYY') : '';
    }


    const costingHeadFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;

        return (cell === true || cell === 'Vendor Based') ? 'Vendor Based' : 'Zero Based';
    }

    const newBasicRateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const value = beforeSaveCell(cell, props)
        return (
            <>
                {
                    isImpactedMaster ?
                        checkForDecimalAndNull(row.NewBasicRate, getConfigurationKey().NoOfDecimalForPrice) :
                        <span className={`${!isbulkUpload ? 'form-control' : ''}`} >{cell && value ? Number(cell) : Number(row.BasicRate)} </span>
                }

            </>
        )
    }

    const oldBasicRateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const value = beforeSaveCell(cell)
        return (
            <>
                {
                    isImpactedMaster ?
                        row.OldBasicRate :
                        <span>{cell && value ? Number(cell) : Number(row.BasicRate)} </span>
                }

            </>
        )
    }

    const newScrapRateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const value = beforeSaveCell(cell, props)
        return (
            <>
                {
                    isImpactedMaster ?
                        checkForDecimalAndNull(row.NewScrapRate, getConfigurationKey().NoOfDecimalForPrice) :
                        <span className={`${!isbulkUpload ? 'form-control' : ''}`} >{cell && value ? Number(cell) : Number(row.ScrapRate)}</span>
                }
            </>
        )
    }

    const oldScrapRateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const value = beforeSaveCell(cell)
        return (
            <>
                {
                    isImpactedMaster ?
                        row.OldScrapRate :
                        <span>{cell && value ? Number(cell) : Number(row.ScrapRate)}</span>
                }
            </>
        )
    }

    // const colorCheck = 

    const costFormatter = (props) => {

        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cell != null ? checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice) : ''
    }

    /**
  * @method beforeSaveCell
  * @description CHECK FOR ENTER NUMBER IN CELL
  */
    const beforeSaveCell = (cell, props) => {
        const cellValue = cell
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        if ((row?.NewBasicRate === undefined ? Number(row?.BasicRate) : Number(row?.NewBasicRate)) <
            (row?.NewScrapRate === undefined ? Number(row?.ScrapRate) : Number(row?.NewScrapRate))) {
            row.NewBasicRate = row?.BasicRate
            row.NewScrapRate = row?.ScrapRate

            Toaster.warning('Scrap Rate should be less than Basic Rate')
            return false
        }
        if (Number.isInteger(Number(cellValue)) && /^\+?(0|[1-9]\d*)$/.test(cellValue) && cellValue.toString().replace(/\s/g, '').length) {
            if (cellValue.length > 8) {
                Toaster.warning("Value should not be more than 8")
                return false
            }
            return true
        } else if (cellValue && !/^[+]?([0-9]+(?:[.][0-9]*)?|\.[0-9]+)$/.test(cellValue)) {
            Toaster.warning('Please enter a valid positive numbers.')
            return false
        }

        return true
    }

    const NewcostFormatter = (props) => {
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        if (!row.NewBasicRate || Number(row.BasicRate) === Number(row.NewBasicRate) || row.NewBasicRate === '') return ''
        const NewBasicRate = Number(row.NewBasicRate) + checkForNull(row.RMFreightCost) + checkForNull(row.RMShearingCost)
        const classGreen = (NewBasicRate > row.NetLandedCost) ? 'red-value form-control' : (NewBasicRate < row.NetLandedCost) ? 'green-value form-control' : 'form-class'
        return row.NewBasicRate != null ? <span className={classGreen}>{checkForDecimalAndNull(NewBasicRate, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
        // checkForDecimalAndNull(NewBasicRate, getConfigurationKey().NoOfDecimalForPrice)
    }

    const cancel = () => {
        list && list.map((item) => {
            item.NewBasicRate = undefined
            item.NewScrapRate = undefined
            return null
        })
        setShowMainSimulation(true)
    }

    const closeDrawer = (e = '') => {
        setShowRunSimulationDrawer(false)

    }


    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: true,
        editable: true
    };

    const onGridReady = (params) => {

        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
        params.api.paginationGoToPage(0);

    };

    const onPageSizeChanged = (newPageSize) => {
        gridApi.paginationSetPageSize(Number(newPageSize));
    };

    const onFilterTextBoxChanged = (e) => {

        gridApi?.setQuickFilter(e?.target?.value);
        setTextFilterSearch(e?.target?.value)
    }
    const cellChange = (props) => {
    }

    const onCellValueChanged = (props) => {
    }

    const handleEffectiveDateChange = (date) => {
        setEffectiveDate(date)
        setIsEffectiveDateSelected(true)
        setIsWarningMessageShow(false)
    }

    const frameworkComponents = {
        effectiveDateFormatter: effectiveDateFormatter,
        costingHeadFormatter: costingHeadFormatter,
        shearingCostFormatter: shearingCostFormatter,
        freightCostFormatter: freightCostFormatter,
        newScrapRateFormatter: newScrapRateFormatter,
        NewcostFormatter: NewcostFormatter,
        costFormatter: costFormatter,
        customNoRowsOverlay: NoContentFound,
        newBasicRateFormatter: newBasicRateFormatter,
        cellChange: cellChange,
        oldBasicRateFormatter: oldBasicRateFormatter,
        oldScrapRateFormatter: oldScrapRateFormatter
    };

    const closePopUp = () => {
        setShowPopup(false)
    }
    const onPopupConfirm = () => {
        setValueFunction()
        setShowPopup(false)
    }
    return (

        <div>
            <div className={`ag-grid-react ${props.customClass}`}>

                {


                    (!showverifyPage && !showMainSimulation) &&
                    <Fragment>

                        <Row>
                            <Col className="add-min-height mb-3 sm-edit-page">
                                <div className={`ag-grid-wrapper height-width-wrapper reset-btn-container ${list && list?.length <= 0 ? "overlay-contain" : ""}`}>
                                    <div className="ag-grid-header d-flex justify-content-between">
                                        <div className='d-flex align-items-center'>
                                            <input type="text" className="form-control mr-1 table-search" id="filter-text-box" value={textFilterSearch} placeholder="Search " onChange={(e) => onFilterTextBoxChanged(e)} />
                                            <button type="button" className="user-btn float-right mr-3" title="Reset Grid" onClick={() => resetState()}>
                                                <div className="refresh mr-0"></div>
                                            </button>
                                        </div>
                                        <div className='d-flex justify-content-end'>
                                            {
                                                isbulkUpload &&
                                                <div className="d-flex justify-content-end bulk-upload-row rm-row">
                                                    <div className="d-flex align-items-center">
                                                        <label>Rows with changes:</label>
                                                        <TextFieldHookForm
                                                            label=""
                                                            name={'NoOfCorrectRow'}
                                                            Controller={Controller}
                                                            title={titleObj.rowWithChanges}
                                                            control={control}
                                                            register={register}
                                                            rules={{ required: false }}
                                                            mandatory={false}
                                                            handleChange={() => { }}
                                                            defaultValue={''}
                                                            className=""
                                                            customClassName={'withBorder mn-height-auto hide-label mb-0'}
                                                            errors={errors.NoOfCorrectRow}
                                                            disabled={true}
                                                        />
                                                    </div>
                                                    <div className="d-flex align-items-center">
                                                        <label>Rows without changes:</label>
                                                        <TextFieldHookForm
                                                            label=""
                                                            name={'NoOfRowsWithoutChange'}
                                                            Controller={Controller}
                                                            title={titleObj.rowWithoutChanges}
                                                            control={control}
                                                            register={register}
                                                            rules={{ required: false }}
                                                            mandatory={false}
                                                            handleChange={() => { }}
                                                            defaultValue={''}
                                                            className=""
                                                            customClassName={'withBorder mn-height-auto hide-label mb-0'}
                                                            errors={errors.NoOfRowsWithoutChange}
                                                            disabled={true}
                                                        />
                                                    </div>
                                                </div>
                                            }
                                            {!isImpactedMaster && <div className={`d-flex simulation-label-container`}>
                                                <div className='d-flex pl-3'>
                                                    <label>Technology: </label>
                                                    <p className='technology ml-1' title={list[0].TechnologyName}>{list[0].TechnologyName}</p>
                                                </div>
                                                <div className='d-flex pl-3'>
                                                    <label className='mr-1'>Vendor:</label>
                                                    <p title={list[0].VendorName}>{list[0].VendorName}</p>
                                                </div>
                                            </div>}


                                        </div>



                                    </div>
                                    <div className="ag-theme-material" style={{ width: '100%' }}>
                                        <AgGridReact
                                            ref={gridRef}
                                            floatingFilter={true}
                                            style={{ height: '100%', width: '100%' }}
                                            defaultColDef={defaultColDef}
                                            domLayout='autoHeight'
                                            // columnDefs={c}
                                            rowData={list}
                                            pagination={true}
                                            paginationPageSize={defaultPageSize}
                                            onGridReady={onGridReady}
                                            gridOptions={gridOptions}
                                            loadingOverlayComponent={'customLoadingOverlay'}
                                            noRowsOverlayComponent={'customNoRowsOverlay'}
                                            noRowsOverlayComponentParams={{
                                                title: EMPTY_DATA,
                                            }}
                                            frameworkComponents={frameworkComponents}
                                            stopEditingWhenCellsLoseFocus={true}
                                            onCellValueChanged={onCellValueChanged}
                                        >
                                            {
                                                !isImpactedMaster &&
                                                <AgGridColumn width={140} field="CostingHead" headerName="Costing Head" editable='false' cellRenderer={'costingHeadFormatter'}></AgGridColumn>
                                            }
                                            <AgGridColumn width={140} field="RawMaterial" editable='false' headerName="Raw Material"></AgGridColumn>
                                            <AgGridColumn width={115} field="RMGrade" editable='false' headerName="RM Grade" ></AgGridColumn>
                                            <AgGridColumn width={115} field="RMSpec" editable='false' headerName="RM Spec"></AgGridColumn>
                                            <AgGridColumn width={115} field="RawMaterialCode" editable='false' headerName='RM Code' cellRenderer='hyphenFormatter'></AgGridColumn>
                                            {!isImpactedMaster && <AgGridColumn width={110} field="Category" editable='false' headerName="Category"></AgGridColumn>}
                                            {!isImpactedMaster && <AgGridColumn width={125} field="TechnologyName" editable='false' headerName="Technology" ></AgGridColumn>}
                                            {!isImpactedMaster && <AgGridColumn width={100} field="VendorName" editable='false' headerName="Vendor"></AgGridColumn>}
                                            <AgGridColumn width={100} field="UOM" editable='false' headerName="UOM"></AgGridColumn>

                                            {costingAndPartNo && <AgGridColumn field="CostingNumber" editable='false' headerName="Costing No" minWidth={190}></AgGridColumn>}
                                            {costingAndPartNo && <AgGridColumn field="PartNumber" editable='false' headerName="Part No" minWidth={190}></AgGridColumn>}


                                            <AgGridColumn headerClass="justify-content-center" cellClass="text-center" width={240} headerName="Basic Rate (INR)" marryChildren={true} >
                                                <AgGridColumn width={120} cellRenderer='oldBasicRateFormatter' field="BasicRate" editable='false' headerName="Old" colId="BasicRate"></AgGridColumn>
                                                <AgGridColumn width={120} cellRenderer='newBasicRateFormatter' onCellValueChanged='cellChange' field="NewBasicRate" headerName="New" colId='NewBasicRate' editable={!isImpactedMaster} ></AgGridColumn>
                                            </AgGridColumn>
                                            <AgGridColumn headerClass="justify-content-center" cellClass="text-center" width={240} marryChildren={true} headerName="Scrap Rate (INR)">
                                                <AgGridColumn width={120} field="ScrapRate" editable='false' cellRenderer='oldScrapRateFormatter' headerName="Old" colId="ScrapRate" ></AgGridColumn>
                                                <AgGridColumn width={120} cellRenderer={'newScrapRateFormatter'} field="NewScrapRate" headerName="New" colId="NewScrapRate" editable={!isImpactedMaster} ></AgGridColumn>
                                            </AgGridColumn>
                                            <AgGridColumn width={150} field="RMFreightCost" editable='false' cellRenderer={'freightCostFormatter'} headerName="RM Freight Cost"></AgGridColumn>
                                            <AgGridColumn width={170} field="RMShearingCost" editable='false' cellRenderer={'shearingCostFormatter'} headerName="RM Shearing Cost" ></AgGridColumn>
                                            {!isImpactedMaster && <AgGridColumn headerClass="justify-content-center" cellClass="text-center" width={240} headerName="Net Cost (INR)">
                                                <AgGridColumn width={120} field="NetLandedCost" editable='false' cellRenderer={'costFormatter'} headerName="Old" colId='NetLandedCost'></AgGridColumn>
                                                <AgGridColumn width={120} field="NewNetLandedCost" editable='false' valueGetter='data.NewBasicRate + data.RMFreightCost+data.RMShearingCost' cellRenderer={'NewcostFormatter'} headerName="New" colId='NewNetLandedCost'></AgGridColumn>
                                            </AgGridColumn>
                                            }
                                            <AgGridColumn width={140} field="EffectiveDate" editable='false' cellRenderer={'effectiveDateFormatter'} headerName="Effective Date" ></AgGridColumn>
                                            <AgGridColumn field="RawMaterialId" hide></AgGridColumn>

                                        </AgGridReact>

                                        {<PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} />}
                                    </div>
                                </div>

                            </Col>
                        </Row>
                        {
                            !isImpactedMaster &&
                            <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                                <div className="col-sm-12 text-right bluefooter-butn d-flex justify-content-end align-items-center">
                                    <div className="inputbox date-section mr-3 verfiy-page">
                                        <DatePicker
                                            name="EffectiveDate"
                                            selected={DayTime(effectiveDate).isValid() ? new Date(effectiveDate) : ''}
                                            onChange={handleEffectiveDateChange}
                                            showMonthDropdown
                                            showYearDropdown
                                            dateFormat="dd/MM/yyyy"
                                            minDate={new Date(maxDate)}
                                            dropdownMode="select"
                                            placeholderText="Select effective date"
                                            className="withBorder"
                                            autoComplete={"off"}
                                            disabledKeyboardNavigation
                                            onChangeRaw={(e) => e.preventDefault()}
                                        />
                                        {isWarningMessageShow && <WarningMessage dClass={"error-message"} textClass={"pt-1"} message={"Please select effective date"} />}
                                    </div>
                                    <button type={"button"} className="mr15 cancel-btn" onClick={cancel} disabled={isDisable}>
                                        <div className={"cancel-icon"}></div>
                                        {"CANCEL"}
                                    </button>
                                    <button onClick={verifySimulation} type="submit" className="user-btn mr5 save-btn" disabled={isDisable}>
                                        <div className={"Run-icon"}>
                                        </div>{" "}
                                        {"Verify"}
                                    </button>
                                </div>
                            </Row>
                        }
                    </Fragment>

                }
                {
                    showverifyPage &&
                    <VerifySimulation token={token} cancelVerifyPage={cancelVerifyPage} />
                }
                {
                    showPopup && <PopupMsgWrapper isOpen={showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={popupMessage} />
                }

                {
                    showMainSimulation && <Simulation isMasterSummaryDrawer={false} isCancelClicked={true} isRMPage={true} />
                }
                {
                    showRunSimulationDrawer &&
                    <RunSimulationDrawer
                        isOpen={showRunSimulationDrawer}
                        closeDrawer={closeDrawer}
                        anchor={"right"}
                    />
                }
            </div>
        </div>
    );
}


export default RMSimulation;