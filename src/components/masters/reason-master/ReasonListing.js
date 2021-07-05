import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm } from "redux-form";
import { Col, } from 'reactstrap';
import $ from "jquery";
import { focusOnError, } from "../../layout/FormInputs";
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../config/message';
import { getAllReasonAPI, deleteReasonAPI, activeInactiveReasonStatus, } from '../actions/ReasonMaster';
import { CONSTANT } from '../../../helper/AllConastant';
import NoContentFound from '../../common/NoContentFound';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import Switch from "react-switch";
import AddReason from './AddReason';
import { OperationMaster, REASON, Reasonmaster } from '../../../config/constants';
import { checkPermission } from '../../../helper/util';
import { reactLocalStorage } from 'reactjs-localstorage';
import { loggedInUserId } from '../../../helper/auth';
import { getLeftMenu, } from '../../../actions/auth/AuthActions';
import { GridTotalFormate } from '../../common/TableGridFunctions';
import Row from 'reactstrap/lib/Row';
import LoaderCustom from '../../common/LoaderCustom';
import ReactExport from 'react-export-excel';
import { REASON_DOWNLOAD_EXCEl } from '../../../config/masterData';

class ReasonListing extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isEditFlag: false,
      isOpenDrawer: false,
      ID: '',
      tableData: [],
      ViewAccessibility: false,
      AddAccessibility: false,
      EditAccessibility: false,
      DeleteAccessibility: false,
      DownloadAccessibility: false,
    }
  }

  componentDidMount() {
    let ModuleId = reactLocalStorage.get('ModuleId')
    this.props.getLeftMenu(ModuleId, loggedInUserId(), (res) => {
      const { leftMenuData } = this.props
      if (leftMenuData !== undefined) {
        let Data = leftMenuData
        const accessData = Data && Data.find((el) => el.PageName === REASON)
        const permmisionData =
          accessData &&
          accessData.Actions &&
          checkPermission(accessData.Actions)

        if (permmisionData !== undefined) {
          this.setState({
            ViewAccessibility:
              permmisionData && permmisionData.View
                ? permmisionData.View
                : false,
            AddAccessibility:
              permmisionData && permmisionData.Add ? permmisionData.Add : false,
            EditAccessibility:
              permmisionData && permmisionData.Edit
                ? permmisionData.Edit
                : false,
            DeleteAccessibility:
              permmisionData && permmisionData.Delete
                ? permmisionData.Delete
                : false,
            DownloadAccessibility:
              permmisionData && permmisionData.Download
                ? permmisionData.Download
                : false,
          })
        }
      }
    })

    this.getTableListData()
  }

  // Get updated Supplier's list after any action performed.
  getUpdatedData = () => {
    this.getTableListData()
  }

  /**
   * @method getTableListData
   * @description Get user list data
   */
  getTableListData = () => {
    this.props.getAllReasonAPI((res) => {
      if (res.status === 204 && res.data === '') {
        this.setState({ tableData: [] })
      } else if (res && res.data && res.data.DataList) {
        let Data = res.data.DataList
        this.setState({ tableData: Data })
      } else {
        this.setState({ tableData: [] })
      }
    })
  }

  /**
   * @method editItemDetails
   * @description confirm edit item
   */
  editItemDetails = (Id) => {
    this.setState({ isEditFlag: true, isOpenDrawer: true, ID: Id })
  }

  /**
   * @method deleteItem
   * @description confirm delete Item.
   */
  deleteItem = (Id) => {
    const toastrConfirmOptions = {
      onOk: () => {
        this.confirmDeleteItem(Id)
      },
      onCancel: () => { },
    }
    return toastr.confirm(MESSAGES.REASON_DELETE_ALERT, toastrConfirmOptions)
  }

  /**
   * @method confirmDeleteItem
   * @description confirm delete item
   */
  confirmDeleteItem = (ID) => {
    this.props.deleteReasonAPI(ID, (res) => {
      if (res.data.Result === true) {
        toastr.success(MESSAGES.DELETE_REASON_SUCCESSFULLY)
        this.getTableListData()
      }
    })
  }

  /**
   * @method buttonFormatter
   * @description Renders buttons
   */
  buttonFormatter = (cell, row, enumObject, rowIndex) => {
    const { EditAccessibility } = this.state
    return (
      <>
        {EditAccessibility && (
          <button
            className="Edit"
            type={'button'}
            onClick={() => this.editItemDetails(cell)}
          />
        )}
        {/* <button className="Delete" type={'button'} onClick={() => this.deleteItem(cell)} /> */}
      </>
    )
  }

  /**
   * @method statusButtonFormatter
   * @description Renders buttons
   */
  statusButtonFormatter = (cell, row, enumObject, rowIndex) => {
    return (
      <>
        <label htmlFor="normal-switch">
          <Switch
            onChange={() => this.handleChange(cell, row, enumObject, rowIndex)}
            checked={cell}
            background="#ff6600"
            onColor="#4DC771"
            onHandleColor="#ffffff"
            offColor="#FC5774"
            id="normal-switch"
            height={24}
          />
        </label>
      </>
    )
  }

  handleChange = (cell, row, enumObject, rowIndex) => {
    let data = {
      Id: row.ReasonId,
      LoggedInUserId: loggedInUserId(),
      IsActive: !cell, //Status of the Reason.
    }
    this.props.activeInactiveReasonStatus(data, (res) => {
      if (res && res.data && res.data.Result) {
        if (cell == true) {
          toastr.success(MESSAGES.REASON_INACTIVE_SUCCESSFULLY)
        } else {
          toastr.success(MESSAGES.REASON_ACTIVE_SUCCESSFULLY)
        }
        this.getTableListData()
      }
    })
  }

  /**
   * @method indexFormatter
   * @description Renders serial number
   */
  indexFormatter = (cell, row, enumObject, rowIndex) => {
    let currentPage = this.refs.table.state.currPage
    let sizePerPage = this.refs.table.state.sizePerPage
    let serialNumber = ''
    if (currentPage === 1) {
      serialNumber = rowIndex + 1
    } else {
      serialNumber = rowIndex + 1 + sizePerPage * (currentPage - 1)
    }
    return serialNumber
  }

  onExportToCSV = (row) => {
    return this.state.userData // must return the data which you want to be exported
  }

  renderPaginationShowsTotal(start, to, total) {
    return <GridTotalFormate start={start} to={to} total={total} />
  }

  formToggle = () => {
    $("html,body").animate({ scrollTop: 0 }, "slow");
    this.setState({ isOpenDrawer: true })
  }

  closeVendorDrawer = (e = '') => {
    this.setState(
      {
        isOpenDrawer: false,
        isEditFlag: false,
        ID: '',
      },
      () => {
        this.getTableListData()
      },
    )
  }

  returnExcelColumn = (data = [], TempData) => {
    const ExcelFile = ReactExport.ExcelFile;
    const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
    const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
    let temp = []
    temp = TempData.map((item) => {
      // if (item.ClientName === null) {
      //   item.ClientName = ' '
      // } 
      return item
    })

    return (<ExcelSheet data={temp} name={`${Reasonmaster}`}>
      {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)
      }
    </ExcelSheet>);
  }
  renderColumn = (fileName) => {
    let arr = this.props.reasonDataList && this.props.reasonDataList.length > 0 ? this.props.reasonDataList : []
    // if (arr != []) {
    //     arr && arr.map(item => {
    //         let len = Object.keys(item).length
    //         for (let i = 0; i < len; i++) {
    //             // let s = Object.keys(item)[i]
    //             if (item.ECNNumber === null) {
    //                 item.ECNNumber = ' '
    //             } else if (item.RevisionNumber === null) {
    //                 item.RevisionNumber = ' '
    //             } else if (item.DrawingNumber === null) {
    //                 item.DrawingNumber = ' '
    //             } else if (item.Technology === '-') {
    //                 item.Technology = ' '
    //             } else {
    //                 return false
    //             }
    //         }
    //     })
    // }
    return this.returnExcelColumn(REASON_DOWNLOAD_EXCEl, arr)
  }

  /**
   * @method render
   * @description Renders the component
   */
  render() {
    const { isEditFlag, isOpenDrawer, AddAccessibility, DownloadAccessibility } = this.state
    const ExcelFile = ReactExport.ExcelFile;

    const options = {
      clearSearch: true,
      noDataText: (this.props.reasonDataList === undefined ? <LoaderCustom /> : <NoContentFound title={CONSTANT.EMPTY_DATA} />),
      // exportCSVBtn: this.createCustomExportCSVButton,
      // onExportToCSV: this.handleExportCSVButtonClick,
      //paginationShowsTotal: true,
      paginationShowsTotal: this.renderPaginationShowsTotal,
      prePage: <span className="prev-page-pg"></span>, // Previous page button text
      nextPage: <span className="next-page-pg"></span>, // Next page button text
      firstPage: <span className="first-page-pg"></span>, // First page button text
      lastPage: <span className="last-page-pg"></span>,

    }

    return (
      <>
        <div className="container-fluid show-table-btn">
          {/* {this.props.loading && <Loader />} */}
          <Row>
            <Col md={12}><h1 className="mb-0">Reason Master</h1></Col>
          </Row>
          <Row className="no-filter-row pt-4">
            <Col md={6} className="text-right filter-block"></Col>
            <Col md="6" className="text-right search-user-block pr-0">
              <div className="d-flex justify-content-end bd-highlight w100">
                <div>
                  {AddAccessibility && (
                    <button
                      type="button"
                      className={'user-btn'}
                      onClick={this.formToggle}
                    >
                      <div className={'plus'}></div>ADD
                    </button>
                  )}
                  {DownloadAccessibility &&
                    <ExcelFile filename={`${Reasonmaster}`} fileExtension={'.xls'} element={<button type="button" className={'user-btn mr5'}><div className="download"></div>DOWNLOAD</button>}>
                      {this.renderColumn(`${Reasonmaster}`)}
                    </ExcelFile>
                  }
                </div>
              </div>
            </Col>
          </Row>
          <BootstrapTable
            data={this.props.reasonDataList}
            striped={false}
            hover={false}
            bordered={false}
            options={options}
            search
            // exportCSV={DownloadAccessibility}
            // csvFileName={`${Reasonmaster}.csv`}
            //ignoreSinglePage
            ref={'table'}
            trClassName={'userlisting-row'}
            tableHeaderClass="my-custom-header"
            pagination
          >
            {/* <TableHeaderColumn dataField="Sr. No." width={'70'} csvHeader='Full-Name' dataFormat={this.indexFormatter}>Sr. No.</TableHeaderColumn> */}
            <TableHeaderColumn
              dataField="Reason"
              dataAlign="left"
              dataSort={true}
            >
              Reason
            </TableHeaderColumn>
            <TableHeaderColumn
              width={100}
              dataField="IsActive"
              export={false}
              dataAlign="center"
              dataFormat={this.statusButtonFormatter}
            >
              Status
            </TableHeaderColumn>
            <TableHeaderColumn
              width={80}
              className="action"
              dataField="ReasonId"
              export={false}
              searchable={false}
              dataAlign="right"
              isKey={true}
              dataFormat={this.buttonFormatter}
            >
              Actions
            </TableHeaderColumn>
          </BootstrapTable>
        </div>
        {isOpenDrawer && (
          <AddReason
            isOpen={isOpenDrawer}
            closeDrawer={this.closeVendorDrawer}
            isEditFlag={isEditFlag}
            ID={this.state.ID}
            anchor={'right'}
          />
        )}
      </>
    )
  }
}

/**
 * @method mapStateToProps
 * @description return state to component as props
 * @param {*} state
 */
function mapStateToProps({ reason, auth }) {
  const { loading, reasonDataList } = reason
  const { leftMenuData } = auth
  return { loading, leftMenuData, reasonDataList }
}

/**
 * @method connect
 * @description connect with redux
 * @param {function} mapStateToProps
 * @param {function} mapDispatchToProps
 */

export default connect(mapStateToProps, {
  getAllReasonAPI,
  deleteReasonAPI,
  activeInactiveReasonStatus,
  getLeftMenu,
})(
  reduxForm({
    form: 'ReasonListing',
    onSubmitFail: (errors) => {
      focusOnError(errors)
    },
    enableReinitialize: true,
  })(ReasonListing),
)
