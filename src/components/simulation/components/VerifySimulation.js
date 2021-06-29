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
import { checkForDecimalAndNull, getConfigurationKey, loggedInUserId } from '../../../helper';
import { toastr } from 'react-redux-toastr';
import { getPlantSelectListByType } from '../../../actions/Common';
import { EMPTY_GUID, ZBC } from '../../../config/constants';
import { getRawMaterialNameChild } from '../../masters/actions/Material';


function VerifySimulation(props) {
    const { cancelVerifyPage } = props
    const [shown,setshown] = useState(false);
    const [selectedRowData, setSelectedRowData] = useState([]);

    const [selectedIds, setSelectedIds] = useState('')
    const [tokenNo, setTokenNo] = useState('')
    const [simulationId, setSimualtionId] = useState('')
    const [hideRunButton, setHideRunButton] = useState(false)
    const [simulationDrawer, setSimulationDrawer] = useState(false)
    const [costingPage, setSimulationCostingPage] = useState(false)
    const [material, setMaterial] = useState([])
    const [objs, setObj] = useState({})

    const { register, handleSubmit, control, setValue, errors, getValues } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    })

    const dispatch = useDispatch()

    useEffect(() => {
        verifyCostingList()
        dispatch(getPlantSelectListByType(ZBC, () => { }))
        dispatch(getRawMaterialNameChild(() => { }))
    }, [])

    const verifyCostingList = (plantId = '', rawMatrialId = '') => {
        dispatch(getVerifySimulationList(props.token, plantId, rawMatrialId, (res) => {
            if (res.data.Result) {
                const data = res.data.Data
                if (data.SimulationImpactedCostings.length === 0) {
                    toastr.warning('No approved costing exist for this raw material.')
                    setHideRunButton(true)
                    return false
                }
                setTokenNo(data.TokenId)
                setSimualtionId(data.SimulationId)
                setHideRunButton(false)
            }
        }))
    }


    const verifyList = useSelector(state => state.simulation.simulationVerifyList)

    const plantSelectList = useSelector(state => state.comman.plantSelectList)

    const { rawMaterialNameSelectList } = useSelector(state => state.material)


    const renderCostingNumber = () => {
        return <>Costing <br /> Number </>
    }

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
        const classGreen = (row.NewBasicRate > row.OldBasicRate) ? 'red-value form-control' : (row.NewBasicRate < row.OldBasicRate) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : '-'
    }

    const newSRFormatter = (cell, row, enumObject, rowIndex) => {
        const classGreen = (row.NewScrapRate > row.OldScrapRate) ? 'red-value form-control' : (row.NewScrapRate < row.OldScrapRate) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : '-'
    }

    const descriptionFormatter = (cell, row, enumObject, rowIndex) => {
        return (cell != null && cell.length !== 0) ? cell : '-'
    }

    const ecnFormatter = (cell, row, enumObject, rowIndex) => {
        return (cell != null && cell.length !== 0) ? cell : '-'
    }

    const revisionFormatter = (cell, row, enumObject, rowIndex) => {
        return (cell != null && cell.length !== 0) ? cell : '-'
    }

    const renderPlant = (cell, row, enumObject, rowIndex) => {
        // return (cell !== null && cell !== '-') ? `${cell}(${row.PlantCode})` : '-'
        return (cell !== null && cell !== '-') ? `${cell}` : '-'

    }

    const renderVendor = (cell, row, enumObject, rowIndex) => {
        return (cell !== null && cell !== '-') ? `${cell}(${row.VendorCode})` : '-'
    }

    const renderRM = (cell, row, enumObject, rowIndex) => {
        return `${cell}-${row.RMGrade ? row.RMGrade : '-'}`
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
        if (selectedRowData.length === 0) {
            toastr.warning('Please select atleast one costing.')
            return false
        }

        let obj = {};
        obj.SimulationId = simulationId
        obj.LoggedInUserId = loggedInUserId()
        let tempArr = []

        selectedRowData && selectedRowData.map(item => {
            let tempObj = {}
            tempObj.RawMaterialId = item.RawMaterialId
            tempObj.CostingId = item.CostingId
            tempArr.push(tempObj)
            return null;
        })

        obj.RunSimualtionCostingInfo = tempArr
        setObj(obj)
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

    const handleMaterial = (value) => {
        setMaterial(value)
    }


    const filterList = () => {
        const plant = getValues('plantCode').value

        verifyCostingList(plant, material.value)
    }
    const resetFilter = () => {
        setValue('plantCode', '')
        setValue('rawMaterial', '')
        verifyCostingList('', '')
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
                    <Row className="filter-row-large pt-4 blue-before">
                        {shown &&
                        <Col lg="8" md="8" className="filter-block">
                            <div className="d-inline-flex justify-content-start align-items-top w100">
                                <div className="flex-fills">
                                    <h5>{`Filter By:`}</h5>
                                </div>

                                {/* <div className="flex-fill filled-small hide-label">
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
                                <div className="flex-fill  hide-label">
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
                                <div className="flex-fill  hide-label">
                                    <SearchableSelectHookForm
                                        label={''}
                                        name={'material'}
                                        placeholder={'Raw Material'}
                                        Controller={Controller}
                                        control={control}
                                        rules={{ required: false }}
                                        register={register}
                                        // defaultValue={plant.length !== 0 ? plant : ''}
                                        options={renderDropdownListing('material')}
                                        mandatory={false}
                                        handleChange={handleMaterial}
                                        errors={errors.material}
                                    />
                                </div>

                                <div className="flex-fill  hide-label">
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
                        <Col md="2" lg="2" className="search-user-block mb-3">
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
                                className="add-volume-table verify-simulation-table"
                                pagination>
                                <TableHeaderColumn dataField="CostingId" isKey={true} hidden width={100} dataAlign="center" searchable={false} >{''}</TableHeaderColumn>
                                <TableHeaderColumn dataField="CostingNumber" width={100} columnTitle={true} editable={false} dataAlign="left" dataSort={true}>{renderCostingNumber()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="VendorName" width={100} columnTitle={true} editable={false} dataFormat={renderVendor} dataAlign="left" >{renderVendorName()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="PlantCode" width={100} columnTitle={true} editable={false} dataFormat={renderPlant} dataAlign="left" >{renderPlantCode()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="PartNo" width={100} columnTitle={true} editable={false} dataAlign="left" >{'Part No.'}</TableHeaderColumn>
                                <TableHeaderColumn dataField="PartName" width={100} columnTitle={true} editable={false} dataAlign="left" dataFormat={descriptionFormatter} >{renderDescription()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="ECNNumber" width={100} columnTitle={true} editable={false} dataAlign="left" dataFormat={ecnFormatter} >{renderECN()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="RevisionNumber" width={100} columnTitle={true} editable={false} dataAlign="left" dataFormat={revisionFormatter} >{revisionNumber()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="RMName" width={70} columnTitle={true} editable={false} dataAlign="left" dataFormat={renderRM} >{RMName()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="POPrice" width={100} columnTitle={true} editable={false} dataAlign="left" >{OldPo()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="OldBasicRate" width={100} columnTitle={true} editable={false} dataAlign="left" >{renderOldBR()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="NewBasicRate" width={100} columnTitle={true} editable={false} dataFormat={newBRFormatter} dataAlign="left" >{renderNewBR()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="OldScrapRate" width={100} columnTitle={true} editable={false} dataAlign="left" >{renderOldSR()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="NewScrapRate" width={100} columnTitle={true} editable={false} dataFormat={newSRFormatter} dataAlign="left" >{renderNewSR()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="RawMaterialId" width={100} columnTitle={true} editable={false} hidden ></TableHeaderColumn>

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
                            <button onClick={runSimulation} type="submit" disabled={hideRunButton} className="user-btn mr5 save-btn"                    >
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
                <CostingSimulation simulationId={simulationId} />
            }
            {
                simulationDrawer &&
                <RunSimulationDrawer
                    isOpen={simulationDrawer}
                    closeDrawer={closeDrawer}
                    objs={objs}
                    anchor={"right"}
                />
            }
        </>
    );
}

export default VerifySimulation;