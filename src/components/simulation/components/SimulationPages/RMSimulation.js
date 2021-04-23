import React, { useEffect, useState } from 'react';
import { Row, Col, } from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import moment from 'moment';
import { CONSTANT } from '../../../../helper/AllConastant';
import NoContentFound from '../../../common/NoContentFound';
import { checkForDecimalAndNull, getConfigurationKey } from '../../../../helper';
import { GridTotalFormate } from '../../../common/TableGridFunctions';
import { toastr } from 'react-redux-toastr';
import Simulation from '../Simulation';
import { Fragment } from 'react';
import { TextFieldHookForm } from '../../../layout/HookFormInputs';
import { useForm, Controller } from 'react-hook-form'

function RMSimulation(props) {
    const { isDomestic, list, isbulkUpload, rowCount } = props
    const [showSimulation, setShowSimulation] = useState(false)

    const { register, handleSubmit, control, setValue, getValues, reset, errors, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })

    useEffect(() => {
        setValue('NoOfCorrectRow', rowCount.correctRow)
        setValue('NoOfInCorrectRow', rowCount.incorrectRow)
    }, [])

    const renderCostingHead = () => {
        return <>Costing <br />Head </>
    }

    const renderRawMaterial = () => {
        return <>Raw <br />Material </>
    }

    const renderRMGrade = () => {
        return <>RM <br />Grade </>
    }

    const renderRMSpec = () => {
        return <>RM <br />Spec </>
    }

    const renderBasicRate = () => {
        return <>Basic <br />Rate(INR) </>
    }

    const renderNewBasicRate = () => {
        return <>New Basic <br />Rate(INR) </>
    }


    const renderScrapRate = () => {
        return <>Scrap <br />Rate(INR) </>
    }

    const renderNewScrapRate = () => {
        return <>New Scrap <br />Rate(INR) </>
    }

    const renderNetCost = () => {
        return <>Net <br />Cost(INR) </>
    }

    const renderNewNetCost = () => {
        return <>New Net <br />Cost(INR) </>
    }

    const renderEffectiveDate = () => {
        return <>Effective <br />Date</>
    }

    const effectiveDateFormatter = (cell, row, enumObject, rowIndex) => {
        return cell != null ? moment(cell).format('DD/MM/YYYY') : '';
    }

    const costingHeadFormatter = (cell, row, enumObject, rowIndex) => {
        return (cell === true || cell === 'Vendor Based') ? 'Vendor Based' : 'Zero Based';
    }

    const newBasicRateFormatter = (cell, row, enumObject, rowIndex) => {
        return (
            <>
                <span className={`${!isbulkUpload ? 'form-control' : ''}`} >{cell}</span>
            </>
        )
    }

    const newScrapRateFormatter = (cell, row, enumObject, rowIndex) => {
        return (
            <>
                <span className={`${!isbulkUpload ? 'form-control' : ''}`} >{cell}</span>
            </>
        )
    }

    const costFormatter = (cell, row, enumObject, rowIndex) => {

        return cell != null ? checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice) : '';
    }

    const renderPaginationShowsTotal = (start, to, total) => {
        return <GridTotalFormate start={start} to={to} total={total} />
    }

    /**
  * @method beforeSaveCell
  * @description CHECK FOR ENTER NUMBER IN CELL
  */
    const beforeSaveCell = (row, cellName, cellValue) => {
        if (Number.isInteger(Number(cellValue)) && /^\+?(0|[1-9]\d*)$/.test(cellValue) && cellValue.toString().replace(/\s/g, '').length) {
            if (cellValue.length > 8) {
                toastr.warning("Value should not be more than 8")
                return false
            }
            return true
        } else if (cellValue && !/^[+]?([0-9]+(?:[\.][0-9]*)?|\.[0-9]+)$/.test(cellValue)) {
            toastr.warning('Please enter a valid positive numbers.')
            return false
        }
    }

    const NewcostFormatter = (cell, row, enumObject, rowIndex) => {
        console.log('row: ', row);
        console.log('cell: ', cell);

        return checkForDecimalAndNull(row.NewBasicRate, 2)
    }

    const runSimulation = () => {
        let basicRateCount = 0
        let basicScrapCount = 0
        list && list.map((li) => {
            if (li.BasicRate === li.NewBasicRate) {
                basicRateCount = basicRateCount + 1
            }
            if (li.ScrapRate === li.NewScrapRate) {
                basicScrapCount = basicScrapCount + 1
            }

            if (basicRateCount === list.length || basicScrapCount === list.length) {
                toastr.warning('There is no changes in new value.Please correct the data ,then run simulation')
            }

        })
    }

    const options = {
        clearSearch: true,
        noDataText: <NoContentFound title={CONSTANT.EMPTY_DATA} />,
        paginationShowsTotal: renderPaginationShowsTotal(),
        prePage: <span className="prev-page-pg"></span>, // Previous page button text
        nextPage: <span className="next-page-pg"></span>, // Next page button text
        firstPage: <span className="first-page-pg"></span>, // First page button text
        lastPage: <span className="last-page-pg"></span>,

    };

    const cancel = () => {
        props.cancelEditPage()
    }
    const cellEditProp = {
        mode: 'click',
        blurToSave: true,
        beforeSaveCell: beforeSaveCell,
    };
    return (

        <div>
            {
                !showSimulation &&
                <Fragment>
                    {
                        isbulkUpload &&
                        <Row className="filter-row-large pt-4">
                            <Col md="6" lg="6" className="search-user-block mb-3">
                                <div className="d-flex justify-content-end bd-highlight w100">
                                    <div>
                                        <div className="d-flex">
                                            <div class="pr-2 mt-4">No of rows with changes:</div>
                                            <TextFieldHookForm
                                                label=""
                                                name={'NoOfCorrectRow'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                rules={{ required: false }}
                                                mandatory={false}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.NoOfCorrectRow}
                                                disabled={true}
                                            />
                                            <div class="pr-2 mt-4">No of rows without changes:</div>
                                            <TextFieldHookForm
                                                label=""
                                                name={'NoOfInCorrectRow'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                rules={{ required: false }}
                                                mandatory={false}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.NoOfInCorrectRow}
                                                disabled={true}
                                            />
                                        </div>

                                    </div>
                                </div>
                            </Col>
                        </Row>
                    }
                    <Row>
                        <Col>
                            <BootstrapTable
                                data={list}
                                striped={false}
                                bordered={false}
                                hover={false}
                                options={options}
                                search
                                cellEdit={cellEditProp}
                                // exportCSV
                                //ignoreSinglePage
                                className="add-volume-table"
                                pagination>
                                {/* <TableHeaderColumn dataField="" width={50} dataAlign="center" dataFormat={this.indexFormatter}>{this.renderSerialNumber()}</TableHeaderColumn> */}
                                <TableHeaderColumn dataField="CostingHead" width={100} columnTitle={true} editable={false} dataAlign="left" dataSort={true} dataFormat={costingHeadFormatter}>{renderCostingHead()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="RawMaterial" width={100} columnTitle={true} editable={false} dataAlign="left" >{renderRawMaterial()}</TableHeaderColumn>
                                <TableHeaderColumn dataField="RMGrade" width={70} columnTitle={true} editable={false} dataAlign="left" >{renderRMGrade()}</TableHeaderColumn>
                                <TableHeaderColumn width={100} columnTitle={true} dataAlign="left" editable={false} dataField="RMSpec" >{renderRMSpec()}</TableHeaderColumn>
                                <TableHeaderColumn width={100} columnTitle={true} dataAlign="left" editable={false} searchable={false} dataField="Category" >Category</TableHeaderColumn>
                                <TableHeaderColumn width={100} columnTitle={true} dataAlign="left" editable={false} dataField="TechnologyName" searchable={false} >Technology</TableHeaderColumn>
                                <TableHeaderColumn width={100} columnTitle={true} dataAlign="left" editable={false} dataField="VendorName" >Vendor</TableHeaderColumn>
                                <TableHeaderColumn width={100} columnTitle={true} dataAlign="left" editable={false} searchable={false} dataField="UOM" >UOM</TableHeaderColumn>
                                <TableHeaderColumn width={100} columnTitle={true} dataAlign="left" editable={false} searchable={false} dataField="BasicRate"  >{renderBasicRate()}</TableHeaderColumn>
                                <TableHeaderColumn width={100} columnTitle={true} dataAlign="left" searchable={false} editable={isbulkUpload ? false : true} dataFormat={newBasicRateFormatter} dataField="NewBasicRate">{renderNewBasicRate()}</TableHeaderColumn>
                                <TableHeaderColumn width={100} columnTitle={true} dataAlign="left" editable={false} searchable={false} dataField="ScrapRate" >{renderScrapRate()}</TableHeaderColumn>
                                <TableHeaderColumn width={100} columnTitle={true} dataAlign="left" searchable={false} editable={isbulkUpload ? false : true} dataFormat={newScrapRateFormatter} dataField="NewScrapRate">{renderNewScrapRate()}</TableHeaderColumn>
                                <TableHeaderColumn width={120} columnTitle={true} dataAlign="left" editable={false} searchable={false} dataField="NetLandedCost" dataFormat={costFormatter} >{renderNetCost()}</TableHeaderColumn>
                                <TableHeaderColumn width={120} columnTitle={true} dataAlign="left" editable={false} searchable={false} dataField="NewNetLandedCost" dataFormat={NewcostFormatter} >{renderNewNetCost()}</TableHeaderColumn>
                                <TableHeaderColumn width={100} columnTitle={true} dataAlign="left" editable={false} searchable={false} dataSort={true} dataField="EffectiveDate" dataFormat={effectiveDateFormatter} >{renderEffectiveDate()}</TableHeaderColumn>
                                <TableHeaderColumn width={100} dataAlign="right" dataField="RawMaterialId" export={false} searchable={false} hidden isKey={true}>Actions</TableHeaderColumn>
                            </BootstrapTable>

                        </Col>
                    </Row>
                    <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                        <div className="col-sm-12 text-right bluefooter-butn">
                            <button type={"button"} className="mr15 cancel-btn" onClick={cancel}                          >
                                <div className={"cross-icon"}>
                                    <img
                                        src={require("../../../../assests/images/times.png")}
                                        alt="cancel-icon.jpg"
                                    />
                                </div>{" "}
                                {"CANCEL"}
                            </button>
                            <button onClick={runSimulation} type="submit" className="user-btn mr5 save-btn"                    >
                                <div className={"Run"}>
                                </div>{" "}
                                {"RUN SIMULATION"}
                            </button>
                        </div>
                    </Row>
                </Fragment>
            }
            {
                showSimulation &&
                <Simulation />
            }
        </div>
    );
}

export default RMSimulation;