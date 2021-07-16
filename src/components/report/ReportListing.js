import React, { useState, useEffect, Fragment } from 'react'
import moment from 'moment'
import { connect } from 'react-redux';
import { Field, reduxForm, } from "redux-form";
import { Row, Col } from 'reactstrap'
import { SearchableSelectHookForm } from '../layout/HookFormInputs'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table'
import { useDispatch, useSelector } from 'react-redux'
import { loggedInUserId, userDetails } from '../../helper/auth'
import { Badge } from 'reactstrap'
import NoContentFound from '../common/NoContentFound'
import { CONSTANT } from '../../helper/AllConastant'
import { GridTotalFormate } from '../common/TableGridFunctions'
import { checkForDecimalAndNull } from '../../helper'
import { getReportListing } from '../report/actions/ReportListing'
import { EMPTY_GUID } from '../../config/constants';

function ReportListing(props) {

    const loggedUser = loggedInUserId()

    const [tableData, setTableData] = useState([])

    const [shown, setshown] = useState(false)

    const dispatch = useDispatch()

    const { register, handleSubmit, control, setValue, errors, getValues } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    })

    const partSelectList = useSelector((state) => state.costing.partSelectList)
    const statusSelectList = useSelector((state) => state.approval.costingStatusList)
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
    const approvalList = useSelector(state => state.approval.approvalList)
    const userList = useSelector(state => state.auth.userList)

    const simulatedOnFormatter = (cell, row, enumObject, rowIndex) => {
        //return cell != null ? moment(cell).format('DD/MM/YYYY hh:mm A') : '';
        return cell != null ? cell : '';
    }

    const approvedOnFormatter = (cell, row, enumObject, rowIndex) => {
        //   return cell != null ? moment(cell).format('DD/MM/YYYY hh:mm A') : '';
        return cell != null ? cell : '';
    }

    const linkableFormatter = (cell, row, enumObject, rowIndex) => {
        return (
            <Fragment>
                <div
                    onClick={() => { }} className={'link'}>{cell}
                </div>
            </Fragment>
        )
    }



    const buttonFormatter = (cell, row, enumObject, rowIndex) => {
        return (
            <>
                <button className="View" type={'button'} onClick={() => { }} />
            </>
        )
    }

    const statusFormatter = (cell, row, enumObject, rowIndex) => {
        return <div className={cell}>{row.DisplayCostingStatus}</div>
    }

    // table headings start
    const renderCostingVersion = () => {
        return <>Costing <br />Version</>
    }
    const renderPOPrice = () => {
        return <>PO Price</>
    }
    const renderPartNumber = () => {
        return <>Part <br />Number</>
    }
    const renderPartName = () => {
        return <>Part <br />Name</>
    }
    const renderRMNameGrade = () => {
        return <>RM <br />Name-Grade</>
    }
    const renderGrossWeight = () => {
        return <>Gross <br />Weight</>
    }
    const renderFinishWeight = () => {
        return <>Finish <br />Weight</>
    }
    const renderScrapWeight = () => {
        return <>Scrap <br />Weight</>
    }
    const renderNetRMCost = () => {
        return <>Net <br />RM Cost</>
    }
    const renderNetBOPCost = () => {
        return <>Net <br />BOP Cost</>
    }
    const renderProcessCost = () => {
        return <>Process <br />Cost</>
    }
    const renderOperationCost = () => {
        return <>Operation <br />Cost</>
    }
    const renderSurfaceTreatment = () => {
        return <>Surface <br />Treatment</>
    }
    const renderTransportationCost = () => {
        return <>Transportation <br />Cost</>
    }
    const renderNetConversionCost = () => {
        return <>Net <br />Conversion Cost</>
    }
    const renderModelTypeForOverheadProfit = () => {
        return <>Model Type For<br /> Overhead/Profit</>
    }
    const renderPaymentTerms = () => {
        return <>Payment <br />Terms</>
    }
    const renderNetOverheadProfits = () => {
        return <>Net Overhead<br /> & Profits</>
    }
    const renderPackagingCost = () => {
        return <>Packaging <br />Cost</>
    }
    const renderNetPackagingFreight = () => {
        return <>Net Packaging<br /> & Freight</>
    }
    const renderToolMaintenanceCost = () => {
        return <>Tool <br />Maintenance Cost</>
    }
    const renderToolPrice = () => {
        return <>Tool<br /> Price</>
    }
    const renderAmortizationQuantity = () => {
        return <>Amortization <br />Quantity(Tool Life)</>
    }
    const renderNetToolCost = () => {
        return <>Net Tool<br /> Cost</>
    }
    const renderTotalCost = () => {
        return <>Total<br /> Cost</>
    }
    const renderHundiOtherDiscount = () => {
        return <>Hundi/Other<br /> Discount</>
    }
    const renderAnyOtherCost = () => {
        return <>Any Other<br /> Cost</>
    }
    const renderNetPOPrice = () => {
        return <>Net PO<br /> Price(INR)</>
    }
    const renderNetPOPrice2 = () => {
        return <>Net PO<br /> Price (USD)</>
    }

    // table headings end



    /**
   * @method getTableData
   * @description getting approval list table
   */

    const getTableData = () => {
        const filterData = {
            costingNumber: "",
            toDate: null,
            fromDate: null,
            statusId: 1,
            technologyId: 1,
            plantCode: "",
            vendorCode: "",
            userId: EMPTY_GUID,
            isSortByOrderAsc: true,
        }
        props.getReportListing(filterData, (res) => { })
    }


    useEffect(() => {
        getTableData();
    }, [])

    const renderPaginationShowsTotal = (start, to, total) => {
        return <GridTotalFormate start={start} to={to} total={total} />
    }

    const options = {
        clearSearch: true,
        noDataText: <NoContentFound title={CONSTANT.EMPTY_DATA} />,
        paginationShowsTotal: renderPaginationShowsTotal(),
        prePage: <span className="prev-page-pg"></span>, // Previous page button text
        nextPage: <span className="next-page-pg"></span>, // Next page button text
        firstPage: <span className="first-page-pg"></span>, // First page button text
        lastPage: <span className="last-page-pg"></span>,
        //exportCSVText: 'Download Excel',
        //onExportToCSV: this.onExportToCSV,
        //paginationShowsTotal: true,
        //paginationShowsTotal: this.renderPaginationShowsTotal,

    }

    const renderDropdownListing = (label) => {
        const tempDropdownList = []

        if (label === 'PartList') {
            partSelectList &&
                partSelectList.map((item) => {
                    if (item.Value === '0') return false
                    tempDropdownList.push({ label: item.Text, value: item.Value })
                    return null
                })

            return tempDropdownList
        }

        if (label === 'Status') {
            statusSelectList &&
                statusSelectList.map((item) => {
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
        getTableData()
    }

    /**
  * @method onSubmit
  * @description filtering data on Apply button
  */
    const onSubmit = (values) => {
        const tempPartNo = getValues('partNo') ? getValues('partNo').value : '00000000-0000-0000-0000-000000000000'
        const tempcreatedBy = getValues('createdBy') ? getValues('createdBy').value : '00000000-0000-0000-0000-000000000000'
        const tempRequestedBy = getValues('requestedBy') ? getValues('requestedBy').value : '00000000-0000-0000-0000-000000000000'
        const tempStatus = getValues('status') ? getValues('status').value : '00000000-0000-0000-0000-000000000000'
        // const type_of_costing = 
        getTableData(tempPartNo, tempcreatedBy, tempRequestedBy, tempStatus)
    }


    return (
        <div className="container-fluid approval-listing-page">
            <form onSubmit={handleSubmit(onSubmit)} noValidate>

                <h1 className="mb-0">Report</h1>


                <Row className="pt-4 blue-before">
                    {shown &&
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
                                        name={'createdBy'}
                                        placeholder={'Initiated By'}
                                        Controller={Controller}
                                        control={control}
                                        rules={{ required: false }}
                                        register={register}
                                        // defaultValue={plant.length !== 0 ? plant : ''}
                                        options={renderDropdownListing('users')}
                                        mandatory={false}
                                        handleChange={() => { }}
                                        errors={errors.createdBy}
                                    />
                                </div>
                                <div className="flex-fill filled-small hide-label">
                                    <SearchableSelectHookForm
                                        label={''}
                                        name={'requestedBy'}
                                        placeholder={'Requested By'}
                                        Controller={Controller}
                                        control={control}
                                        rules={{ required: false }}
                                        register={register}
                                        // defaultValue={plant.length !== 0 ? plant : ''}
                                        options={renderDropdownListing('users')}
                                        mandatory={false}
                                        handleChange={() => { }}
                                        errors={errors.requestedBy}
                                    />
                                </div>
                                <div className="flex-fill filled-small hide-label">
                                    <SearchableSelectHookForm
                                        label={''}
                                        name={'status'}
                                        placeholder={'Status'}
                                        Controller={Controller}
                                        control={control}
                                        rules={{ required: false }}
                                        register={register}
                                        // defaultValue={plant.length !== 0 ? plant : ''}
                                        options={renderDropdownListing('Status')}
                                        mandatory={false}
                                        handleChange={() => { }}
                                        errors={errors.status}
                                    />
                                </div>


                                <div className="flex-fill filled-small hide-label">
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

                    <Col md="6" lg="6" className="search-user-block mb-3">
                        <div className="d-flex justify-content-end bd-highlight w100">
                            <div>
                                {(shown) ? (
                                    <button type="button" className="user-btn mr5 filter-btn-top topminus88" onClick={() => setshown(!shown)}>
                                        <img src={require("../../assests/images/times.png")} alt="cancel-icon.jpg" /></button>
                                ) : (
                                    <button type="button" className="user-btn mr5" onClick={() => setshown(!shown)}>Show Filter</button>
                                )}

                            </div>
                        </div>

                    </Col>
                </Row>
            </form>

            <BootstrapTable
                data={props.reportDataList}
                striped={false}
                hover={false}
                bordered={false}
                options={options}
                search
                // exportCSV
                //ignoreSinglePage
                //ref={'table'}
                trClassName={'userlisting-row'}
                tableHeaderClass="my-custom-header"
                pagination
            >
                <TableHeaderColumn dataField="TokenNumber" isKey={true} columnTitle={true} dataAlign="left" dataSort={true} dataFormat={linkableFormatter} >{`Token No.`}</TableHeaderColumn>
                <TableHeaderColumn dataField="TokenNumber" width={90} columnTitle={true} dataSort={true} dataFormat={linkableFormatter} >{renderCostingVersion()}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingHead" width={90} columnTitle={true} dataSort={false}>{renderPOPrice()}</TableHeaderColumn>
                <TableHeaderColumn dataField="Technology" width={90} columnTitle={true} dataSort={false}>{renderPartNumber()}</TableHeaderColumn>
                <TableHeaderColumn dataField="VendorName" width={90} columnTitle={true} dataSort={false}>{renderPartName()}</TableHeaderColumn>
                <TableHeaderColumn dataField="ImpactParts" width={110} columnTitle={true} dataSort={false}>{renderRMNameGrade()}</TableHeaderColumn>
                <TableHeaderColumn dataField="SimulatedBy" width={90} columnTitle={true} dataSort={false} >{renderGrossWeight()}</TableHeaderColumn>
                <TableHeaderColumn dataField="SimulatedOn" width={90} columnTitle={true} dataSort={false} dataFormat={simulatedOnFormatter} >{renderFinishWeight()} </TableHeaderColumn>
                <TableHeaderColumn dataField="ApprovedBy" width={90} columnTitle={true} dataSort={false}>{renderScrapWeight()} </TableHeaderColumn>
                <TableHeaderColumn dataField="ApprovedOn" width={90} columnTitle={true} dataSort={false}> {renderNetRMCost()}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={90} columnTitle={true} dataSort={false} >{renderNetBOPCost()}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={90} columnTitle={true} dataSort={false} >{renderProcessCost()}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={90} columnTitle={true} dataSort={false} >{renderOperationCost()}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={90} columnTitle={true} dataSort={false} >{renderSurfaceTreatment()}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={120} columnTitle={true} dataSort={false} >{renderTransportationCost()}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={130} columnTitle={true} dataSort={false} >{renderNetConversionCost()}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={130} columnTitle={true} dataSort={false} >{renderModelTypeForOverheadProfit()}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={110} columnTitle={true} dataSort={false} >{`Overhead On`}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={90} columnTitle={true} dataSort={false} >{`Profit On`}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={110} columnTitle={true} dataSort={false} >{`Rejection On`}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={90} columnTitle={true} dataSort={false} >{`ICC On`}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={90} columnTitle={true} dataSort={false} >{renderPaymentTerms()}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={110} columnTitle={true} dataSort={false} >{renderNetOverheadProfits()}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={100} columnTitle={true} dataSort={false} >{renderPackagingCost()}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={90} columnTitle={true} dataSort={false} >{`Freight`}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={120} columnTitle={true} dataSort={false} >{renderNetPackagingFreight()}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={145} columnTitle={true} dataSort={false} >{renderToolMaintenanceCost()}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={90} columnTitle={true} dataSort={false} >{renderToolPrice()}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={145} columnTitle={true} dataSort={false} >{renderAmortizationQuantity()}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={110} columnTitle={true} dataSort={false} >{renderNetToolCost()}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={90} columnTitle={true} dataSort={false} >{renderTotalCost()}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={110} columnTitle={true} dataSort={false} >{renderHundiOtherDiscount()}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={100} columnTitle={true} dataSort={false} >{renderAnyOtherCost()}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={100} columnTitle={true} dataSort={false} >{renderNetPOPrice()}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={90} columnTitle={true} dataSort={false} >{`Currency`}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={110} columnTitle={true} dataSort={false} >{renderNetPOPrice2()}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={100} columnTitle={true} dataSort={false} >{`Remark`}</TableHeaderColumn>
                {/* <TableHeaderColumn dataAlign="right" searchable={false} width={80} dataField="SimulationId" export={false} isKey={true} dataFormat={buttonFormatter}>Actions</TableHeaderColumn> */}
            </BootstrapTable>
        </div>
    );
}



function mapStateToProps({ report, auth }) {
    const { reportDataList, loading } = report;
    const { initialConfiguration } = auth;
    return { reportDataList, loading, initialConfiguration, }
}

export default connect(mapStateToProps, {
    getReportListing,
})(reduxForm({
    form: 'ReportListing',
    enableReinitialize: true,
})(ReportListing));