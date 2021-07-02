
import React, { useEffect,useState } from 'react'
import { Row, Col, Table } from 'reactstrap'
import HeaderTitle from '../../common/HeaderTitle';
import moment from 'moment'
import { Fragment } from 'react'
import ApprovalWorkFlow from '../../costing/components/approval/ApprovalWorkFlow';
import SimulationApprovalListing from './SimulationApprovalListing'
import ViewDrawer from '../../costing/components/approval/ViewDrawer'
import { SearchableSelectHookForm } from '../../layout/HookFormInputs'
import { useForm, Controller } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { costingHeadObjs } from '../../../config/masterData';
import { getPlantSelectListByType, getTechnologySelectList } from '../../../actions/Common';
import { getApprovalSimulatedCostingSummary, getComparisionSimulationData } from '../actions/Simulation'
import { ZBC } from '../../../config/constants';
import CostingSummaryTable from '../../costing/components/CostingSummaryTable';
import { checkForDecimalAndNull, formViewData,checkForNull, getConfigurationKey, loggedInUserId } from '../../../helper';
import { runVerifySimulation } from '../actions/Simulation';
import ApproveRejectDrawer from '../../costing/components/approval/ApproveRejectDrawer';
import LoaderCustom from '../../common/LoaderCustom';
import VerifyImpactDrawer from './VerifyImpactDrawer';
import { setCostingViewData } from '../../costing/actions/Costing';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import { CONSTANT } from '../../../helper/AllConastant';
import NoContentFound from '../../common/NoContentFound';
import { Redirect } from 'react-router';
import RMDomesticListing from '../../masters/material-master/RMDomesticListing';
import { toastr } from 'react-redux-toastr';

function SimulationApprovalSummary(props) {
    // const { isDomestic, list, isbulkUpload, rowCount, technology, master } = props
    const { approvalDetails, approvalData,isbulkUpload,list,technology,master } = props;
    const { approvalNumber, approvalId } = props.location.state
    const [shown, setshown] = useState(false)
    const [amendment, setAmendment] = useState(true)
    const [token, setToken] = useState('')
    const [showverifyPage, setShowVerifyPage] = useState(false)
    const [showImpactedData,setshowImpactedData] = useState(false)

    const rmDomesticListing = useSelector(state => state.material.rmDataList)

    const [showListing, setShowListing] = useState(false)
    const [approveDrawer, setApproveDrawer] = useState(false)
    const [rejectDrawer, setRejectDrawer] = useState(false)
    const [viewButton, setViewButton] = useState(false)
    const [costingSummary, setCostingSummary] = useState(true)
    const [costingList, setCostingList] = useState([])
    const [simulationDetail, setSimulationDetail] = useState({})
    const [approvalLevelStep, setApprovalLevelStep] = useState([])
    const [isApprovalDone, setIsApprovalDone] = useState(false) // this is for hiding approve and  reject button when costing is approved and  send for futher approval
    const [showFinalLevelButtons, setShowFinalLevelButton] = useState(false) //This is for showing approve ,reject and approve and push button when costing approval is at final level for aaproval
    const [showPushButton, setShowPushButton] = useState(false) // This is for showing push button when costing is approved and need to push it for scheduling
    const [hidePushButton, setHideButton] = useState(false) // This is for hiding push button ,when it is send for push for scheduling.
    const [pushButton, setPushButton] = useState(false)
    const [loader, setLoader] = useState(true)


    const [compareCosting, setCompareCosting] = useState(false)
    const [compareCostingObj, setCompareCostingObj] = useState([])
    const [isVerifyImpactDrawer, setIsVerifyImpactDrawer] = useState(false)
    const [id, setId] = useState('')

    const dispatch = useDispatch()

    const partSelectList = useSelector((state) => state.costing.partSelectList)
    const statusSelectList = useSelector((state) => state.approval.costingStatusList)
    const approvalSimulatedCostingSummary = useSelector((state) => state.approval.approvalSimulatedCostingSummary)
    const userList = useSelector(state => state.auth.userList)
    const { technologySelectList, plantSelectList } = useSelector(state => state.comman)

    

    const { register, handleSubmit, control, setValue, errors, getValues } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    })

    const selectedTechnologyForSimulation = useSelector(state => state.simulation.selectedTechnologyForSimulation)
    
    useEffect(() => {
        dispatch(getTechnologySelectList(() => { }))
        dispatch(getPlantSelectListByType(ZBC, () => { }))

        const reqParams = {
            approvalTokenNumber: approvalNumber,
            approvalId: approvalId,
            loggedInUserId: loggedInUserId(),
        }
        dispatch(getApprovalSimulatedCostingSummary(reqParams, res => {
            const { SimulationSteps, SimulatedCostingList, SimulationApprovalProcessId, Token, NumberOfCostings, IsSent, IsFinalLevelButtonShow, IsPushedButtonShow, SimulationTechnologyId, SimulationApprovalProcessSummaryId, DepartmentCode, EffectiveDate, SimulationId, SenderReason } = res.data.Data
            setCostingList(SimulatedCostingList)
            setApprovalLevelStep(SimulationSteps)
            setSimulationDetail({ SimulationApprovalProcessId: SimulationApprovalProcessId, Token: Token, NumberOfCostings: NumberOfCostings, SimulationTechnologyId: SimulationTechnologyId, SimulationApprovalProcessSummaryId: SimulationApprovalProcessSummaryId, DepartmentCode: DepartmentCode, EffectiveDate: EffectiveDate, SimulationId: SimulationId, SenderReason: SenderReason })
            setIsApprovalDone(IsSent)
            // setIsApprovalDone(false)
            setShowFinalLevelButton(IsFinalLevelButtonShow)
            setShowPushButton(IsPushedButtonShow)
            setLoader(false)
        }))
    }, [])   

    const closeViewDrawer = (e = '') => {
        setViewButton(false)
    }

    const closeApproveDrawer = (e = '', type) => {
        if (type === 'submit') {
            setApproveDrawer(false)
            setShowListing(true)
            setRejectDrawer(false)
        } else {
            setApproveDrawer(false)
            setRejectDrawer(false)
        }
    }

    const renderDropdownListing = (label) => {
        const tempDropdownList = []

        if (label === 'costingHead') {
            return costingHeadObjs;
        }

        if (label === 'PartList') {
            partSelectList && partSelectList.map((item) => {
                if (item.Value === '0') return false
                tempDropdownList.push({ label: item.Text, value: item.Value })
                return null
            })

            return tempDropdownList
        }

        if (label === 'plant') {
            plantSelectList && plantSelectList.map(item => {
                if (item.Value === '0') return false;
                tempDropdownList.push({ label: item.Text, value: item.Value })
            });
            return tempDropdownList;
        }

        if (label === 'Status') {
            statusSelectList && statusSelectList.map((item) => {
                if (item.Value === '0') return false
                tempDropdownList.push({ label: item.Text, value: item.Value })
                return null
            })
            return tempDropdownList
        }

        if (label === 'users') {
            userList && userList.map((item) => {
                if (item.Value === '0') return false
                tempDropdownList.push({ label: item.Text, value: item.Value })
                return null
            })
            return tempDropdownList
        }

        if (label === 'technology') {
            technologySelectList && technologySelectList.map((item) => {
                if (item.Value === '0') return false
                tempDropdownList.push({ label: item.Text, value: item.Value })
                return null
            })
            return tempDropdownList
        }
    }

    /**
    * @method resetHandler
    * @description Reseting all filter
    */
    const resetHandler = () => {
        setValue('partNo', '')
        setValue('createdBy', '')
        setValue('requestedBy', '')
        setValue('status', '')
        // getTableData()
    }

    const DisplayCompareCosting = (el, data) => {
        setId(data.CostingNumber)
        // setCompareCostingObj(el)
        dispatch(getComparisionSimulationData(el, res => {
            const Data = res.data.Data
            const obj1 = formViewData(Data.OldCosting)
            const obj2 = formViewData(Data.NewCosting)
            const obj3 = formViewData(Data.Variance)
            const objj3 = [obj1[0], obj2[0], obj3[0]]
            setCompareCostingObj(objj3)
            dispatch(setCostingViewData(objj3))
            setCompareCosting(true)
        }))
    }

    /**
    * @method onSubmit
    * @description filtering data on Apply button
    */
    const onSubmit = (values) => {
        // const tempPartNo = getValues('partNo') ? getValues('partNo').value : '00000000-0000-0000-0000-000000000000'
        // const tempcreatedBy = getValues('createdBy') ? getValues('createdBy').value : '00000000-0000-0000-0000-000000000000'
        // const tempRequestedBy = getValues('requestedBy') ? getValues('requestedBy').value : '00000000-0000-0000-0000-000000000000'
        // const tempStatus = getValues('status') ? getValues('status').value : '00000000-0000-0000-0000-000000000000'
        // // const type_of_costing = 
        // getTableData(tempPartNo, tempcreatedBy, tempRequestedBy, tempStatus)
    }

    const VerifyImpact = () => {
        setIsVerifyImpactDrawer(true)
    }

    const verifyImpactDrawer = (e = '', type) => {
        if (type === 'cancel') {
            setIsVerifyImpactDrawer(false);
        }
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

    const renderRMName = () => {
        return <>Raw Material<br />-Grade</>
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

    const renderRM = () => {
        return <>Raw Material</>
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
        const classGreen = (row.NewRMPrice > row.OldRMPrice) ? 'red-value form-control' : (row.NewRMPrice < row.OldRMPrice) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const newRMFormatter = (cell, row, enumObject, rowIndex) => {
        const classGreen = (row.NewRMPrice > row.OldRMPrice) ? 'red-value form-control' : (row.NewRMPrice < row.OldRMPrice) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const rmNameFormatter = (cell, row, enumObject, rowIndex) => {
        return cell ? `${cell}-${row.RMGrade}` : '-'
    }


    const buttonFormatter = (cell, row, enumObject, rowIndex) => {
        return (
            <>
                <button className="Balance mb-0" type={'button'} onClick={() => DisplayCompareCosting(cell, row)} />
            </>
        )
    }

    const renderCostingHead = () => {
        return <>Costing Head </>
      }
    
      const renderRawMaterial = () => {
        return <>Raw Material </>
      }
    
      const renderRMGrade = () => {
        return <>RM Grade </>
      }
    
      const renderRMSpec = () => {
        return <>RM Spec </>
      }
    
      const newBasicRateFormatter = (cell, row, enumObject, rowIndex) => {
        return (
          <>
            <span className={`${!isbulkUpload ? '' : ''}`} >{cell ? cell : row.BasicRate} </span>
          </>
        )
      }

      const newScrapRateFormatter = (cell, row, enumObject, rowIndex) => {
        return (
          <>
            <span className={`${!isbulkUpload ? '' : ''}`} >{cell ? cell : row.ScrapRate}</span>
          </>
        )
      }
      const freightCostFormatter = (cell, row, enumObject, rowIndex) => {
        return cell != null ? cell : '-';
      }
      const shearingCostFormatter = (cell, row, enumObject, rowIndex) => {
        return cell != null ? cell : '-';
      }
    
      const rendorFreightRate = () => {
        return <>RM Freight <br /> Cost</>
      }

      const costFormatter = (cell, row, enumObject, rowIndex) => {
        const tempA = Number(row.NewBasicRate) + checkForNull(row.RMFreightCost) + checkForNull(row.RMShearingCost);
        const classGreen = (tempA > row.NetLandedCost) ? 'red-value form-control' : (tempA < row.NetLandedCost) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
      }

      const NewcostFormatter = (cell, row, enumObject, rowIndex) => {
        const NewBasicRate = Number(row.NewBasicRate) + checkForNull(row.RMFreightCost) + checkForNull(row.RMShearingCost)
        const classGreen = (NewBasicRate > row.NetLandedCost) ? 'red-value form-control' : (NewBasicRate < row.NetLandedCost) ? 'green-value form-control' : 'form-class'
        return row.NewBasicRate != null ? <span className={classGreen}>{checkForDecimalAndNull(NewBasicRate, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
        // checkForDecimalAndNull(NewBasicRate, getConfigurationKey().NoOfDecimalForPrice)
      }

      const effectiveDateFormatter = (cell, row, enumObject, rowIndex) => {
        return cell != null ? moment(cell).format('DD/MM/YYYY') : '-';
      }
    
      const renderShearingCost = () => {
        return <>Shearing <br /> Cost</>
      }
    
      const renderEffectiveDate = () => {
        return <>Effective <br /> Date</>
      }

    const options = {
        clearSearch: true,
        noDataText: <NoContentFound title={CONSTANT.EMPTY_DATA} />,
        prePage: <span className="prev-page-pg"></span>, // Previous page button text
        nextPage: <span className="next-page-pg"></span>, // Next page button text
        firstPage: <span className="first-page-pg"></span>, // First page button text
        lastPage: <span className="last-page-pg"></span>,
    };

    if (showListing === true) {
        return <Redirect to="/simulation-history" />
    }

    return (
        <>
            {showListing === false &&
                <>
                    {loader && <LoaderCustom />}
                    <div className="container-fluid approval-summary-page smh-approval-summary-page">
                        <h2 className="heading-main">Approval Summary</h2>
                        <Row>
                            <Col md="8">
                                <div className="left-border">
                                    {'Approval Workflow (Token No. '}
                                    {`${simulationDetail && simulationDetail.Token ? simulationDetail.Token : '-'}) :`}
                                </div>
                            </Col>
                            <Col md="4" className="text-right">
                                <div className="right-border">
                                    <button type={'button'} className="apply mr5" onClick={() => setShowListing(true)}>
                                        <div className={'check-icon'}><img src={require('../../../assests/images/back.png')} alt='check-icon.jpg' /> </div>
                                        {'Back '}
                                    </button>
                                    <button type={'button'} className="apply mr5" onClick={() => setViewButton(true)}>
                                        View All
                                    </button>
                                    <button className="user-btn mr5 save-btn" onClick={VerifyImpact}>
                                        <div className={"check-icon"}> <img src={require("../../../assests/images/check.png")} alt="check-icon.jpg" /></div>
                                        {"Verify Impact "}
                                    </button>
                                </div>
                            </Col>
                        </Row>

                        {/* Code for approval workflow */}
                        <ApprovalWorkFlow approvalLevelStep={approvalLevelStep} approvalNo={simulationDetail.Token} />

                        <Row className="mb-3">
                            <Col md="6"><div className="left-border">{'Impacted Master Data:'}</div></Col>
                            <Col md="6">
                                <div className={'right-details'}>
                                    <a onClick={() => setshowImpactedData(!showImpactedData)} className={`${showImpactedData ? 'minus-icon' : 'plus-icon'} pull-right`}></a>
                                </div>
                            </Col>
                            {showImpactedData &&
                            <div className="accordian-content w-100">
                                <Col md="12" className="mb-3">
                                <BootstrapTable
                                    data={rmDomesticListing}
                                    striped={false}
                                    bordered={true}
                                    hover={false}
                                    options={options}
                                    // exportCSV
                                    //ignoreSinglePage
                                    className="add-volume-table sm-headrgroup-table impact-drawer-table"
                                    pagination>
                                    {/* <TableHeaderColumn dataField="" width={50} dataAlign="center" dataFormat={this.indexFormatter}>{this.renderSerialNumber()}</TableHeaderColumn> */}
                                    {/* <TableHeaderColumn row='0' rowSpan='2' dataField="CostingHead" width={115} columnTitle={true} editable={false} dataAlign="left" dataSort={true} dataFormat={costingHeadFormatter}>{renderCostingHead()}</TableHeaderColumn> */}
                                    <TableHeaderColumn row='0' rowSpan='2' dataField="RawMaterial" width={110} columnTitle={true} editable={false} dataAlign="left" >{renderRawMaterial()}</TableHeaderColumn>
                                    <TableHeaderColumn row='0' rowSpan='2' dataField="RMGrade" width={110} columnTitle={true} editable={false} dataAlign="left" >{renderRMGrade()}</TableHeaderColumn>
                                    <TableHeaderColumn row='0' rowSpan='2' width={100} columnTitle={true} dataAlign="left" editable={false} dataField="RMSpec" >{renderRMSpec()}</TableHeaderColumn>
                                    <TableHeaderColumn row='0' rowSpan='2' width={100} columnTitle={true} dataAlign="left" editable={false} searchable={false} dataField="Category" >Category</TableHeaderColumn>
                                    {/* <TableHeaderColumn row='0' rowSpan='2' width={100} columnTitle={true} dataAlign="left" editable={false} dataField="TechnologyName" searchable={false} >Technology</TableHeaderColumn>
                                    <TableHeaderColumn row='0' rowSpan='2' width={150} columnTitle={true} dataAlign="left" editable={false} dataField="VendorName" >Vendor</TableHeaderColumn> */}
                                    <TableHeaderColumn row='0' rowSpan='2' width={110} columnTitle={true} dataAlign="left" editable={false} searchable={false} dataField="UOM" >UOM</TableHeaderColumn>
                                    <TableHeaderColumn row='0' tdStyle={{ minWidth: '200px', width: '200px' }} width={200} colSpan='2' dataAlign="center" columnTitle={false} editable={false} searchable={false} >Basic Rate (INR)</TableHeaderColumn>
                                    <TableHeaderColumn row='1' columnTitle={false} dataAlign="left" editable={false} searchable={false} dataField="BasicRate"  >Old</TableHeaderColumn>
                                    <TableHeaderColumn row='1' columnTitle={false} dataAlign="left" searchable={false} editable={isbulkUpload ? false : true} dataFormat={newBasicRateFormatter} dataField="NewBasicRate">New</TableHeaderColumn>
                                    <TableHeaderColumn row='0' tdStyle={{ minWidth: '200px', width: '200px' }} width={200} colSpan='2' dataAlign="center" columnTitle={false} editable={false} searchable={false}  >Scrap Rate (INR)</TableHeaderColumn>
                                    <TableHeaderColumn row='1' columnTitle={false} dataAlign="left" editable={false} searchable={false} dataField="ScrapRate" >Old</TableHeaderColumn>
                                    <TableHeaderColumn row='1' columnTitle={false} dataAlign="left" searchable={false} editable={isbulkUpload ? false : true} dataFormat={newScrapRateFormatter} dataField="NewScrapRate">New</TableHeaderColumn>
                                    <TableHeaderColumn row='0' rowSpan='2' columnTitle={true} width={100} dataAlign="left" dataField="RMFreightCost" dataFormat={freightCostFormatter} searchable={false}>{rendorFreightRate()}</TableHeaderColumn>
                                    <TableHeaderColumn row='0' rowSpan='2' columnTitle={true} width={100} dataAlign="left" dataField="RMShearingCost" dataFormat={shearingCostFormatter} searchable={false}>{renderShearingCost()}</TableHeaderColumn>
                                    <TableHeaderColumn row='0' tdStyle={{ minWidth: '200px', width: '200px' }} width={200} colSpan='2' columnTitle={false} dataAlign="center" editable={false} searchable={false} >Net Cost (INR)</TableHeaderColumn>
                                    <TableHeaderColumn row='1' columnTitle={true} dataAlign="left" editable={false} searchable={false} dataField="NetLandedCost" dataFormat={costFormatter} >Old</TableHeaderColumn>
                                    <TableHeaderColumn row='1' columnTitle={true} dataAlign="left" editable={false} searchable={false} dataField="NewNetLandedCost" dataFormat={NewcostFormatter} >New</TableHeaderColumn>
                                    <TableHeaderColumn row='0' rowSpan='2' width={100} columnTitle={true} dataAlign="left" editable={false} searchable={false} dataSort={true} dataField="EffectiveDate" dataFormat={effectiveDateFormatter} >{renderEffectiveDate()}</TableHeaderColumn>
                                    <TableHeaderColumn row='0' rowSpan='2' width={100} dataAlign="right" dataField="RawMaterialId" export={false} searchable={false} hidden isKey={true}>Actions</TableHeaderColumn>
                                </BootstrapTable>

                                </Col>
                            </div>
                            }
                        </Row>

                        <Row>
                            <Col md="10"><div className="left-border">{'Amendment Details:'}</div></Col>
                            {/* <Col md="2" className="text-right">
                                <div className="right-border">
                                    <button className="btn btn-small-primary-circle ml-1" type="button" onClick={() => { setAmendment(!amendment) }}>
                                        {amendment ? (
                                            <i className="fa fa-minus" ></i>
                                        ) : (
                                            <i className="fa fa-plus"></i>
                                        )}
                                    </button>
                                </div>
                            </Col> */}
                        </Row>
                        {/* {amendment && */}
                        <Row>
                            <Col md="12" className="mb-2">
                                <Table responsive className="table cr-brdr-main" size="sm">
                                    <thead>
                                        <tr>
                                            <th>
                                                <span className="d-block grey-text">{`Technology:`}</span>
                                                <span className="d-block">{costingList.length > 0 && costingList[0].Technology}</span>
                                            </th>
                                            <th>
                                                <span className="d-block grey-text">{`Costing Head:`}</span>
                                                <span className="d-block">{costingList.length > 0 && costingList[0].CostingHead}</span>
                                            </th>
                                            <th>
                                                <span className="d-block grey-text">{`No. Of Costing:`}</span>
                                                <span className="d-block">{simulationDetail.NumberOfCostings}</span>
                                            </th>
                                            <th>
                                                <span className="d-block grey-text">{`Reason:`}</span>
                                                <span className="d-block">{simulationDetail.SenderReason}</span>
                                            </th>
                                            <th>
                                                <span className="d-block grey-text">{`Token No.:`}</span>
                                                <span className="d-block">{simulationDetail.Token}</span>
                                            </th>
                                            <th>
                                                <span className="d-block grey-text">{`Masters:`}</span>
                                                <span className="d-block">{costingList.length > 0 && costingList[0].SimulationTechnology}</span>
                                            </th>
                                            <th>
                                                <span className="d-block grey-text">{`Vendor Name:`}</span>
                                                <span className="d-block">{costingList.length > 0 && costingList[0].VendorName}</span>
                                            </th>
                                            <th>
                                                <span className="d-block grey-text">{`Effective Date:`}</span>
                                                <span className="d-block">{moment(simulationDetail.EffectiveDate).format('DD/MM/yyy')}</span>
                                            </th>
                                        </tr>
                                    </thead>
                                </Table>
                            </Col>
                        </Row>
                        {/* } */}

                        <Row>
                            <Col md="10">
                                <div className="left-border">{'Summary:'}</div>
                            </Col>
                            <Col md="2" className="text-right">
                                <div className="right-border">
                                    <button className="btn btn-small-primary-circle ml-1" type="button" onClick={() => { setCostingSummary(!costingSummary) }}>
                                        {costingSummary ? (
                                            <i className="fa fa-minus" ></i>
                                        ) : (
                                            <i className="fa fa-plus"></i>
                                        )}
                                    </button>
                                </div>
                            </Col>
                        </Row>

                        {costingSummary &&
                            <>
                                <Row className="pt-4 blue-before">
                                    {shown &&
                                        <Col lg="10" md="10" className="filter-block">
                                            <div className="d-inline-flex justify-content-start align-items-top w100">
                                                <div className="flex-fills">
                                                    <h5 className="hide-left-border">{`Filter By:`}</h5>
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
                                                        options={renderDropdownListing('plant')}
                                                        mandatory={false}
                                                        handleChange={() => { }}
                                                        errors={errors.plantCode}
                                                    />
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
                                                    <button
                                                        type="button"
                                                        //disabled={pristine || submitting}
                                                        onClick={resetHandler}
                                                        className="reset mr10"
                                                    >
                                                        {'Reset'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        //disabled={pristine || submitting}
                                                        onClick={onSubmit}
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
                                <Row className="pb-2">
                                    <Col md="12">
                                        <Row>
                                            <Col>
                                                <BootstrapTable
                                                    data={costingList}
                                                    striped={false}
                                                    bordered={false}
                                                    hover={false}
                                                    options={options}
                                                    search
                                                    className="add-volume-table mb-3"
                                                    pagination
                                                >
                                                    <TableHeaderColumn dataField="SimulationCostingId" isKey={true} hidden width={100} dataAlign="center" searchable={false} >{''}</TableHeaderColumn>
                                                    <TableHeaderColumn dataField="CostingNumber" width={100} export columnTitle={true} editable={false} dataAlign="left" dataSort={true}>{'Costing ID'}</TableHeaderColumn>
                                                    <TableHeaderColumn dataField="CostingHead" width={100} export columnTitle={true} editable={false} dataAlign="left" dataSort={true}>{'Costing Head'}</TableHeaderColumn>
                                                    <TableHeaderColumn dataField="VendorName" width={100} export columnTitle={true} dataFormat={vendorFormatter} editable={false} dataAlign="left" >{renderVendorName()}</TableHeaderColumn>
                                                    <TableHeaderColumn dataField="Technology" width={100} columnTitle={true} editable={false} dataAlign="left">{'Technology'}</TableHeaderColumn>
                                                    <TableHeaderColumn dataField="RMName" width={100} columnTitle={false} editable={false} dataAlign="left" dataFormat={rmNameFormatter} >{renderRMName()}</TableHeaderColumn>
                                                    <TableHeaderColumn dataField="PartNo" width={100} columnTitle={true} editable={false} dataAlign="left" >{'Part No.'}</TableHeaderColumn>
                                                    <TableHeaderColumn dataField="PartName" width={100} columnTitle={true} editable={false} dataFormat={descriptionFormatter} dataAlign="left" >{renderDescription()}</TableHeaderColumn>
                                                    <TableHeaderColumn dataField="ECNNumber" width={100} columnTitle={true} editable={false} dataFormat={ecnFormatter} dataAlign="left" >{renderECN()}</TableHeaderColumn>
                                                    <TableHeaderColumn dataField="RevisionNumber" width={100} columnTitle={true} editable={false} dataFormat={revisionFormatter} dataAlign="left" >{revisionNumber()}</TableHeaderColumn>
                                                    {/* <TableHeaderColumn dataField="PlantCode" width={100} columnTitle={true} editable={false} dataAlign="left" >{renderPlantCode()}</TableHeaderColumn> */}
                                                    <TableHeaderColumn dataField="OldPOPrice" width={100} columnTitle={false} editable={false} dataAlign="left" dataFormat={oldPOFormatter} >{OldPo()}</TableHeaderColumn>
                                                    <TableHeaderColumn dataField="NewPOPrice" width={100} columnTitle={false} editable={false} dataAlign="left" dataFormat={newPOFormatter} >{NewPO()}</TableHeaderColumn>
                                                    <TableHeaderColumn dataField="OldRMPrice" width={100} columnTitle={false} dataFormat={oldRMFormatter} editable={false} dataAlign="left" >{renderOldRM()}</TableHeaderColumn>
                                                    <TableHeaderColumn dataField="NewRMPrice" width={100} columnTitle={false} dataFormat={newRMFormatter} editable={false} dataAlign="left" >{renderNewRM()}</TableHeaderColumn>
                                                    {/* <TableHeaderColumn dataField="RMGrade" width={100} columnTitle={false} hidden export={true} editable={false} dataAlign="left" >{renderNewRM()}</TableHeaderColumn> */}
                                                    <TableHeaderColumn dataField="SimulationCostingId" dataAlign="right" export={false} width={80} columnTitle={false} editable={false} dataFormat={buttonFormatter}>Actions</TableHeaderColumn>
                                                </BootstrapTable>

                                            </Col>
                                        </Row>

                                    </Col>
                                </Row>
                            </>
                        }

                        <Row>
                            <Col md="10">
                                <div className="left-border">{'Compare Costing:'}</div>
                            </Col>
                            <Col md="2" className="text-right">
                                <div className="right-border">
                                    <button className="btn btn-small-primary-circle ml-1" type="button" disabled={!compareCosting} onClick={() => { setCompareCosting(!compareCosting) }}>
                                        {compareCosting ? <i className="fa fa-minus"></i> : <i className="fa fa-plus"></i>}
                                    </button>
                                </div>
                            </Col>
                        </Row>
                        <Row className="mb-4">
                            <Col md="12" className="costing-summary-row">
                                {compareCosting && <CostingSummaryTable viewMode={true} id={id} simulationMode={true} isApproval={true} />}
                            </Col>
                        </Row>
                        {/* Costing Summary page here */}
                    </div>

                    {!isApprovalDone &&
                        <Row className="sf-btn-footer no-gutters justify-content-between">
                            <div className="col-sm-12 text-right bluefooter-butn">
                                <Fragment>
                                    <button type={'button'} className="mr5 approve-reject-btn" onClick={() => { setRejectDrawer(true) }} >
                                        <div className={'cross-icon'}>
                                            <img src={require('../../../assests/images/times.png')} alt="cancel-icon.jpg" />
                                        </div>{' '}
                                        {'Reject'}
                                    </button>
                                    <button
                                        type="button"
                                        className="approve-button mr5 approve-hover-btn"
                                        onClick={() => setApproveDrawer(true)}>
                                        <div className={'check-icon'}>
                                            <img
                                                src={require('../../../assests/images/check.png')}
                                                alt="check-icon.jpg"
                                            />{' '}
                                        </div>
                                        {'Approve'}
                                    </button>

                                    {showFinalLevelButtons &&
                                        <button
                                            type="button" className="mr5 user-btn" onClick={() => { }}                    >
                                            <div className={'check-icon'}>
                                                <img
                                                    src={require('../../../assests/images/check.png')}
                                                    alt="check-icon.jpg"
                                                />{' '}
                                            </div>
                                            {'Approve & Push'}
                                        </button>}
                                </Fragment>
                            </div>
                        </Row>
                    }

                    {
                        showPushButton &&
                        <Row className="sf-btn-footer no-gutters justify-content-between">
                            <div className="col-sm-12 text-right bluefooter-butn">
                                <Fragment>
                                    <button type="submit" className="submit-button mr5 save-btn" onClick={() => setPushButton(true)}>
                                        <div className={"check-icon"}>
                                            <img
                                                src={require("../../../assests/images/check.png")}
                                                alt="check-icon.jpg"
                                            />
                                        </div>{" "}
                                        {"Push"}
                                    </button>
                                </Fragment>
                            </div>
                        </Row>
                    }
                </>
                // :
                // <SimulationApprovalListing />
            }

            {approveDrawer && <ApproveRejectDrawer
                type={'Approve'}
                isOpen={approveDrawer}
                closeDrawer={closeApproveDrawer}
                // tokenNo={approvalNumber}
                approvalData={[]}
                anchor={'right'}
                isSimulation={true}
                simulationDetail={simulationDetail}
                // reasonId={approvalDetails.ReasonId}
                IsFinalLevel={showFinalLevelButtons}
            // IsPushDrawer={showPushDrawer}
            // dataSend={[approvalDetails, partDetail]}
            />}

            {rejectDrawer && <ApproveRejectDrawer
                type={'Reject'}
                isOpen={rejectDrawer}
                simulationDetail={simulationDetail}
                closeDrawer={closeApproveDrawer}
                isSimulation={true}
                //  tokenNo={approvalNumber}
                anchor={'right'}
                IsFinalLevel={!showFinalLevelButtons}
            // reasonId={approvalDetails.ReasonId}
            // IsPushDrawer={showPushDrawer}
            // dataSend={[approvalDetails, partDetail]}
            />}

            {/* {pushButton && <PushButtonDrawer
                isOpen={pushButton}
                closeDrawer={closePushButton}
                dataSend={[approvalDetails, partDetail]}
                anchor={'right'}
                approvalData={[approvalData]}
            />} */}

            {viewButton && <ViewDrawer
                approvalLevelStep={approvalLevelStep}
                isOpen={viewButton}
                closeDrawer={closeViewDrawer}
                anchor={'top'}
                approvalNo={simulationDetail.Token}
                isSimulation={true}
            />
            }
            {isVerifyImpactDrawer &&
                <VerifyImpactDrawer
                    isOpen={isVerifyImpactDrawer}
                    anchor={'right'}
                    approvalData={[]}
                    type={'Approve'}
                    closeDrawer={verifyImpactDrawer}
                    isSimulation={true}
                />
            }
        </>
    )
}

export default SimulationApprovalSummary;
