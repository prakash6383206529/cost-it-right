import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form'
import { Row, Col, } from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import NoContentFound from '../../common/NoContentFound';
import { CONSTANT } from '../../../helper/AllConastant';
import { SearchableSelectHookForm } from '../../layout/HookFormInputs';
import { getVerifySimulationList } from '../actions/Simulation';
import RunSimulationDrawer from './RunSimulationDrawer';
import CostingSimulation from './CostingSimulation';
import { checkForDecimalAndNull, getConfigurationKey } from '../../../helper';


function VerifySimulation(props) {
    const { cancelVerifyPage } = props
    console.log(props.token, "TOKEN");
    const [selectedRowData, setSelectedRowData] = useState([]);
    console.log('selectedRowData: ', selectedRowData);
    const [selectedIds, setSelectedIds] = useState('')
    const [tokenNo, setTokenNo] = useState('')
    const [simulationId, setSimualtionId] = useState('')
    const [simulationDrawer, setSimulationDrawer] = useState(false)
    const [costingPage, setSimulationCostingPage] = useState(false)

    const { register, handleSubmit, control, setValue, errors, getValues } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    })

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(getVerifySimulationList(props.token, (res) => {
            if (res.data.Result) {
                const data = res.data.Data
                setTokenNo(data.TokenId)
                setSimualtionId(data.SimulationId)
            }
        }))
    }, [])


    const verifyList = useSelector(state => state.simulation.simulationVerifyList)

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

    const RMName = () => {
        return <>RM <br />Name </>
    }

    const renderOldBR = () => {
        return <>Old <br />Basic Rate</>
    }

    const renderNewBR = () => {
        return <>New <br />Basic Rate</>
    }

    const renderOldSR = () => {
        return <>Old <br />Scrap Rate</>
    }

    const renderNewSR = () => {
        return <>New <br />Scrap Rate</>
    }


    const buttonFormatter = (cell, row, enumObject, rowIndex) => {
        return (
            <>
                <button className="View" type={'button'} onClick={() => { }} />
            </>
        )
    }
    const newBRFormatter = (cell, row, enumObject, rowIndex) => {
        const classGreen = (row.NewBasicRate > row.OldBasicRate) ? 'red-value' : (row.NewBasicRate < row.OldBasicRate) ? 'green-value' : 'no-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const newSRFormatter = (cell, row, enumObject, rowIndex) => {
        const classGreen = (row.NewScrapRate > row.OldScrapRate) ? 'red-value' : (row.NewScrapRate < row.OldScrapRate) ? 'green-value' : 'no-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
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
        prePage: <span className="prev-page-pg"></span>, // Previous page button text
        nextPage: <span className="next-page-pg"></span>, // Next page button text
        firstPage: <span className="first-page-pg"></span>, // First page button text
        lastPage: <span className="last-page-pg"></span>,
    };

    const runSimulation = () => {

        setSimulationDrawer(true)
    }
    const closeDrawer = (e = '', mode) => {
        if (mode === true) {
            setSimulationDrawer(false)
            setSimulationCostingPage(true)
        } else {
            setSimulationDrawer(false)
        }

    }
    return (
        <>
            {
                !costingPage &&
                <>
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
                                data={verifyList}
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
                                pagination>
                                <TableHeaderColumn dataField="CostingId" isKey={true} hidden width={100} dataAlign="center" searchable={false} >{''}</TableHeaderColumn>
                                <TableHeaderColumn dataField="CostingId" width={100} columnTitle={true} editable={false} dataAlign="left" dataSort={true}>{'Costing ID'}</TableHeaderColumn>
                                <TableHeaderColumn dataField="VendorName" width={100} columnTitle={true} editable={false} dataAlign="left" >{renderVendorName()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="PlantCode" width={100} columnTitle={true} editable={false} dataAlign="left" >{renderPlantCode()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="PartNo" width={100} columnTitle={true} editable={false} dataAlign="left" >{'Part No.'}</TableHeaderColumn>
                                <TableHeaderColumn dataField="PartDescription" width={100} columnTitle={true} editable={false} dataAlign="left" >{renderDescription()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="ECNNumber" width={100} columnTitle={true} editable={false} dataAlign="left" >{renderECN()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="RevisionNumber" width={100} columnTitle={true} editable={false} dataAlign="left" >{revisionNumber()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="RMName" width={70} columnTitle={true} editable={false} dataAlign="left" >{RMName()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="POPrice" width={100} columnTitle={true} editable={false} dataAlign="left" >{OldPo()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="OldBasicRate" width={100} columnTitle={true} editable={false} dataAlign="left" >{renderOldBR()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="NewBasicRate" width={100} columnTitle={true} editable={false} dataFormat={newBRFormatter} dataAlign="left" >{renderNewBR()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="OldScrapRate" width={100} columnTitle={true} editable={false} dataAlign="left" >{renderOldSR()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="NewScrapRate" width={100} columnTitle={true} editable={false} dataFormat={newSRFormatter} dataAlign="left" >{renderNewSR()}</TableHeaderColumn>


                            </BootstrapTable>

                        </Col>
                    </Row>
                    <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                        <div className="col-sm-12 text-right bluefooter-butn">
                            <button type={"button"} className="mr15 cancel-btn" onClick={cancelVerifyPage}>
                                <div className={"cross-icon"}>
                                    <img src={require("../../../assests/images/times.png")} alt="cancel-icon.jpg"
                                    />
                                </div>{" "}
                                {"CANCEL"}
                            </button>
                            <button onClick={runSimulation} type="submit" className="user-btn mr5 save-btn"                    >
                                <div className={"Run-icon"}>
                                </div>{" "}
                                {"RUN SIMULATION"}
                            </button>
                            {/* <button class="user-btn approval-btn mr-3" onClick={() => { }}>
                        <img class="mr-1" src={require('../../../assests/images/send-for-approval.svg')}></img>{' '}
                        {'Send For Approval'}
                    </button>
                    <button type="submit" className="user-btn mr5 save-btn">
                        <div className={"check-icon"}>
                            <img
                                src={require("../../../assests/images/check.png")}
                                alt="check-icon.jpg"
                            />
                        </div>{" "}
                        {"Save Simulation"}
                    </button> */}
                        </div>
                    </Row>
                </>
            }
            {
                costingPage &&
                <CostingSimulation />
            }
            {
                simulationDrawer &&
                <RunSimulationDrawer
                    isOpen={simulationDrawer}
                    closeDrawer={closeDrawer}
                    anchor={"right"}
                />
            }
        </>
    );
}

export default VerifySimulation;