import React, { useState } from 'react';
import { useForm, Controller, } from 'react-hook-form'
import { Row, Col, } from 'reactstrap';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getRawMaterialNameChild, getRMDomesticDataList } from '../../masters/actions/Material';
import NoContentFound from '../../common/NoContentFound';
import { CONSTANT } from '../../../helper/AllConastant';
import { SearchableSelectHookForm } from '../../layout/HookFormInputs';
import { getComparisionSimulationData, getCostingSimulationList, saveSimulationForRawMaterial } from '../actions/Simulation';
import RunSimulationDrawer from './RunSimulationDrawer';
import ApproveRejectDrawer from '../../costing/components/approval/ApproveRejectDrawer'
import CostingDetailSimulationDrawer from './CostingDetailSimulationDrawer'
import { checkForDecimalAndNull, formatRMSimulationObject, formViewData, getConfigurationKey, userDetails } from '../../../helper';
import VerifyImpactDrawer from './VerifyImpactDrawer';
import { EMPTY_GUID, RMDOMESTIC, RMIMPORT, simulationMaster, ZBC } from '../../../config/constants';
import { toastr } from 'react-redux-toastr';
import SimulationApprovalListing from './SimulationApprovalListing';
import { Redirect } from 'react-router';
import { getPlantSelectListByType } from '../../../actions/Common';
import { setCostingViewData } from '../../costing/actions/Costing';
import { set } from 'lodash';

function CostingSimulation(props) {
    const { simulationId, isFromApprovalListing, master } = props

    const { register, control, errors, getValues, setValue } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    })

    const [shown,setshown] =useState(false);
    
    const [selectedRowData, setSelectedRowData] = useState([]);
    const [selectedIds, setSelectedIds] = useState([])
    const [tokenNo, setTokenNo] = useState('')
    const [CostingDetailDrawer, setCostingDetailDrawer] = useState(false)
    const [isVerifyImpactDrawer, setIsVerifyImpactDrawer] = useState(false)
    const [isApprovalDrawer, setIsApprovalDrawer] = useState(false)
    const [showApprovalHistory, setShowApprovalHistory] = useState(false)
    const [simulationDetail, setSimulationDetail] = useState('')
    const [costingArr, setCostingArr] = useState([])
    const [id, setId] = useState('')
    const [isSaveDone, setSaveDone] = useState(isFromApprovalListing ? isFromApprovalListing : false)
    const [oldArr, setOldArr] = useState([])
    const [material, setMaterial] = useState([])
    const [pricesDetail, setPricesDetail] = useState({})
    const [isView, setIsView] = useState(false)

    const dispatch = useDispatch()

    useEffect(() => {
        getCostingList()
        dispatch(getPlantSelectListByType(ZBC, () => { }))
        dispatch(getRawMaterialNameChild(() => { }))
    }, [])


    const getCostingList = (plantId = '', rawMatrialId = '') => {
        dispatch(getCostingSimulationList(simulationId, plantId, rawMatrialId, (res) => {
            if (res.data.Result) {
                const tokenNo = res.data.Data.SimulationTokenNumber
                const Data = res.data.Data
                setTokenNo(tokenNo)
                setCostingArr(Data.SimulatedCostingList)
                setSimulationDetail({ TokenNo: Data.SimulationTokenNumber, Status: Data.SimulationStatus, SimulationId: Data.SimulationId, SimulationAppliedOn: Data.SimulationAppliedOn })
            }
        }))
    }

    const costingList = useSelector(state => state.simulation.costingSimulationList)

    const selectedMasterForSimulation = useSelector(state => state.simulation.selectedMasterForSimulation)

    const plantSelectList = useSelector(state => state.comman.plantSelectList)

    const { rawMaterialNameSelectList } = useSelector(state => state.material)

    const renderVendorName = () => {
        return <>Vendor <br />Name </>
    }
    const renderPlantCode = () => {
        return <>Plant<br />Code </>
    }

    const renderDescription = () => {
        return <>Part <br />Name </>
    }

    const renderECN = () => {
        return <>ECN <br />No.</>
    }

    const revisionNumber = () => {
        return <>Revision <br />No.</>
    }

    const OldPo = () => {
        return <>PO Price <br />Old </>
    }

    const NewPO = () => {
        return <>PO Price <br />New </>
    }

    const RMName = () => {
        return <>RM <br />Name </>
    }

    const renderOldRM = () => {
        return <>RM Cost<br /> Old</>
    }

    const renderNewRM = () => {
        return <>RM Cost<br /> New</>
    }

    const runCostingDetailSimulation = () => {
        setCostingDetailDrawer(true)
    }

    const closeDrawer2 = (e = '', mode) => {
        if (mode === true) {
            setCostingDetailDrawer(false)
        } else {
            setCostingDetailDrawer(false)
        }
    }

    const viewCosting = (id, data, rowIndex) => {
        // let temp = costingArr[rowIndex]
        // temp = { ...temp, IsChecked: true }
        // let Arr = Object.assign([...costingArr], { [rowIndex]: temp })
        // setCostingArr(Arr)
        // let tempArr = [...selectedRowData, data]
        // setSelectedRowData(tempArr)
        setId(id)
        setPricesDetail({ CostingNumber: data.CostingNumber, PlantCode: data.PlantCode, OldPOPrice: data.OldPOPrice, NewPOPrice: data.NewPOPrice, OldRMPrice: data.OldRMPrice, NewRMPrice: data.NewRMPrice, CostingHead: data.CostingHead })
        dispatch(getComparisionSimulationData(data.SimulationCostingId, res => {
            const Data = res.data.Data
            const obj1 = formViewData(Data.OldCosting)
            dispatch(setCostingViewData(obj1))
            runCostingDetailSimulation()
        }))
    }

    const buttonFormatter = (cell, row, enumObject, rowIndex) => {
        return (
            <>
                <button className="View" type={'button'} onClick={() => { viewCosting(cell, row, rowIndex) }} />
            </>
        )
    }

    const onRowSelect = (row, isSelected, e, rowIndex) => {
        if (isSelected) {
            // if (row.IsLockedBySimulation) {
            //     setSelectedRowData([])
            //     toastr.warning('This costing is already sent for approval through another token number.')
            //     return false
            // }
            let temp = costingArr[rowIndex]
            temp = { ...temp, IsChecked: true }
            let Arr = Object.assign([...costingArr], { [rowIndex]: temp })
            setCostingArr(Arr)
            let tempArr = [...selectedRowData, row]
            setSelectedRowData(tempArr)
        } else {
            const CostingId = row.CostingId;
            let temp = costingArr[rowIndex]
            temp = { ...temp, IsChecked: false }
            let Arr = Object.assign([...costingArr], { [rowIndex]: temp })
            setCostingArr(Arr)
            let tempArr = selectedRowData && selectedRowData.filter(el => el.CostingId !== CostingId)
            setSelectedRowData(tempArr)
        }

    }

    const onSelectAll = (isSelected, rows) => {
        if (isSelected) {
            let temp = []
            let temp1 = []
            costingArr && costingArr.map((item => {
                if (item.IsLockedBySimulation) {
                    temp1.push(item.CostingNumber)
                }
                else {
                    temp.push({ ...item, IsChecked: true })
                }
            }))
            if (temp1.length > 0) {
                setSelectedRowData([])
                toastr.warning(`Costings ${temp1.map(item => item)} is already sent for approval through another token number.`)
                return false
            }
            setCostingArr(temp)
            setSelectedRowData(rows)
        } else {
            let temp = []
            costingArr && costingArr.map((item => {
                temp.push({ ...item, IsChecked: false })
            }))
            setCostingArr(temp)
            setSelectedRowData([])
        }
    }

    const renderDropdownListing = (label) => {
        let temp = []
        if (label === 'plant') {
            plantSelectList && plantSelectList.map((item) => {
                if (item.Value === '0') return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            })
            return temp
        }
        if (label === 'material') {
            rawMaterialNameSelectList && rawMaterialNameSelectList.map((item) => {
                if (item.Value === '0') return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            })
            return temp
        }
    }

    const onSaveSimulation = () => {

        const simObj = formatRMSimulationObject(simulationDetail, selectedRowData, costingArr)


        switch (selectedMasterForSimulation.label) {
            case RMDOMESTIC:
                dispatch(saveSimulationForRawMaterial(simObj, res => {
                    if (res.data.Result) {
                        toastr.success('Simulation saved successfully.')
                        setShowApprovalHistory(true)
                    }
                }))
                break;
            case RMIMPORT:
                dispatch(saveSimulationForRawMaterial(simObj, res => {
                    if (res.data.Result) {
                        toastr.success('Simulation saved successfully.')
                        setShowApprovalHistory(true)
                    }
                }))
                break;

            default:
                break;
        }
        // setShowApprovalHistory(true)
    }

    const handleExportCSVButtonClick = (onClick) => {
        onClick();
        let products = []
        products = props.costingList
        return products; // must return the data which you want to be exported
    }

    const createCustomExportCSVButton = (onClick) => {
        return (
            <ExportCSVButton btnText='Download' onClick={() => handleExportCSVButtonClick(onClick)} />
        );
    }

    const onExportToCSV = (row) => {
        // ...
        let products = []
        products = costingList
        return products; // must return the data which you want to be exported
    }

    const selectRowProp = {
        mode: 'checkbox',
        clickToSelect: true,
        unselectable: selectedIds,
        onSelect: onRowSelect,
        onSelectAll: onSelectAll,
    };

    const options = {
        clearSearch: true,
        noDataText: <NoContentFound title={CONSTANT.EMPTY_DATA} />,
        // paginationShowsTotal: renderPaginationShowsTotal(),
        exportCSVBtn: createCustomExportCSVButton,
        // exportCSVText: 'Custom Export CSV Text',
        prePage: <span className="prev-page-pg"></span>, // Previous page button text
        nextPage: <span className="next-page-pg"></span>, // Next page button text
        firstPage: <span className="first-page-pg"></span>, // First page button text
        lastPage: <span className="last-page-pg"></span>,
    };

    const VerifyImpact = () => {
        setIsVerifyImpactDrawer(true)
    }

    const sendForApproval = () => {
        setIsApprovalDrawer(true)
        if (!isFromApprovalListing) {

            const isChanged = JSON.stringify(oldArr) == JSON.stringify(selectedRowData)
            if (isChanged) {
                setSaveDone(true)
            } else {
                setSaveDone(false)
            }
        }
    }

    const closeDrawer = (e = '', type) => {
        if (type === 'submit') {
            setIsApprovalDrawer(false);
            setIsVerifyImpactDrawer(false);
            setShowApprovalHistory(true)
        } else {
            setIsApprovalDrawer(false);
            setCostingDetailDrawer(false)
            setIsVerifyImpactDrawer(false);
            setOldArr(selectedRowData)
            setSelectedRowData([])
            setCostingArr([])
        }
    }

    const verifyImpactDrawer = (e = '', type) => {
        if (type === 'cancel') {
            setIsVerifyImpactDrawer(false);
        }
    }

    const descriptionFormatter = (cell, row, enumObject, rowIndex) => {
        return cell && cell !== null ? cell : '-'
    }

    const vendorFormatter = (cell, row, enumObject, rowIndex) => {
        return cell !== null ? cell : '-'
    }

    const ecnFormatter = (cell, row, enumObject, rowIndex) => {
        return cell !== null ? cell : '-'
    }

    const revisionFormatter = (cell, row, enumObject, rowIndex) => {
        return cell !== null ? cell : '-'
    }

    const oldPOFormatter = (cell, row, enumObject, rowIndex) => {
        const classGreen = (row.NewPOPrice > row.OldPOPrice) ? 'red-value form-control' : (row.NewPOPrice < row.OldPOPrice) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const newPOFormatter = (cell, row, enumObject, rowIndex) => {
        const classGreen = (row.NewPOPrice > row.OldPOPrice) ? 'red-value form-control' : (row.NewPOPrice < row.OldPOPrice) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const oldRMFormatter = (cell, row, enumObject, rowIndex) => {
        const classGreen = (row.NewRMCost > row.OldRMCost) ? 'red-value form-control' : (row.NewRMCost < row.OldRMCost) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const newRMFormatter = (cell, row, enumObject, rowIndex) => {
        const classGreen = (row.NewRMCost > row.OldRMCost) ? 'red-value form-control' : (row.NewRMCost < row.OldRMCost) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }


    const filterList = () => {
        const plant = getValues('plantCode').value
        getCostingList(plant, material.value)
    }
    const resetFilter = () => {
        setValue('plantCode', '')
        setValue('rawMaterial', '')
        setMaterial('')
        getCostingList('', '')
    }

    const handleMaterial = (value) => {
        setMaterial(value)
    }

    useEffect(() => {

    }, [isView])


    return (
        <>
            {
                !showApprovalHistory &&

                <div className="show-table-btn costing-simulation-page">
                    <Row>
                        <Col sm="12">
                            <h1 class="mb-0">Token No:{tokenNo}</h1>
                        </Col>
                    </Row>
                    <Row className="filter-row-large pt-4 blue-before">
                        {shown &&
                        <Col lg="8" md="8" className="filter-block">
                            <div className="d-inline-flex justify-content-start align-items-top w100">
                                <div className="flex-fills">
                                    <h5>{`Filter By:`}</h5>
                                </div>

                                {/* <div className="flex-fill hide-label">
                                    <SearchableSelectHookForm
                                        label={''}
                                        name={'partNo'}
                                        placeholder={'Part No.'}
                                        Controller={Controller}
                                        control={control}
                                        rules={{ required: false }}
                                        register={register}
                                        // defaultValue={plant.length !== 0 ? plant : ''}
                                        options={renderDropdownListing('PartList')}
                                        mandatory={false}
                                        handleChange={() => { }}
                                        errors={errors.partNo}
                                    />
                                </div> */}
                                <div className="flex-fill hide-label">
                                    <SearchableSelectHookForm
                                        label={''}
                                        name={'plantCode'}
                                        placeholder={'Plant Code'}
                                        Controller={Controller}
                                        control={control}
                                        rules={{ required: false }}
                                        register={register}
                                        // defaultValue={plant.length !== 0 ? plant : ''}
                                        options={renderDropdownListing('plant')}
                                        mandatory={false}
                                        handleChange={() => { }}
                                        errors={errors.plantCode}
                                    />
                                </div>
                                <div className="flex-fill hide-label">
                                    <SearchableSelectHookForm
                                        label={''}
                                        name={'rawMaterial'}
                                        placeholder={'Raw Material'}
                                        Controller={Controller}
                                        control={control}
                                        rules={{ required: false }}
                                        register={register}
                                        // defaultValue={plant.length !== 0 ? plant : ''}
                                        options={renderDropdownListing('material')}
                                        mandatory={false}
                                        handleChange={handleMaterial}
                                        errors={errors.rawMaterial}
                                    />
                                </div>

                                <div className="flex-fill hide-label">
                                    <button
                                        type="button"
                                        //disabled={pristine || submitting}
                                        onClick={resetFilter}
                                        className="reset mr10"
                                    >
                                        {'Reset'}
                                    </button>
                                    <button
                                        type="button"
                                        //disabled={pristine || submitting}
                                        onClick={filterList}
                                        className="apply mr5"
                                    >
                                        {'Apply'}
                                    </button>
                                </div>
                            </div>
                        </Col>
                        }

                        <Col md="3" lg="3" className="search-user-block mb-3">
                            <div className="d-flex justify-content-end bd-highlight w100">
                                <div>
                                {(shown) ? (
                                    <button type="button" className="user-btn mr5 filter-btn-top topminus88" onClick={() => setshown(!shown)}>
                                    <img src={require("../../../assests/images/times.png")} alt="cancel-icon.jpg" /></button>
                                ) : (
                                    <button type="button" className="user-btn mr5" onClick={() => setshown(!shown)}>Show Filter</button>
                                )}
                                </div>
                            </div>
                        </Col>
                        
                    </Row>
                    <Row>
                        <Col>
                            <BootstrapTable
                                data={costingList}
                                striped={false}
                                bordered={false}
                                hover={false}
                                options={options}
                                search
                                // cellEdit={cellEditProp}
                                // exportCSV
                                //ignoreSinglePage
                                selectRow={selectRowProp}
                                className="add-volume-table"
                                pagination
                                exportCSV
                                csvFileName={`${simulationMaster}.csv`}
                            >
                                <TableHeaderColumn dataField="SimulationCostingId" isKey={true} hidden width={100} dataAlign="center" searchable={false} >{''}</TableHeaderColumn>
                                <TableHeaderColumn dataField="CostingNumber" width={100} export columnTitle={true} editable={false} dataAlign="left" dataSort={true}>{'Costing ID'}</TableHeaderColumn>
                                <TableHeaderColumn dataField="CostingHead" width={100} export columnTitle={true} editable={false} dataAlign="left" dataSort={true}>{'Costing Head'}</TableHeaderColumn>
                                <TableHeaderColumn dataField="VendorName" width={100} export columnTitle={true} dataFormat={vendorFormatter} editable={false} dataAlign="left" >{renderVendorName()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="PlantCode" width={100} columnTitle={true} editable={false} dataAlign="left" >{renderPlantCode()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="RMName" width={100} columnTitle={false} hidden export={true} editable={false} dataAlign="left" >{renderNewRM()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="RMGrade" width={100} columnTitle={false} hidden export={true} editable={false} dataAlign="left" >{renderNewRM()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="PartNo" width={100} columnTitle={true} editable={false} dataAlign="left" >{'Part No.'}</TableHeaderColumn>
                                <TableHeaderColumn dataField="PartName" width={100} columnTitle={true} editable={false} dataFormat={descriptionFormatter} dataAlign="left" >{renderDescription()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="Technology" width={100} columnTitle={true} editable={false} dataAlign="left">{'Technology'}</TableHeaderColumn>
                                <TableHeaderColumn dataField="ECNNumber" width={100} columnTitle={true} editable={false} dataFormat={ecnFormatter} dataAlign="left" >{renderECN()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="RevisionNumber" width={100} columnTitle={true} editable={false} dataFormat={revisionFormatter} dataAlign="left" >{revisionNumber()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="OldPOPrice" width={100} columnTitle={false} editable={false} dataAlign="left" dataFormat={oldPOFormatter} >{OldPo()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="NewPOPrice" width={100} columnTitle={false} editable={false} dataAlign="left" dataFormat={newPOFormatter} >{NewPO()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="OldRMPrice" width={100} columnTitle={false} dataFormat={oldRMFormatter} editable={false} dataAlign="left" >{renderOldRM()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="NewRMPrice" width={100} columnTitle={false} dataFormat={newRMFormatter} editable={false} dataAlign="left" >{renderNewRM()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="OldRMRate" width={100} columnTitle={false} hidden export={true} editable={false} dataAlign="left" >{renderNewRM()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="NewRMRate" width={100} columnTitle={false} hidden export={true} editable={false} dataAlign="left" >{renderNewRM()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="OldScrapRate" width={100} columnTitle={false} hidden export={true} editable={false} dataAlign="left" >{renderNewRM()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="NewScrapRate" width={100} columnTitle={false} hidden export={true} editable={false} dataAlign="left" >{renderNewRM()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="CostingId" export={false} width={100} columnTitle={false} editable={false} dataFormat={buttonFormatter}>Actions</TableHeaderColumn>
                            </BootstrapTable>

                        </Col>
                    </Row>

                    <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                        <div className="col-sm-12 text-right bluefooter-butn">

                            <button
                                class="user-btn approval-btn mr5"
                                onClick={sendForApproval}
                                disabled={selectedRowData && selectedRowData.length === 0 ? true : false}
                            >
                                <img
                                    alt="APPROVAL.jpg"
                                    class="mr-1"
                                    src={require('../../../assests/images/send-for-approval.svg')}
                                />
                                {'Send For Approval'}
                            </button>

                            <button
                                type="button"
                                className="user-btn mr5 save-btn"
                                disabled={((selectedRowData && selectedRowData.length === 0) || isFromApprovalListing) ? true : false}
                                onClick={onSaveSimulation}>
                                <div className={"check-icon"}>
                                    <img
                                        src={require("../../../assests/images/check.png")}
                                        alt="check-icon.jpg"
                                    />
                                </div>
                                {"Save Simulation"}
                            </button>

                            <button className="user-btn mr5 save-btn" onClick={VerifyImpact}>
                                <div className={"check-icon"}> <img src={require("../../../assests/images/check.png")} alt="check-icon.jpg" /></div>
                                {"Verify Impact "}
                            </button>

                        </div>
                    </Row>

                    {isApprovalDrawer &&
                        <ApproveRejectDrawer
                            isOpen={isApprovalDrawer}
                            anchor={'right'}
                            approvalData={[]}
                            type={'Sender'}
                            simulationDetail={simulationDetail}
                            selectedRowData={selectedRowData}
                            costingArr={costingArr}
                            master={selectedMasterForSimulation ? selectedMasterForSimulation.label : master}
                            closeDrawer={closeDrawer}
                            isSimulation={true}
                        // isSaveDone={isSaveDone}
                        />}

                    {isVerifyImpactDrawer &&
                        <VerifyImpactDrawer
                            isOpen={isVerifyImpactDrawer}
                            anchor={'right'}
                            approvalData={[]}
                            type={'Approve'}
                            closeDrawer={verifyImpactDrawer}
                            isSimulation={true}
                        />}
                </div>
            }

            {showApprovalHistory && <Redirect to='/simulation-history' />}

            {CostingDetailDrawer &&
                <CostingDetailSimulationDrawer
                    isOpen={CostingDetailSimulationDrawer}
                    closeDrawer={closeDrawer2}
                    anchor={"right"}
                    pricesDetail={pricesDetail}
                    simulationDetail={simulationDetail}
                    selectedRowData={selectedRowData}
                    costingArr={costingArr}
                    master={selectedMasterForSimulation ? selectedMasterForSimulation.label : master}
                    closeDrawer={closeDrawer}
                    isSimulation={true}
                />}
        </>

    );
}

export default CostingSimulation;