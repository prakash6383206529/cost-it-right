import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col, } from 'reactstrap';
import { getTaxDetailsDataList, deleteTaxDetails, } from '../actions/TaxMaster';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../config/message';
import { CONSTANT } from '../../../helper/AllConastant';
import NoContentFound from '../../common/NoContentFound';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { TAX } from '../../../config/constants';
import { checkPermission } from '../../../helper/util';
import { reactLocalStorage } from 'reactjs-localstorage';
import { loggedInUserId } from '../../../helper/auth';
import { getLeftMenu, } from '../../../actions/auth/AuthActions';
import AddTaxDetails from './AddTaxDetails';
import moment from 'moment';
import { GridTotalFormate } from '../../common/TableGridFunctions';

class TaxListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
            ID: '',
            tableData: [],

            ViewAccessibility: false,
            AddAccessibility: false,
            EditAccessibility: false,
            DeleteAccessibility: false,
        }
    }

    /**
     * @method componentDidMount
     * @description  called before rendering the component
     */
    componentDidMount() {
        let ModuleId = reactLocalStorage.get('ModuleId');
        this.props.getLeftMenu(ModuleId, loggedInUserId(), (res) => {
            const { leftMenuData } = this.props;
            if (leftMenuData !== undefined) {
                let Data = leftMenuData;
                const accessData = Data && Data.find(el => el.PageName === TAX)
                const permmisionData = accessData && accessData.Actions && checkPermission(accessData.Actions)

                if (permmisionData !== undefined) {
                    this.setState({
                        ViewAccessibility: permmisionData && permmisionData.View ? permmisionData.View : false,
                        AddAccessibility: permmisionData && permmisionData.Add ? permmisionData.Add : false,
                        EditAccessibility: permmisionData && permmisionData.Edit ? permmisionData.Edit : false,
                        DeleteAccessibility: permmisionData && permmisionData.Delete ? permmisionData.Delete : false,
                    })
                }
            }
        })

        this.getTableListData()
    }

    /**
     * @method getTableListData
     * @description  GET DATALIST
     */
    getTableListData = () => {
        this.props.getTaxDetailsDataList(res => {
            if (res.status === 204 && res.data === '') {
                this.setState({ tableData: [], })
            } else if (res && res.data && res.data.DataList) {
                let Data = res.data.DataList;
                this.setState({ tableData: Data, })
            } else {
                this.setState({ tableData: [], })
            }
        });
    }

    /**
     * @method openModel
     * @description  used to open filter form 
     */
    openModel = () => {
        this.setState({
            isOpen: true,
            isEditFlag: false
        })
    }

    /**
     * @method closeDrawer
     * @description  used to cancel filter form
     */
    closeDrawer = (e = '') => {
        this.setState({ isOpen: false }, () => {
            this.getTableListData()
        })
    }

    /**
    * @method editItemDetails
    * @description confirm delete UOM
    */
    editItemDetails = (Id) => {
        this.setState({
            isEditFlag: true,
            isOpen: true,
            ID: Id,
        })
    }

    /**
    * @method deleteItem
    * @description confirm delete TAX
    */
    deleteItem = (Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDelete(Id)
            },
            onCancel: () => console.log('CANCEL: clicked')
        };
        return toastr.confirm(MESSAGES.TAX_DELETE_ALERT, toastrConfirmOptions);
    }

    /**
    * @method confirmDelete
    * @description confirm delete TAX
    */
    confirmDelete = (Id) => {
        this.props.deleteTaxDetails(Id, (res) => {
            if (res.data.Result) {
                toastr.success(MESSAGES.DELETE_TAX_SUCCESS);
                this.getTableListData()
            }
        });
    }

    /**
    * @method effectiveDateFormatter
    * @description Renders buttons
    */
    effectiveDateFormatter = (cell, row, enumObject, rowIndex) => {
        return cell != null ? moment(cell).format('DD/MM/YYYY') : '';
    }

    renderPaginationShowsTotal(start, to, total) {
        return <GridTotalFormate start={start} to={to} total={total} />
    }

    /**
    * @method buttonFormatter
    * @description Renders buttons
    */
    buttonFormatter = (cell, row, enumObject, rowIndex) => {
        const { EditAccessibility, DeleteAccessibility } = this.state;
        return (
            <>
                {EditAccessibility && <button className="Edit mr-2" type={'button'} onClick={() => this.editItemDetails(cell)} />}
                {DeleteAccessibility && <button className="Delete" type={'button'} onClick={() => this.deleteItem(cell)} />}
            </>
        )
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpen, isEditFlag, AddAccessibility } = this.state;
        const options = {
          clearSearch: true,
          noDataText: <NoContentFound title={CONSTANT.EMPTY_DATA} />,
          //exportCSVText: 'Download Excel',
          //onExportToCSV: this.onExportToCSV,
          //paginationShowsTotal: true,
          paginationShowsTotal: this.renderPaginationShowsTotal,
          paginationShowsTotal: this.renderPaginationShowsTotal,
          prePage: <span className="prev-page-pg"></span>, // Previous page button text
          nextPage: <span className="next-page-pg"></span>, // Next page button text
          firstPage: <span className="first-page-pg"></span>, // First page button text
          lastPage: <span className="last-page-pg"></span>,
          paginationSize: 2,
        };
        return (
          <>
            <div className="container-fluid">
              {/* {this.props.loading && <Loader />} */}
              <Row>
                <Col md={12}>
                  <h1>{`Tax Details Master`}</h1>
                </Col>
                <Col md={12}>
                  <hr className="mt-0" />
                </Col>
                </Row>

                <Row className="no-filter-row">
                {AddAccessibility && (
                  <>
                  <Col md={6} className="filter-block"></Col>
                  <Col md={6} className="text-right search-user-block pr-0">
                    <div className="d-flex justify-content-end bd-highlight w100">
                    <button
                      type={"button"}
                      className={"user-btn"}
                      onClick={this.openModel}
                    >
                      <div className={"plus"}></div>
                      {`ADD`}
                    </button>
                    </div>
                  </Col>
                  </>
                )}
              </Row>
              <Row>
                <Col>
                  <BootstrapTable
                    data={this.state.tableData}
                    striped={false}
                    hover={false}
                    bordered={false}
                    options={options}
                    search
                    // exportCSV
                    //ignoreSinglePage
                    ref={"table"}
                    trClassName={"userlisting-row"}
                    tableHeaderClass="my-custom-class"
                    pagination
                  >
                    <TableHeaderColumn
                      dataField="TaxName"
                      dataAlign="left"
                      dataSort={true}
                    >
                      Tax Name
                    </TableHeaderColumn>
                    <TableHeaderColumn dataField="Country" dataSort={true}>
                      Country
                    </TableHeaderColumn>
                    <TableHeaderColumn dataField="Rate" dataSort={true}>
                      Rate (%)
                    </TableHeaderColumn>
                    <TableHeaderColumn
                      dataField="EffectiveDate"
                      columnTitle={true}
                      dataAlign="center"
                      dataFormat={this.effectiveDateFormatter}
                    >
                      {"Effective Date"}
                    </TableHeaderColumn>
                    <TableHeaderColumn
                      dataField="TaxDetailId"
                      export={false}
                      width={100}
                      isKey={true}
                      dataFormat={this.buttonFormatter}
                    >
                      Actions
                    </TableHeaderColumn>
                  </BootstrapTable>
                </Col>
              </Row>
              {isOpen && (
                <AddTaxDetails
                  isOpen={isOpen}
                  closeDrawer={this.closeDrawer}
                  isEditFlag={isEditFlag}
                  ID={this.state.ID}
                  anchor={"right"}
                />
              )}
            </div>
          </>
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ auth }) {
    const { leftMenuData } = auth;
    return { leftMenuData, }
}

export default connect(mapStateToProps,
    {
        getTaxDetailsDataList,
        deleteTaxDetails,
        getLeftMenu,
    })(TaxListing);

