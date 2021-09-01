import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, } from "redux-form";
import { Row, Col, } from 'reactstrap';
import {
  deleteRawMaterialAPI, getRMImportDataList, getRawMaterialNameChild, getGradeSelectList, getRMGradeSelectListByRawMaterial,
  getRawMaterialFilterSelectList, getGradeFilterByRawMaterialSelectList, getVendorFilterByRawMaterialSelectList, getRawMaterialFilterByGradeSelectList,
  getVendorFilterByGradeSelectList, getRawMaterialFilterByVendorSelectList, getGradeFilterByVendorSelectList, setFilterForRM
} from '../actions/Material';
import { checkForDecimalAndNull, required } from "../../../helper/validation";
import { getSupplierList } from '../../../actions/Common';
import { searchableSelect } from "../../layout/FormInputs";
import { CONSTANT } from '../../../helper/AllConastant';
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';
import { toastr } from 'react-redux-toastr';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import InputRange from 'react-input-range';
import 'react-input-range/lib/css/index.css';
import moment from 'moment';
import BulkUpload from '../../massUpload/BulkUpload';
import { GridTotalFormate } from '../../common/TableGridFunctions';
import ConfirmComponent from '../../../helper/ConfirmComponent';
import LoaderCustom from '../../common/LoaderCustom';
import { getPlantSelectListByType, getTechnologySelectList } from '../../../actions/Common'
import { INR, ZBC, RmImport } from '../../../config/constants'
import { costingHeadObjs, RMIMPORT_DOWNLOAD_EXCEl } from '../../../config/masterData';
import ReactExport from 'react-export-excel';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { CheckApprovalApplicableMaster } from '../../../helper';


const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};

var filterParams = {
  comparator: function (filterLocalDateAtMidnight, cellValue) {
    var dateAsString = cellValue != null ? moment(cellValue).format('DD/MM/YYYY') : '';
    if (dateAsString == null) return -1;
    var dateParts = dateAsString.split('/');
    var cellDate = new Date(
      Number(dateParts[2]),
      Number(dateParts[1]) - 1,
      Number(dateParts[0])
    );
    if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
      return 0;
    }
    if (cellDate < filterLocalDateAtMidnight) {
      return -1;
    }
    if (cellDate > filterLocalDateAtMidnight) {
      return 1;
    }
  },
  browserDatePicker: true,
  minValidYear: 2000,
};

class RMImportListing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      isEditFlag: false,
      shown: false,
      tableData: [],
      RawMaterial: [],
      RMGrade: [],
      vendorName: [],
      costingHead: [],
      plant: [],
      value: { min: 0, max: 0 },
      maxRange: 0,
      isBulkUpload: false,
      shown: this.props.isSimulation ? true : false,
      technology: [],
      gridApi: null,
      gridColumnApi: null,
      rowData: null,
    }
  }

  UNSAFE_componentWillMount() {
    this.getInitialRange()
    const { filteredRMData, isSimulation } = this.props
    if (this.props.isSimulation) {

      this.setState({
        costingHead: filteredRMData && filteredRMData.costingHeadTemp && filteredRMData.costingHeadTemp.value ? { label: filteredRMData.costingHeadTemp.label, value: filteredRMData.costingHeadTemp.value } : [],
        plant: filteredRMData && filteredRMData.plantId && filteredRMData.plantId.value ? { label: filteredRMData.plantId.label, value: filteredRMData.plantId.value } : [],
        RawMaterial: filteredRMData && filteredRMData.RMid && filteredRMData.RMid.value ? { label: filteredRMData.RMid.label, value: filteredRMData.RMid.value } : [],
        RMGrade: filteredRMData && filteredRMData.RMGradeid && filteredRMData.RMGradeid.value ? { label: filteredRMData.RMGradeid.label, value: filteredRMData.RMGradeid.value } : [],
        vendorName: filteredRMData && filteredRMData.Vendorid && filteredRMData.Vendorid.value ? { label: filteredRMData.Vendorid.label, value: filteredRMData.Vendorid.value } : [],
        technology: [],
        value: { min: 0, max: 0 },
      }, () => {
        this.getInitialRange()
        this.getDataList(null)

        this.props.getRawMaterialFilterSelectList(() => { })
      })
    }
  }

  /**
  * @method getInitialRange
  * @description GET INTIAL RANGE OF MIN AND MAX VALUES FOR SLIDER
  */
  getInitialRange = () => {
    const { value } = this.state;
    const { filteredRMData, isSimulation } = this.props
    // this.props.setFilterForRM({ costingHeadTemp: costingHeadTemp, plantId: plantId, RMid: RMid, RMGradeid: RMGradeid, Vendorid: Vendorid })
    console.log('filteredRMData: ', filteredRMData);
    const filterData = {
      costingHead: isSimulation && filteredRMData && filteredRMData.costingHeadTemp ? filteredRMData.costingHeadTemp.value : null,
      plantId: isSimulation && filteredRMData && filteredRMData.plantId ? filteredRMData.plantId.value : null,
      material_id: isSimulation && filteredRMData && filteredRMData.RMid ? filteredRMData.RMid.value : null,
      grade_id: isSimulation && filteredRMData && filteredRMData.RMGradeid ? filteredRMData.RMGradeid.value : null,
      vendor_id: isSimulation && filteredRMData && filteredRMData.Vendorid ? filteredRMData.Vendorid.value : null,
      // technologyId: isSimulation && filteredRMData && filteredRMData.costingHeadTemp ? filteredRMData.costingHeadTemp :null,
      technologyId: this.props.isSimulation ? this.props.technology : 0,
      net_landed_min_range: value.min,
      net_landed_max_range: value.max,
    }
    this.props.getRMImportDataList(filterData, (res) => {
      if (res && res.status === 200) {
        let DynamicData = res.data.DynamicData;
        this.setState({ value: { min: 0, max: DynamicData.MaxRange }, })
      }
    })
  }


  /**
  * @method componentDidMount
  * @description Called after rendering the component
  */
  componentDidMount() {
    //this.props.onRef(this)
    this.props.getRawMaterialNameChild(() => { })
    this.props.getGradeSelectList(() => { })
    this.props.getSupplierList(() => { })

    this.props.getRawMaterialFilterSelectList(() => { })
    this.props.getTechnologySelectList(() => { })
    this.getDataList()
    this.props.getPlantSelectListByType(ZBC, () => { })
  }

  // Get updated Table data list after any action performed.
  getUpdatedData = () => {
    this.getDataList()
  }

  getDataList = (costingHead = null, plantId = null, materialId = null, gradeId = null, vendorId = null, technologyId = 0) => {
    const { value } = this.state;
    const { filteredRMData, isSimulation } = this.props

    const filterData = {
      costingHead: isSimulation && filteredRMData && filteredRMData.costingHeadTemp ? filteredRMData.costingHeadTemp.value : costingHead,
      plantId: isSimulation && filteredRMData && filteredRMData.plantId ? filteredRMData.plantId.value : plantId,
      material_id: isSimulation && filteredRMData && filteredRMData.RMid ? filteredRMData.RMid.value : materialId,
      grade_id: isSimulation && filteredRMData && filteredRMData.RMGradeid ? filteredRMData.RMGradeid.value : gradeId,
      vendor_id: isSimulation && filteredRMData && filteredRMData.Vendorid ? filteredRMData.Vendorid.value : vendorId,
      technologyId: this.props.isSimulation ? this.props.technology : technologyId,
      net_landed_min_range: value.min,
      net_landed_max_range: value.max,
    }
    this.props.getRMImportDataList(filterData, (res) => {
      if (res && res.status === 200) {
        let Data = res.data.DataList;
        let DynamicData = res.data.DynamicData;
        this.setState({
          tableData: Data,
          maxRange: DynamicData.MaxRange,
        }, () => {
          if (isSimulation) {
            this.props.apply()
          }
        })
      } else if (res && res.response && res.response.status === 412) {
        this.setState({ tableData: [], maxRange: 0, })
      } else {
        this.setState({ tableData: [], maxRange: 0, })
      }
    })
  }

  /**
  * @method editItemDetails
  * @description edit material type
  */
  editItemDetails = (Id, rowData = {}) => {
    let data = {
      isEditFlag: true,
      Id: Id,
      IsVendor: rowData.CostingHead === 'Vendor Based' ? true : rowData.CostingHead === 'Zero Based' ? false : rowData.CostingHead,
    }
    this.props.getDetails(data);
  }

  /**
  * @method deleteItem
  * @description confirm delete Raw Material details
  */
  deleteItem = (Id) => {
    const toastrConfirmOptions = {
      onOk: () => {
        this.confirmDelete(Id);
      },
      onCancel: () => { },
      component: () => <ConfirmComponent />,
    };
    return toastr.confirm(`${MESSAGES.RAW_MATERIAL_DETAIL_DELETE_ALERT}`, toastrConfirmOptions);
  }

  /**
  * @method confirmDelete
  * @description confirm delete Raw Material details
  */
  confirmDelete = (ID) => {
    this.props.deleteRawMaterialAPI(ID, (res) => {
      if (res.status === 417 && res.data.Result === false) {
        toastr.warning(res.data.Message)
        //toastr.warning('The specification is associated in the system. Please remove the association to delete')
      } else if (res && res.data && res.data.Result === true) {
        toastr.success(MESSAGES.DELETE_RAW_MATERIAL_SUCCESS);
        this.getDataList(null, null, null, null, null)
      }
    });
  }

  /**
  * @method renderPaginationShowsTotal
  * @description Pagination
  */
  renderPaginationShowsTotal(start, to, total) {
    return <GridTotalFormate start={start} to={to} total={total} />
  }

  costFormatter = (props) => {
    const { initialConfiguration } = this.props
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    return cellValue !== INR ? checkForDecimalAndNull(cellValue, initialConfiguration && initialConfiguration.NoOfDecimalForPrice) : '';
  }

  statusFormatter = (props) => {
    const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
    const row = props?.valueFormatted ? props.valueFormatted : props?.data;
    // CHANGE IN STATUS IN AFTER KAMAL SIR API
    return <div className={row.Status}>{row.DisplayStatus}</div>
  }

  /**
  * @method effectiveDateFormatter
  * @description Renders buttons
  */
  effectiveDateFormatter = (props) => {
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    return cellValue != null ? moment(cellValue).format('DD/MM/YYYY') : '';
  }


  /**
  * @method shearingCostFormatter
  * @description Renders buttons
  */
  shearingCostFormatter = (props) => {
    const cellValue = props?.value;
    return cellValue != ' ' ? cellValue : '-';
  }

  /**
  * @method freightCostFormatter
  * @description Renders buttons
  */
  freightCostFormatter = (props) => {
    const cellValue = props?.value;
    return cellValue != ' ' ? cellValue : '-';
  }


  /**
* @method buttonFormatter
* @description Renders buttons
*/
  buttonFormatter = (props) => {
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;

    const { EditAccessibility, DeleteAccessibility } = this.props;
    return (
      <>
        {EditAccessibility && <button className="Edit mr-2" type={'button'} onClick={() => this.editItemDetails(cellValue, rowData)} />}
        {DeleteAccessibility && <button className="Delete" type={'button'} onClick={() => this.deleteItem(cellValue)} />}
      </>
    )
  }

  /**
  * @method costingHeadFormatter
  * @description Renders Costing head
  */
  costingHeadFormatter = (props) => {
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    return (cellValue === true || cellValue === 'Vendor Based') ? 'Vendor Based' : 'Zero Based';
  }


  /**
  * @method renderListing
  * @description Used to show type of listing
  */
  renderListing = (label) => {
    const { filterRMSelectList, plantSelectList, technologySelectList } = this.props;
    const temp = [];
    if (label === 'costingHead') {
      return costingHeadObjs;
    }
    if (label === 'plant') {
      plantSelectList && plantSelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
      });
      return temp;
    }
    if (label === 'material') {
      filterRMSelectList && filterRMSelectList.RawMaterials && filterRMSelectList.RawMaterials.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
      });
      return temp;
    }
    if (label === 'grade') {
      filterRMSelectList && filterRMSelectList.Grades && filterRMSelectList.Grades.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
      });
      return temp;
    }
    if (label === 'VendorNameList') {
      filterRMSelectList && filterRMSelectList.Vendors && filterRMSelectList.Vendors.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
      });
      return temp;
    }
    if (label === 'technology') {
      technologySelectList && technologySelectList.map((item) => {
        if (item.Value === '0') return false
        temp.push({ label: item.Text, value: item.Value })
        return null
      })
      return temp
    }

  }

  /**
  * @method handleRMChange
  * @description  used to handle row material selection
  */
  handleRMChange = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ RawMaterial: newValue, RMGrade: [] }, () => {
        const { RawMaterial } = this.state;
        this.props.getGradeFilterByRawMaterialSelectList(RawMaterial.value, res => { })
        this.props.getVendorFilterByRawMaterialSelectList(RawMaterial.value, res => { })

      });
    } else {
      this.setState({ RawMaterial: [], RMGrade: [] }, () => {
        this.props.getGradeSelectList(res => { });
      });

    }
  }

  /**
  * @method handleGradeChange
  * @description  used to handle row material grade selection
  */
  handleGradeChange = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ RMGrade: newValue }, () => {
        const { RMGrade } = this.state;
        this.props.getRawMaterialFilterByGradeSelectList(RMGrade.value, () => { })
        this.props.getVendorFilterByGradeSelectList(RMGrade.value, () => { })
      })
    } else {
      this.setState({ RMGrade: [], })
    }
  }

  /**
  * @method handleVendorName
  * @description called
  */
  handleVendorName = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ vendorName: newValue }, () => {
        const { vendorName } = this.state;
        this.props.getRawMaterialFilterByVendorSelectList(vendorName.value, () => { })
        this.props.getGradeFilterByVendorSelectList(vendorName.value, () => { })
      });
    } else {
      this.setState({ vendorName: [] })
    }
  };

  /**
  * @method filterList
  * @description Filter user listing on the basis of role and department
  */
  filterList = () => {
    const { costingHead, RawMaterial, RMGrade, vendorName, plant, technology } = this.state;


    const costingHeadTemp = costingHead && costingHead.label === 'Zero Based' ? 0 : costingHead.label === 'Vendor Based' ? 1 : '';
    const plantId = plant ? plant.value : null;
    const RMid = RawMaterial ? RawMaterial.value : null;
    const RMGradeid = RMGrade ? RMGrade.value : null;
    const Vendorid = vendorName ? vendorName.value : null;
    const technologyId = technology ? technology.value : 0

    if (this.props.isSimulation) {
      this.props.setFilterForRM({ costingHeadTemp: { label: costingHead.label, value: costingHead.value }, plantId: { label: plant.label, value: plant.value }, RMid: { label: RawMaterial.label, value: RawMaterial.value }, RMGradeid: { label: RMGrade.label, value: RMGrade.value }, Vendorid: { label: vendorName.label, value: vendorName.value } })
      setTimeout(() => {

        this.getDataList(costingHeadTemp, plantId, RMid, RMGradeid, Vendorid, technologyId)
      }, 500);
    } else {
      this.getDataList(costingHeadTemp, plantId, RMid, RMGradeid, Vendorid, technologyId)
    }
  }

  /**
  * @method resetFilter
  * @description Reset user filter
  */
  resetFilter = () => {
    if (this.props.isSimulation) {
      this.props.setFilterForRM({ costingHeadTemp: '', plantId: '', RMid: '', RMGradeid: '', Vendorid: '' })
    }
    this.setState({
      costingHead: [],
      plant: [],
      RawMaterial: [],
      RMGrade: [],
      vendorName: [],
      plant: [],
      technology: [],
      value: { min: 0, max: 0 },
    }, () => {
      this.getInitialRange()
      this.getDataList()
      this.props.getRawMaterialFilterSelectList(() => { })
    })

  }

  formToggle = () => {
    this.props.formToggle()
  }

  bulkToggle = () => {
    this.setState({ isBulkUpload: true })
  }

  closeBulkUploadDrawer = () => {
    this.setState({ isBulkUpload: false }, () => {
      this.getInitialRange()
      this.getDataList()
    })
  }

  /**
  * @method densityAlert
  * @description confirm Redirection to Material tab.
  */
  densityAlert = () => {
    const toastrConfirmOptions = {
      onOk: () => {
        this.confirmDensity()
      },
      onCancel: () => { }
    };
    return toastr.confirm(`Recently Created Material's Density is not created, Do you want to create?`, toastrConfirmOptions);
  }

  handleHeadChange = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ costingHead: newValue, });
    } else {
      this.setState({ costingHead: [], })
    }
  };

  handlePlantChange = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ plant: newValue })
    } else {
      this.setState({ plant: [] })
    }
  }
  handleTechnologyChange = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ technology: newValue })
    } else {
      this.setState({ technology: [] })
    }
  }

  /**
  * @method confirmDensity
  * @description confirm density popup.
  */
  confirmDensity = () => {
    this.props.toggle('4')
  }

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  onSubmit = (values) => { }

  onGridReady = (params) => {
    this.setState({ gridApi: params.api, gridColumnApi: params.columnApi })

    params.api.paginationGoToPage(0);
  };

  onPageSizeChanged = (newPageSize) => {
    var value = document.getElementById('page-size').value;
    this.state.gridApi.paginationSetPageSize(Number(value));
  };

  onBtExport = () => {
    let tempArr = []
    const data = this.state.gridApi && this.state.gridApi.getModel().rowsToDisplay
    data && data.map((item => {
      tempArr.push(item.data)
    }))

    return this.returnExcelColumn(RMIMPORT_DOWNLOAD_EXCEl, tempArr)
  };

  returnExcelColumn = (data = [], TempData) => {
    let temp = []
    TempData.map((item) => {
      if (item.RMFreightCost === null) {
        item.RMFreightCost = ' '
      } if (item.CostingHead === true) {
        item.CostingHead = 'Vendor Based'
      } if (item.CostingHead === false) {
        item.CostingHead = 'Zero Based'
      } if (item.RMShearingCost === null) {
        item.RMShearingCost = ' '
      } if (item.MaterialType === '-') {
        item.MaterialType = ' '
      } else {
        return false
      }
      return item
    })
    return (

      <ExcelSheet data={TempData} name={RmImport}>
        {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
      </ExcelSheet>);
  }



  onFilterTextBoxChanged(e) {
    this.state.gridApi.setQuickFilter(e.target.value);
  }



  resetState() {
   // gridOptions.columnApi.resetColumnState();
   gridOptions.api.setFilterModel(null);
  }

  /**
  * @method render
  * @description Renders the component
  */
  render() {
    const { handleSubmit, AddAccessibility, BulkUploadAccessibility, DownloadAccessibility } = this.props;
    const { isBulkUpload, } = this.state;

    const defaultColDef = {
      resizable: true,
      filter: true,
      sortable: true,

    };


    const frameworkComponents = {
      totalValueRenderer: this.buttonFormatter,
      effectiveDateRenderer: this.effectiveDateFormatter,
      costingHeadRenderer: this.costingHeadFormatter,
      customLoadingOverlay: LoaderCustom,
      customNoRowsOverlay: NoContentFound,
      freightCostFormatter: this.freightCostFormatter,
      shearingCostFormatter: this.shearingCostFormatter,
      costFormatter: this.costFormatter,
      statusFormatter: this.statusFormatter
    };


    return (
      <div className={`ag-grid-react ${DownloadAccessibility ? "show-table-btn" : ""}`}>
        {/* {this.props.loading && <Loader />} */}
        <form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>
          <Row className="pt-4 filter-row-large">
            {this.state.shown && (
              <Col lg="11" md="12" className="filter-block ">
                <div className="d-inline-flex justify-content-start align-items-top w100 rm-import-filter">
                  <div className="flex-fills">
                    <h5>{`Filter By:`}</h5>
                  </div>
                  <div className="flex-fill">
                    <Field
                      name="CostingHead"
                      type="text"
                      label=""
                      component={searchableSelect}
                      placeholder={'Costing Head'}
                      isClearable={false}
                      options={this.renderListing('costingHead')}
                      //onKeyUp={(e) => this.changeItemDesc(e)}
                      validate={(this.state.costingHead == null || this.state.costingHead.length === 0) ? [required] : []}
                      required={true}
                      handleChangeDescription={this.handleHeadChange}
                      valueDescription={this.state.costingHead}
                    />
                  </div>
                  <div className="flex-fill">
                    <Field
                      name="Plant"
                      type="text"
                      label=""
                      component={searchableSelect}
                      placeholder={'Plant'}
                      isClearable={false}
                      options={this.renderListing('plant')}
                      //onKeyUp={(e) => this.changeItemDesc(e)}
                      validate={(this.state.plant == null || this.state.plant.length === 0) ? [required] : []}
                      required={true}
                      handleChangeDescription={this.handlePlantChange}
                      valueDescription={this.state.plant}
                    />
                  </div>
                  {
                    !this.props.isSimulation &&
                    <div className="flex-fill">
                      <Field
                        name="Technology"
                        type="text"
                        label=""
                        component={searchableSelect}
                        placeholder={'Technology'}
                        isClearable={false}
                        options={this.renderListing('technology')}
                        //onKeyUp={(e) => this.changeItemDesc(e)}
                        validate={(this.state.technology === null || this.state.technology.length === 0) ? [] : []}
                        required={true}
                        handleChangeDescription={this.handleTechnologyChange}
                        valueDescription={this.state.technology}
                      />
                    </div>
                  }
                  <div className="flex-fill">
                    <Field
                      name="RawMaterialId"
                      type="text"
                      label={""}
                      component={searchableSelect}
                      placeholder={"Raw Material"}
                      isClearable={false}
                      options={this.renderListing("material")}
                      //onKeyUp={(e) => this.changeItemDesc(e)}
                      validate={
                        this.state.RawMaterial == null ||
                          this.state.RawMaterial.length === 0
                          ? [required]
                          : []
                      }
                      required={true}
                      handleChangeDescription={this.handleRMChange}
                      valueDescription={this.state.RawMaterial}
                    />
                  </div>
                  <div className="flex-fill">
                    <Field
                      name="RawMaterialGradeId"
                      type="text"
                      label={""}
                      component={searchableSelect}
                      placeholder={"RM Grade"}
                      isClearable={false}
                      options={this.renderListing("grade")}
                      //onKeyUp={(e) => this.changeItemDesc(e)}
                      validate={
                        this.state.RMGrade == null || this.state.RMGrade.length === 0 ? [required] : []}
                      required={true}
                      handleChangeDescription={this.handleGradeChange}
                      valueDescription={this.state.RMGrade}
                    />
                  </div>
                  <div className="flex-fill">
                    <Field
                      name="VendorId"
                      type="text"
                      label={""}
                      component={searchableSelect}
                      placeholder={"Vendor"}
                      isClearable={false}
                      options={this.renderListing("VendorNameList")}
                      //onKeyUp={(e) => this.changeItemDesc(e)}
                      validate={
                        this.state.vendorName == null || this.state.vendorName.length === 0 ? [required] : []}
                      required={true}
                      handleChangeDescription={this.handleVendorName}
                      valueDescription={this.state.vendorName}
                    />
                  </div>
                  <div className="flex-fill sliderange">
                    <InputRange
                      maxValue={this.state.maxRange}
                      minValue={0}
                      value={this.state.value}
                      onChange={(value) => this.setState({ value })}
                    />
                  </div>

                  <div className="flex-fill">
                    <button
                      type="button"
                      //disabled={pristine || submitting}
                      onClick={this.resetFilter}
                      className="reset mr10"
                    >
                      {"Reset"}
                    </button>

                    <button
                      type="button"
                      //disabled={pristine || submitting}
                      onClick={this.filterList}
                      className="user-btn"
                    >
                      {"Apply"}
                    </button>
                  </div>
                </div>
              </Col>
            )}

            {
              !this.props.isSimulation &&
              <Col lg="6" md="6" className="search-user-block mb-3">
                <div className="d-flex justify-content-end bd-highlight w100">
                  <div>
                    {this.state.shown ? (
                      <button type="button" className="user-btn mr5 filter-btn-top" onClick={() => this.setState({ shown: !this.state.shown })}>
                        <div className="cancel-icon-white"></div>
                      </button>
                    ) : (
                      <button title="Filter" type="button" className="user-btn mr5" onClick={() => this.setState({ shown: !this.state.shown })}>
                        <div className="filter mr-0"></div>
                      </button>
                    )}
                    {AddAccessibility && (
                      <button
                        type="button"
                        className={"user-btn mr5"}
                        onClick={this.formToggle}
                        title="Add"
                      >
                        <div className={"plus mr-0"}></div>
                        {/* ADD */}
                      </button>
                    )}
                    {BulkUploadAccessibility && (
                      <button
                        type="button"
                        className={"user-btn mr5"}
                        onClick={this.bulkToggle}
                        title="Bulk Upload"
                      >
                        <div className={"upload mr-0"}></div>
                        {/* Bulk Upload */}
                      </button>
                    )}
                    {
                      DownloadAccessibility &&
                      <>

                        <ExcelFile filename={'RM Import'} fileExtension={'.xls'} element={
                          <button type="button" className={'user-btn mr5'}><div className="download mr-0" title="Download"></div>
                            {/* DOWNLOAD */}
                          </button>}>

                          {this.onBtExport()}
                        </ExcelFile>

                      </>

                      //   <button type="button" className={"user-btn mr5"} onClick={this.onBtExport}><div className={"download"} ></div>Download</button>

                    }

                    <button type="button" className="user-btn refresh-icon" onClick={() => this.resetState()}></button>
                  </div>
                </div>
              </Col>
            }
          </Row>
        </form>
        <Row>
          <Col>

            <div className="ag-grid-wrapper" style={{ width: '100%', height: '100%' }}>
              <div className="ag-grid-header">
                <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" onChange={(e) => this.onFilterTextBoxChanged(e)} />
              </div>
              <div
                className="ag-theme-material"
              >
                <AgGridReact
                  defaultColDef={defaultColDef}
                  floatingFilter = {true}
                  domLayout='autoHeight'
                  // columnDefs={c}
                  rowData={this.props.rmImportDataList}
                  pagination={true}
                  paginationPageSize={10}
                  onGridReady={this.onGridReady}
                  gridOptions={gridOptions}
                  loadingOverlayComponent={'customLoadingOverlay'}
                  noRowsOverlayComponent={'customNoRowsOverlay'}
                  noRowsOverlayComponentParams={{
                    title: CONSTANT.EMPTY_DATA,
                  }}
                  frameworkComponents={frameworkComponents}
                >
                  <AgGridColumn field="CostingHead" headerName="Head" cellRenderer={'costingHeadRenderer'}></AgGridColumn>
                  <AgGridColumn field="TechnologyName" headerName="Technology"></AgGridColumn>
                  <AgGridColumn field="RawMaterial" headerName="Raw Material"></AgGridColumn>
                  <AgGridColumn field="RMGrade" headerName="RM Grade"></AgGridColumn>
                  <AgGridColumn field="RMSpec" headerName="RM Spec"></AgGridColumn>
                  <AgGridColumn field="Category" headerName="Category"></AgGridColumn>
                  <AgGridColumn field="MaterialType" headerName="Material"></AgGridColumn>
                  <AgGridColumn field="Plant" headerName="Plant"></AgGridColumn>
                  <AgGridColumn field="VendorName" headerName="Vendor(Code)"></AgGridColumn>
                  <AgGridColumn field="UOM" headerName="UOM"></AgGridColumn>
                  <AgGridColumn field="BasicRate" headerName="Basic Rate(INR)"></AgGridColumn>
                  <AgGridColumn field="ScrapRate" headerName="Scrap Rate(INR)" ></AgGridColumn>
                  <AgGridColumn field="RMFreightCost" headerName="RM Freight Cost(INR)" cellRenderer='freightCostFormatter'></AgGridColumn>
                  <AgGridColumn field="RMShearingCost" headerName="Shearing Cost(INR)" cellRenderer='shearingCostFormatter'></AgGridColumn>
                  <AgGridColumn field="NetLandedCostConversion" headerName="Net Cost(INR)" cellRenderer='costFormatter'></AgGridColumn>
                  <AgGridColumn field="EffectiveDate" cellRenderer='effectiveDateRenderer' filter="agDateColumnFilter" filterParams={filterParams}></AgGridColumn>
                  {CheckApprovalApplicableMaster('1') && <AgGridColumn field="DisplayStatus" headerName="Status" cellRenderer='statusFormatter'></AgGridColumn>}
                  {!this.props.isSimulation && <AgGridColumn width={120} field="RawMaterialId" headerName="Action" type="rightAligned" cellRenderer='totalValueRenderer'></AgGridColumn>}
                  <AgGridColumn field="VendorId" hide={true}></AgGridColumn>
                  <AgGridColumn field="TechnologyId" hide={true}></AgGridColumn>
                </AgGridReact>
                <div className="paging-container d-inline-block float-right">
                  <select className="form-control paging-dropdown" onChange={(e) => this.onPageSizeChanged(e.target.value)} id="page-size">
                    <option value="10" selected={true}>10</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </div>
              </div>
            </div>
          </Col>
        </Row>
        {isBulkUpload && <BulkUpload
          isOpen={isBulkUpload}
          closeDrawer={this.closeBulkUploadDrawer}
          isEditFlag={false}
          densityAlert={this.densityAlert}
          fileName={'RMImport'}
          isZBCVBCTemplate={true}
          messageLabel={'RM Import'}
          anchor={'right'}
        />}
      </div >

    );
  }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ material, comman, auth }) {
  const { rawMaterialNameSelectList, gradeSelectList, filterRMSelectList, rmImportDataList, filteredRMData } = material;
  const { supplierSelectList, plantSelectList, technologySelectList } = comman;
  const { initialConfiguration } = auth;
  return { supplierSelectList, rawMaterialNameSelectList, gradeSelectList, filterRMSelectList, rmImportDataList, initialConfiguration, plantSelectList, technologySelectList, filteredRMData }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
  deleteRawMaterialAPI,
  getRMImportDataList,
  getRawMaterialNameChild,
  getGradeSelectList,
  getRMGradeSelectListByRawMaterial,
  getSupplierList,
  getRawMaterialFilterSelectList,
  getGradeFilterByRawMaterialSelectList,
  getVendorFilterByRawMaterialSelectList,
  getRawMaterialFilterByGradeSelectList,
  getVendorFilterByGradeSelectList,
  getRawMaterialFilterByVendorSelectList,
  getGradeFilterByVendorSelectList,
  getPlantSelectListByType,
  getTechnologySelectList,
  setFilterForRM
})(reduxForm({
  form: 'RMImportListing',
  enableReinitialize: true,
})(RMImportListing));
