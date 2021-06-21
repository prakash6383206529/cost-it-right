import React, { useState } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form'
import { Row, Col, } from 'reactstrap';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getRMDomesticDataList } from '../../masters/actions/Material';
import NoContentFound from '../../common/NoContentFound';
import { CONSTANT } from '../../../helper/AllConastant';
import { SearchableSelectHookForm } from '../../layout/HookFormInputs';
import { getCostingSimulationList, getVerifySimulationList, saveSimulationForRawMaterial } from '../actions/Simulation';
import RunSimulationDrawer from './RunSimulationDrawer';
import ApproveRejectDrawer from '../../costing/components/approval/ApproveRejectDrawer'
import CostingDetailSimulationDrawer from './CostingDetailSimulationDrawer'
import { checkForDecimalAndNull, getConfigurationKey, userDetails } from '../../../helper';
import SimulationHistory from './SimulationHistory';
import VerifyImpactDrawer from './VerifyImpactDrawer';
import { RMDOMESTIC, RMIMPORT, simulationMaster } from '../../../config/constants';
import { toastr } from 'react-redux-toastr';
import SimulationApprovalListing from './SimulationApprovalListing';

function CostingSimulation(props) {
    const { simulationId } = props
    const [selectedRowData, setSelectedRowData] = useState([]);
    const [selectedIds, setSelectedIds] = useState('')
    const [tokenNo, setTokenNo] = useState('')
    const [CostingDetailDrawer, setCostingDetailDrawer] = useState(false)
    const [simulationDrawer, setSimulationDrawer] = useState(false)
    const [isVerifyImpactDrawer, setIsVerifyImpactDrawer] = useState(false)
    const [isApprovalDrawer, setIsApprovalDrawer] = useState(false)
    const [showApprovalHistory, setShowApprovalHistory] = useState(false)
    const [simulationDetail, setSimulationDetail] = useState('')
    const [costingArr, setCostingArr] = useState([])
    console.log('costingArr: ', costingArr);
    const [id, setId] = useState('')

    const { register, handleSubmit, control, setValue, errors, getValues } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    })

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(getCostingSimulationList(simulationId, (res) => {
            if (res.data.Result) {
                const tokenNo = res.data.Data.SimulationTokenNumber
                const Data = res.data.Data
                setTokenNo(tokenNo)
                setCostingArr(Data.SimulatedCostingList)
                setSimulationDetail({ TokenNo: Data.SimulationTokenNumber, Status: Data.SimulationStatus, SimulationId: Data.SimulationId, SimulationAppliedOn: Data.SimulationAppliedOn })
            }
        }))
    }, [])

    const costingList = useSelector(state => state.simulation.costingSimulationList)

    const selectedMasterForSimulation = useSelector(state => state.simulation.selectedMasterForSimulation)

    const renderVendorName = () => {
        return <>Vendor <br />Name </>
    }
    const renderPlantCode = () => {
        return <>Plant<br />Code </>
    }

    const renderDescription = () => {
        return <>Part <br />Description </>
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

    const viewCosting = (id) => {
        setId(id)
        runCostingDetailSimulation()
    }

    const buttonFormatter = (cell, row, enumObject, rowIndex) => {
        return (
            <>
                <button className="View" type={'button'} onClick={() => { viewCosting(cell) }} />
            </>
        )
    }

    const onRowSelect = (row, isSelected, e, rowIndex) => {
        if (isSelected) {
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
            costingArr && costingArr.map((item => {
                temp.push({ ...item, IsChecked: true })
            }))
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

    const renderDropdownListing = (label) => { }

    const onSaveSimulation = () => {
        let temp = []
        let obj = {}
        obj.SimulationId = simulationDetail.SimulationId
        obj.Token = simulationDetail.TokenNo
        obj.Currency = ""
        obj.EffectiveDate = ""
        obj.Remark = ""
        obj.LoggedInUserId = userDetails().LoggedInUserId
        obj.IsPartialSaved = selectedRowData.length === costingArr.length ? false : true
        costingArr && costingArr.map(item => {
            temp.push({ CostingId: item.CostingId, CostingNumber: item.CostingNumber, IsChecked: item.IsChecked ? item.IsChecked : false })
        })
        obj.SelectedCostings = temp

        switch (selectedMasterForSimulation.label) {
            case RMDOMESTIC:
                dispatch(saveSimulationForRawMaterial(obj, res => {
                    if (res.data.Result) {
                        toastr.success('Simulation saved successfully.')
                        setShowApprovalHistory(true)
                    }
                }))
                break;
            case RMIMPORT:
                dispatch(saveSimulationForRawMaterial(obj, res => {
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

    // const onExportToCSV = (onClick) => {
    //     // Custom your onClick event here,
    //     // it's not necessary to implement this function if you have no any process before onClick
    //     
    // }

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
    }

    const closeDrawer = () => {
        setIsApprovalDrawer(false);
        setIsVerifyImpactDrawer(false);
        setShowApprovalHistory(true)
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
                    <Row className="filter-row-large pt-4">
                        <Col lg="12" md="12" className="filter-block">
                            <div className="d-inline-flex justify-content-start align-items-top w100">
                                <div className="flex-fills">
                                    <h5>{`Filter By:`}</h5>
                                </div>

                                <div className="flex-fill hide-label">
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
                                </div>
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
                                        options={renderDropdownListing('plantCode')}
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
                                        options={renderDropdownListing('rm')}
                                        mandatory={false}
                                        handleChange={() => { }}
                                        errors={errors.rawMaterial}
                                    />
                                </div>

                                <div className="flex-fill hide-label text-right">
                                    <button
                                        type="button"
                                        //disabled={pristine || submitting}
                                        onClick={() => { }}
                                        className="reset mr10"
                                    >
                                        {'Reset'}
                                    </button>
                                    <button
                                        type="button"
                                        //disabled={pristine || submitting}
                                        onClick={() => { }}
                                        className="apply mr5"
                                    >
                                        {'Apply'}
                                    </button>
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
                                <TableHeaderColumn dataField="VendorName" width={100} export columnTitle={true} editable={false} dataAlign="left" >{renderVendorName()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="PlantCode" width={100} columnTitle={true} editable={false} dataAlign="left" >{renderPlantCode()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="PartNo" width={100} columnTitle={true} editable={false} dataAlign="left" >{'Part No.'}</TableHeaderColumn>
                                <TableHeaderColumn dataField="PartDescription" width={100} columnTitle={true} editable={false} dataAlign="left" >{renderDescription()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="Technology" width={100} columnTitle={true} editable={false} dataAlign="left">{'Technology'}</TableHeaderColumn>
                                <TableHeaderColumn dataField="ECNNumber" width={100} columnTitle={true} editable={false} dataAlign="left" >{renderECN()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="RevisionNumber" width={100} columnTitle={true} editable={false} dataAlign="left" >{revisionNumber()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="OldPOPrice" width={100} columnTitle={true} editable={false} dataAlign="left" dataFormat={oldPOFormatter} >{OldPo()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="NewPOPrice" width={100} columnTitle={true} editable={false} dataAlign="left" dataFormat={newPOFormatter} >{NewPO()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="OldRMPrice" width={100} columnTitle={true} dataFormat={oldRMFormatter} editable={false} dataAlign="left" >{renderOldRM()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="NewRMPrice" width={100} columnTitle={true} dataFormat={newRMFormatter} editable={false} dataAlign="left" >{renderNewRM()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="SimulationCostingId" width={100} columnTitle={true} editable={false} dataFormat={buttonFormatter}>Actions</TableHeaderColumn>
                            </BootstrapTable>

                        </Col>
                    </Row>
                    <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                        <div className="col-sm-12 text-right bluefooter-butn">

                            <button
                                class="user-btn approval-btn mr-3"
                                onClick={sendForApproval}
                                disabled={selectedRowData && selectedRowData.length === 0 ? true : false}
                            >
                                <img class="mr-1" src={require('../../../assests/images/send-for-approval.svg')} />
                                {'Send For Approval'}
                            </button>
                            <button
                                type="button"
                                className="user-btn mr5 save-btn"
                                disabled={selectedRowData && selectedRowData.length === 0 ? true : false}
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
                    {/* <button type="submit" className="user-btn mr5 save-btn" onClick={runCostingDetailSimulation}>
                        <div className={"check-icon"}>
                            <img
                                src={require("../../../assests/images/check.png")}
                                alt="check-icon.jpg"
                            />
                        </div>{" "}
                        {"Save Simulation"}
                    </button> */}
                    {
                        isApprovalDrawer &&
                        <ApproveRejectDrawer
                            isOpen={isApprovalDrawer}
                            anchor={'right'}
                            approvalData={[]}
                            type={'Sender'}
                            simulationDetail={simulationDetail}
                            selectedRowData={selectedRowData}
                            costingArr={costingArr}
                            master={selectedMasterForSimulation.label}
                            closeDrawer={closeDrawer}
                            isSimulation={true}
                        />
                    }
                    {
                        isVerifyImpactDrawer &&
                        <VerifyImpactDrawer
                            isOpen={isVerifyImpactDrawer}
                            anchor={'right'}
                            approvalData={[]}
                            type={'Approve'}
                            closeDrawer={closeDrawer}
                            isSimulation={true}
                        />
                    }
                </div>
            }

            {showApprovalHistory && <SimulationApprovalListing />}

            {
                CostingDetailDrawer &&
                <CostingDetailSimulationDrawer
                    isOpen={CostingDetailSimulationDrawer}
                    closeDrawer={closeDrawer2}
                    anchor={"right"}
                />
            }
        </>

    );
}

export default CostingSimulation;