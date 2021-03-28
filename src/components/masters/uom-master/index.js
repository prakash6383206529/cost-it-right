import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col, } from 'reactstrap';
import AddUOM from './AddUOM';
import { getUnitOfMeasurementAPI, deleteUnitOfMeasurementAPI, activeInactiveUOM } from '../actions/unitOfMeasurment';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../config/message';
import { CONSTANT } from '../../../helper/AllConastant';
import NoContentFound from '../../common/NoContentFound';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import Switch from "react-switch";
import { UOM } from '../../../config/constants';
import { checkPermission } from '../../../helper/util';
import { reactLocalStorage } from 'reactjs-localstorage';
import { loggedInUserId } from '../../../helper/auth';
import { getLeftMenu, } from '../../../actions/auth/AuthActions';
import { GridTotalFormate } from '../../common/TableGridFunctions';
import { applySuperScript } from '../../../helper/validation';

class UOMMaster extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      isEditFlag: false,
      uomId: '',
      dataList: [],

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
        const accessData = Data && Data.find(el => el.PageName === UOM)
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

    this.getUOMDataList()
  }

  getUOMDataList = () => {
    this.props.getUnitOfMeasurementAPI(res => {
      if (res && res.data && res.data.DataList) {
        let Data = res.data.DataList;
        this.setState({ dataList: Data })
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
      this.getUOMDataList()
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
      uomId: Id,
    })
  }

  /**
  * @method deleteItem
  * @description confirm delete UOM
  */
  deleteItem = (Id) => {
    const toastrConfirmOptions = {
      onOk: () => {
        this.confirmDeleteUOM(Id)
      },
      onCancel: () => { }
    };
    return toastr.confirm(`Are you sure you want to delete UOM?`, toastrConfirmOptions);
  }

  /**
  * @method confirmDeleteUOM
  * @description confirm delete unit of measurement
  */
  confirmDeleteUOM = (Id) => {
    this.props.deleteUnitOfMeasurementAPI(Id, (res) => {
      if (res.data.Result) {
        toastr.success(MESSAGES.DELETE_UOM_SUCCESS);
        this.getUOMDataList()
      }
    });
  }

  renderPaginationShowsTotal(start, to, total) {
    return <GridTotalFormate start={start} to={to} total={total} />
  }

  /**
  * @method applySuperScriptFormatter
  * @description Renders buttons
  */
  applySuperScriptFormatter = (cell, row, enumObject, rowIndex) => {
    if (cell && cell.indexOf('^') !== -1) {
      return applySuperScript(cell)
    } else {
      return cell;
    }
  }

  /**
  * @method buttonFormatter
  * @description Renders buttons
  */
  buttonFormatter = (cell, row, enumObject, rowIndex) => {
    const { EditAccessibility } = this.state;
    return (
      <>
        {EditAccessibility && <button className="Edit mr5" type={'button'} onClick={() => this.editItemDetails(cell)} />}
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
          {/* <span>Switch with default style</span> */}
          <Switch
            onChange={() =>
              this.handleChange(cell, row, enumObject, rowIndex)
            }
            checked={cell}
            background="#ff6600"
            onColor="#4DC771"
            offColor="#FC5774"
            onHandleColor="#ffffff"
            id="normal-switch"
            height={24}
          />
        </label>
      </>
    );
  }

  handleChange = (cell, row, enumObject, rowIndex) => {
    let data = {
      Id: row.Id,
      LoggedInUserId: loggedInUserId(),
      IsActive: !cell, //Status of the UOM.
    }
    this.props.activeInactiveUOM(data, res => {
      if (res && res.data && res.data.Result) {
        if (cell === true) {
          toastr.success(MESSAGES.UOM_INACTIVE_SUCCESSFULLY)
        } else {
          toastr.success(MESSAGES.UOM_ACTIVE_SUCCESSFULLY)
        }
        this.getUOMDataList()
      }
    })
  }

  /**
  * @method render
  * @description Renders the component
  */
  render() {
    const { isOpen, isEditFlag, uomId, AddAccessibility } = this.state;
    const options = {
      clearSearch: true,
      noDataText: <NoContentFound title={CONSTANT.EMPTY_DATA} />,
      //exportCSVText: 'Download Excel',
      //onExportToCSV: this.onExportToCSV,
      //paginationShowsTotal: true,
      paginationShowsTotal: this.renderPaginationShowsTotal,
      prePage: <span className="prev-page-pg"></span>, // Previous page button text
      nextPage: <span className="next-page-pg"></span>, // Next page button text
      firstPage: <span className="first-page-pg"></span>, // First page button text
      lastPage: <span className="last-page-pg"></span>,

    };
    return (
      <>
        <div className="container-fluid">
          {/* {this.props.loading && <Loader />} */}
          <Row>
            <Col md={12}>
              <h1 className="mb-0">{`Unit of Measurement Master`}</h1>
            </Col>
          </Row>
          <Row className="no-filter-row mt-4">
            {AddAccessibility && (
              <>
                <Col md={6} className="text-right filter-block"></Col>
                {/* <Col md={6} className="text-right search-user-block pr-0">
                  <button
                    type={"button"}
                    className={"user-btn"}
                    onClick={this.openModel}
                  >
                    <div className={"plus"}></div>
                    {`ADD`}
                  </button>
                </Col> */}
              </>
            )}
          </Row>

          <Row>
            <Col>
              <BootstrapTable
                data={this.state.dataList}
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
                <TableHeaderColumn dataField="Unit" isKey={true} dataAlign="left" dataSort={true} dataFormat={this.applySuperScriptFormatter}                >                  Unit                    </TableHeaderColumn>
                <TableHeaderColumn dataField="UnitType" dataAlign="right" dataSort={true}>Unit Type</TableHeaderColumn>
                {/* <TableHeaderColumn
                  dataField="IsActive"
                  dataFormat={this.statusButtonFormatter}
                >
                  Status
                    </TableHeaderColumn> */}
                {/* <TableHeaderColumn
                  width={100}
                  dataField="Id"
                  isKey={true}
                  dataAlign="right"
                  dataFormat={this.buttonFormatter}
                >
                  Actions
                    </TableHeaderColumn> */}
              </BootstrapTable>
            </Col>
          </Row>
          {isOpen && (
            <AddUOM
              isOpen={isOpen}
              closeDrawer={this.closeDrawer}
              isEditFlag={isEditFlag}
              ID={uomId}
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
function mapStateToProps({ unitOfMeasrement, auth }) {
  const { unitOfMeasurementList, loading, } = unitOfMeasrement;
  const { leftMenuData } = auth;
  return { unitOfMeasurementList, leftMenuData, loading }
}

export default connect(
  mapStateToProps, {
  getUnitOfMeasurementAPI,
  deleteUnitOfMeasurementAPI,
  activeInactiveUOM,
  getLeftMenu,
}
)(UOMMaster);

