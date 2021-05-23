import React, { useState } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form'
import { Row, Col, } from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getRMDomesticDataList } from '../../masters/actions/Material';
import NoContentFound from '../../common/NoContentFound';
import { CONSTANT } from '../../../helper/AllConastant';
import { SearchableSelectHookForm } from '../../layout/HookFormInputs';
import { getCostingSimulationList, getVerifySimulationList } from '../actions/Simulation';
import RunSimulationDrawer from './RunSimulationDrawer';
import ApproveRejectDrawer from '../../costing/components/approval/ApproveRejectDrawer'
import CostingDetailSimulationDrawer from './CostingDetailSimulationDrawer'
import { checkForDecimalAndNull, getConfigurationKey } from '../../../helper';
import SimulationHistory from './SimulationHistory';

function CostingSimulation(props) {
    const { simulationId } = props
    const [selectedRowData, setSelectedRowData] = useState([]);
    const [selectedIds, setSelectedIds] = useState('')
    const [tokenNo, setTokenNo] = useState('')
    const [CostingDetailDrawer, setCostingDetailDrawer] = useState(false)
    const [simulationDrawer, setSimulationDrawer] = useState(false)
    const [isApprovalDrawer, setIsApprovalDrawer] = useState(false)
    const [showApprovalHistory, setShowApprovalHistory] = useState(false)
    const [id, setId] = useState('')

    const { register, handleSubmit, control, setValue, errors, getValues } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    })

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(getCostingSimulationList(simulationId, (res) => {
            if (res.data.Result) {
                const tokenNo = res.data.Data.TokenId
                setTokenNo(tokenNo)
            }
        }))
    }, [])


    const costingList = useSelector(state => state.simulation.costingSimulationList)

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

    const onRowSelect = (row, isSelected, e) => {
        if (isSelected) {
            let tempArr = [...selectedRowData, row]
            setSelectedRowData(tempArr)
        } else {
            const CostingId = row.CostingId;
            let tempArr = selectedRowData && selectedRowData.filter(el => el.CostingId !== CostingId)
            setSelectedRowData(tempArr)
        }
    }

    const onSelectAll = (isSelected, rows) => {
        if (isSelected) {
            setSelectedRowData(rows)
        } else {
            setSelectedRowData([])
        }
    }

    const renderDropdownListing = (label) => {

    }

    const onSaveSiualtion = () => {

        setShowApprovalHistory(true)
    }

    // const onExportToCSV = (onClick) => {
    //     // Custom your onClick event here,
    //     // it's not necessary to implement this function if you have no any process before onClick
    //     
    // }

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
        onExportToCSV: onExportToCSV,
        // exportCSVText: 'Custom Export CSV Text',
        prePage: <span className="prev-page-pg"></span>, // Previous page button text
        nextPage: <span className="next-page-pg"></span>, // Next page button text
        firstPage: <span className="first-page-pg"></span>, // First page button text
        lastPage: <span className="last-page-pg"></span>,
    };

    const sendForApproval = () => {
        setIsApprovalDrawer(true)
    }

    const closeDrawer = () => {
        setIsApprovalDrawer(false)
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

                <div className="show-table-btn">
                    <Row>
                        <Col sm="12">
                            <h1 class="mb-0">Token No:{tokenNo}</h1>
                        </Col>
                    </Row>
                    <Row className="filter-row-large pt-4">
                        <Col lg="10" md="12" className="filter-block">
                            <div className="d-inline-flex justify-content-start align-items-top w100">
                                <div className="flex-fills">
                                    <h5>{`Filter By:`}</h5>
                                </div>

                                <div className="flex-fill filled-small hide-label">
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
                                <div className="flex-fill filled-small hide-label">
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
                                <div className="flex-fill filled-small hide-label">
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

                                <div className="flex-fill filled-small hide-label">
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
                                csvFileName='table-export.csv'
                            >
                                <TableHeaderColumn dataField="SimulationCostingId" isKey={true} hidden width={100} dataAlign="center" searchable={false} >{''}</TableHeaderColumn>
                                <TableHeaderColumn dataField="CostingId" width={100} export hidden columnTitle={true} editable={false} dataAlign="left" dataSort={true}>{'Costing ID'}</TableHeaderColumn>
                                <TableHeaderColumn dataField="VendorName" width={100} export hidden columnTitle={true} editable={false} dataAlign="left" >{renderVendorName()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="PlantCode" width={100} columnTitle={true} editable={false} dataAlign="left" >{renderPlantCode()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="PartNo" width={100} columnTitle={true} editable={false} dataAlign="left" >{'Part No.'}</TableHeaderColumn>
                                <TableHeaderColumn dataField="PartDescription" width={100} columnTitle={true} editable={false} dataAlign="left" >{renderDescription()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="ECNNumber" width={100} columnTitle={true} editable={false} dataAlign="left" >{renderECN()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="RevisionNumber" width={100} columnTitle={true} editable={false} dataAlign="left" >{revisionNumber()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="OldPOPrice" width={100} columnTitle={true} editable={false} dataAlign="left" dataFormat={oldPOFormatter} >{OldPo()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="NewPOPrice" width={100} columnTitle={true} editable={false} dataAlign="left" dataFormat={newPOFormatter} >{NewPO()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="OldRMCost" width={100} columnTitle={true} dataFormat={oldRMFormatter} editable={false} dataAlign="left" >{renderOldRM()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="NewRMCost" width={100} columnTitle={true} dataFormat={newRMFormatter} editable={false} dataAlign="left" >{renderNewRM()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="SimulationCostingId" width={100} columnTitle={true} editable={false} dataFormat={buttonFormatter}>Actions</TableHeaderColumn>
                            </BootstrapTable>

                        </Col>
                    </Row>
                    <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                        <div className="col-sm-12 text-right bluefooter-butn">

                            <button class="user-btn approval-btn mr-3" onClick={sendForApproval}>
                                <img class="mr-1" src={require('../../../assests/images/send-for-approval.svg')}></img>{' '}
                                {'Send For Approval'}
                            </button>
                            <button type="submit" className="user-btn mr5 save-btn" onClick={onSaveSiualtion}>
                                <div className={"check-icon"}>
                                    <img
                                        src={require("../../../assests/images/check.png")}
                                        alt="check-icon.jpg"
                                    />
                                </div>{" "}
                                {"Save Simulation"}
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
                            type={'Approve'}
                            closeDrawer={closeDrawer}
                            isSimulation={true}
                        />
                    }
                </div>
            }
            {
                showApprovalHistory &&
                <SimulationHistory />
            }

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