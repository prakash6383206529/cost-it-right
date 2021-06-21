import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, } from "redux-form";
import { Row, Col, } from 'reactstrap';
import {
    deleteRawMaterialAPI, getRMDomesticDataList, getRawMaterialNameChild, getGradeSelectList, getVendorListByVendorType,
    getRawMaterialFilterSelectList, getGradeFilterByRawMaterialSelectList, getVendorFilterByRawMaterialSelectList, getRawMaterialFilterByGradeSelectList,
    getVendorFilterByGradeSelectList, getRawMaterialFilterByVendorSelectList, getGradeFilterByVendorSelectList,
} from '../actions/Material';
import { checkForDecimalAndNull, required } from "../../../helper/validation";
import { searchableSelect } from "../../layout/FormInputs";
import { CONSTANT } from '../../../helper/AllConastant';
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';
import { toastr } from 'react-redux-toastr';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import InputRange from 'react-input-range';
import 'react-input-range/lib/css/index.css'
import moment from 'moment';
import BulkUpload from '../../massUpload/BulkUpload';
import { GridTotalFormate } from '../../common/TableGridFunctions';
import ConfirmComponent from "../../../helper/ConfirmComponent";
import LoaderCustom from '../../common/LoaderCustom';
import { costingHeadObjs } from '../../../config/masterData';
import { getPlantSelectListByType, getTechnologySelectList } from '../../../actions/Common'
import { ZBC, RmDomestic } from '../../../config/constants'

class RMDomesticListing extends Component {
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
            technology: []
        }
    }

    UNSAFE_componentWillMount() {
        this.getInitialRange()
    }

    /**
    * @method getInitialRange
    * @description GET INTIAL RANGE OF MIN AND MAX VALUES FOR SLIDER
    */
    getInitialRange = () => {
        const { value } = this.state;
        const filterData = {
            costingHead: null,
            plantId: null,
            material_id: null,
            grade_id: null,
            vendor_id: null,
            technologyId: null,
            technologyId: this.props.isSimulation ? this.props.technology : 0,
            net_landed_min_range: value.min,
            net_landed_max_range: value.max,
        }
        this.props.getRMDomesticDataList(filterData, (res) => {
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
        this.props.getRawMaterialNameChild(() => { })
        this.props.getGradeSelectList(() => { })
        this.props.getVendorListByVendorType(false, () => { })

        this.props.getRawMaterialFilterSelectList(() => { })
        this.props.getTechnologySelectList(() => { })
        this.getDataList()
        this.props.getPlantSelectListByType(ZBC, () => { })

    }

    /**
    * @method hideForm
    * @description Get updated Table data list after any action performed.
    */
    getUpdatedData = () => {
        this.getDataList()
    }

    /**
    * @method hideForm
    * @description HIDE DOMESTIC, IMPORT FORMS
    */
    getDataList = (costingHead = null, plantId = null, materialId = null, gradeId = null, vendorId = null, technologyId = 0) => {
        const { value } = this.state;
        const filterData = {
            costingHead: costingHead,
            plantId: plantId,
            material_id: materialId,
            grade_id: gradeId,
            vendor_id: vendorId,
            technologyId: this.props.isSimulation ? this.props.technology : technologyId,
            net_landed_min_range: value.min,
            net_landed_max_range: value.max,
        }
        this.props.getRMDomesticDataList(filterData, (res) => {
            if (res && res.status === 200) {
                let Data = res.data.DataList;
                let DynamicData = res.data.DynamicData;
                this.setState({
                    tableData: Data,
                    maxRange: DynamicData.MaxRange,
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
    editItemDetails = (Id, rowData) => {
        let data = {
            isEditFlag: true,
            Id: Id,
            IsVendor: rowData.CostingHead,
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
                this.confirmDelete(Id)
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
            } else if (res && res.data && res.data.Result === true) {
                toastr.success(MESSAGES.DELETE_RAW_MATERIAL_SUCCESS);
                this.getDataList()
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

    /**
    * @method buttonFormatter
    * @description Renders buttons
    */
    buttonFormatter = (cell, row, enumObject, rowIndex) => {
        const { EditAccessibility, DeleteAccessibility } = this.props;
        return (
            <>
                {EditAccessibility && <button className="Edit mr-2" type={'button'} onClick={() => this.editItemDetails(cell, row)} />}
                {DeleteAccessibility && <button className="Delete" type={'button'} onClick={() => this.deleteItem(cell)} />}
            </>
        )
    }

    /**
    * @method costingHeadFormatter
    * @description Renders Costing head
    */
    costingHeadFormatter = (cell, row, enumObject, rowIndex) => {
        return (cell === true || cell === 'Vendor Based') ? 'Vendor Based' : 'Zero Based';
    }

    /**
    * @method indexFormatter
    * @description Renders serial number
    */
    indexFormatter = (cell, row, enumObject, rowIndex) => {
        const { table } = this.refs;
        let currentPage = table && table.state && table.state.currPage ? table.state.currPage : '';
        let sizePerPage = table && table.state && table.state.sizePerPage ? table.state.sizePerPage : '';
        let serialNumber = '';
        if (currentPage === 1) {
            serialNumber = rowIndex + 1;
        } else {
            serialNumber = (rowIndex + 1) + (sizePerPage * (currentPage - 1));
        }
        return serialNumber;
    }

    renderSerialNumber = () => {
        return <>Sr. <br />No. </>
    }

    renderCostingHead = () => {
        return <>Costing <br />Head </>
    }

    renderRawMaterial = () => {
        return <>Raw <br />Material </>
    }

    renderRMGrade = () => {
        return <>RM <br />Grade </>
    }

    renderRMSpec = () => {
        return <>RM <br />Spec </>
    }

    renderVendorLocation = () => {
        return <>Vendor <br />Location </>
    }

    renderBasicRate = () => {
        return <>Basic <br />Rate(INR) </>
    }

    rendorFreightRate = () => {
        return <>RM Freight <br /> Cost(INR)</>
    }

    renderShearingCost = () => {
        return <>Shearing <br /> Cost(INR)</>
    }

    renderScrapRate = () => {
        return <>Scrap <br />Rate(INR) </>
    }

    renderNetCost = () => {
        return <>Net <br />Cost(INR) </>
    }

    costFormatter = (cell, row, enumObject, rowIndex) => {
        const { initialConfiguration } = this.props
        return cell != null ? checkForDecimalAndNull(cell, initialConfiguration && initialConfiguration.NoOfDecimalForPrice) : '';
    }

    /**
    * @method effectiveDateFormatter
    * @description Renders buttons
    */
    effectiveDateFormatter = (cell, row, enumObject, rowIndex) => {
        return cell != null ? moment(cell).format('DD/MM/YYYY') : '';
    }

    /**
  * @method shearingCostFormatter
  * @description Renders buttons
  */
    shearingCostFormatter = (cell, row, enumObject, rowIndex) => {
        return cell != null ? cell : '-';
    }

    /**
    * @method freightCostFormatter
    * @description Renders buttons
    */
    freightCostFormatter = (cell, row, enumObject, rowIndex) => {
        return cell != null ? cell : '-';
    }

    renderEffectiveDate = () => {
        return <>Effective <br />Date</>
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
                return null;
            });
            return temp;
        }
        if (label === 'grade') {
            filterRMSelectList && filterRMSelectList.Grades && filterRMSelectList.Grades.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }
        if (label === 'VendorNameList') {
            filterRMSelectList && filterRMSelectList.Vendors && filterRMSelectList.Vendors.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
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
            this.setState({
                RawMaterial: newValue,
            }, () => {
                const { RawMaterial } = this.state;
                this.props.getGradeFilterByRawMaterialSelectList(RawMaterial.value, res => { })
                this.props.getVendorFilterByRawMaterialSelectList(RawMaterial.value, res => { })
            });
        } else {
            this.setState({
                RawMaterial: [],
            }, () => {
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

        this.getDataList(costingHeadTemp, plantId, RMid, RMGradeid, Vendorid, technologyId)
    }

    /**
    * @method resetFilter
    * @description Reset user filter
    */
    resetFilter = () => {
        this.setState({
            costingHead: [],
            RawMaterial: [],
            RMGrade: [],
            vendorName: [],
            plant: [],
            technology: [],
            value: { min: 0, max: 0 },
        }, () => {
            this.getInitialRange()
            this.getDataList(null)
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
            this.getDataList(null, null, null)
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
    onSubmit = (values) => {

    }

    handleExportCSVButtonClick = (onClick) => {
        onClick();
        let products = []
        products = this.props.rmDataList
        return products; // must return the data which you want to be exported
    }

    createCustomExportCSVButton = (onClick) => {
        return (
            <ExportCSVButton btnText='Download' onClick={() => this.handleExportCSVButtonClick(onClick)} />
        );
    }



    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, AddAccessibility, BulkUploadAccessibility, loading, DownloadAccessibility } = this.props;
        const { isBulkUpload, } = this.state;

        const options = {
            clearSearch: true,
            noDataText: (this.props.rmDataList === undefined ? <LoaderCustom /> : <NoContentFound title={CONSTANT.EMPTY_DATA} />),
            exportCSVBtn: this.createCustomExportCSVButton,
            paginationShowsTotal: this.renderPaginationShowsTotal,
            prePage: <span className="prev-page-pg"></span>, // Previous page button text
            nextPage: <span className="next-page-pg"></span>, // Next page button text
            firstPage: <span className="first-page-pg"></span>, // First page button text
            lastPage: <span className="last-page-pg"></span>,

        };

        return (
            <div className={DownloadAccessibility ? "show-table-btn" : ""}>
                {/* { this.props.loading && <Loader />} */}
                < form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate >
                    <Row className="filter-row-large pt-4 ">
                        {this.state.shown &&
                            <Col md="12" lg="11" className="filter-block ">
                                <div className="d-inline-flex justify-content-start align-items-top w100 rm-domestic-filter">
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
                                            validate={(this.state.costingHead === null || this.state.costingHead.length === 0) ? [required] : []}
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
                                            validate={(this.state.plant === null || this.state.plant.length === 0) ? [] : []}
                                            required={true}
                                            handleChangeDescription={this.handlePlantChange}
                                            valueDescription={this.state.plant}
                                        />
                                    </div>
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
                                            validate={this.state.RawMaterial === null || this.state.RawMaterial.length === 0 ? [required] : []}
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
                                                this.state.RMGrade === null || this.state.RMGrade.length === 0 ? [required] : []}
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
                                    <div className="flex-fill sliderange ">
                                        <InputRange
                                            //formatLabel={value => `${value}cm`}
                                            maxValue={this.state.maxRange}
                                            minValue={0}
                                            value={this.state.value}
                                            height={2}
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
                            // ) : ("")
                        }
                        {
                            !this.props.isSimulation &&
                            <Col md="6" lg="6" className="search-user-block mb-3">
                                <div className="d-flex justify-content-end bd-highlight w100">
                                    <div>
                                        <>
                                            {this.state.shown ? (
                                                <button type="button" className="user-btn mr5 filter-btn-top" onClick={() => this.setState({ shown: !this.state.shown })}>
                                                    <img src={require("../../../assests/images/times.png")} alt="cancel-icon.jpg" /></button>
                                            ) : (
                                                <button type="button" className="user-btn mr5" onClick={() => this.setState({ shown: !this.state.shown })}>Show Filter</button>
                                            )}
                                            {BulkUploadAccessibility && (
                                                <button
                                                    type="button"
                                                    className={"user-btn mr5"}
                                                    onClick={this.bulkToggle}
                                                >
                                                    <div className={"upload"}></div>Bulk Upload
                                                </button>
                                            )}
                                            {AddAccessibility && (
                                                <button
                                                    type="button"
                                                    className={"user-btn"}
                                                    onClick={this.formToggle}
                                                >
                                                    <div className={"plus"}></div>ADD
                                                </button>
                                            )}
                                        </>
                                    </div>
                                </div>
                            </Col>
                        }
                    </Row>
                </form >
                <Row>
                    <Col>
                        <BootstrapTable
                            data={this.props.rmDataList}
                            striped={false}
                            bordered={false}
                            hover={false}
                            options={options}
                            search
                            multiColumnSearch={true}
                            // exportCSV={true}
                            //ignoreSinglePage
                            exportCSV={DownloadAccessibility}
                            csvFileName={`${RmDomestic}.csv`}
                            ref={'table'}
                            pagination>
                            {/* <TableHeaderColumn dataField="" width={50} dataAlign="center" dataFormat={this.indexFormatter}>{this.renderSerialNumber()}</TableHeaderColumn> */}
                            <TableHeaderColumn dataField="CostingHead" width={100} columnTitle={true} dataAlign="left" searchable={false} dataSort={true} dataFormat={this.costingHeadFormatter}>{this.renderCostingHead()}</TableHeaderColumn>
                            <TableHeaderColumn dataField="RawMaterial" width={100} columnTitle={true} dataAlign="left" >{this.renderRawMaterial()}</TableHeaderColumn>
                            <TableHeaderColumn dataField="RMGrade" width={70} columnTitle={true} dataAlign="left" >{this.renderRMGrade()}</TableHeaderColumn>
                            <TableHeaderColumn width={100} columnTitle={true} dataAlign="left" dataField="RMSpec" >{this.renderRMSpec()}</TableHeaderColumn>
                            <TableHeaderColumn dataField="MaterialType" width={100} columnTitle={true} dataAlign="left" >{'Material'}</TableHeaderColumn>
                            <TableHeaderColumn width={100} columnTitle={true} dataAlign="left" dataField="Category" searchable={false} >Category</TableHeaderColumn>
                            <TableHeaderColumn width={100} columnTitle={true} dataAlign="left" dataField="TechnologyName" searchable={false} >Technology</TableHeaderColumn>
                            <TableHeaderColumn width={100} columnTitle={true} dataAlign="left" dataField="Plant" searchable={false} >{'Plant'}</TableHeaderColumn>
                            <TableHeaderColumn width={100} columnTitle={true} dataAlign="left" dataField="VendorName" >Vendor</TableHeaderColumn>
                            <TableHeaderColumn width={100} columnTitle={true} dataAlign="left" dataField="UOM" searchable={false} >UOM</TableHeaderColumn>
                            <TableHeaderColumn width={100} columnTitle={true} dataAlign="left" dataField="BasicRate" searchable={false} >{this.renderBasicRate()}</TableHeaderColumn>
                            <TableHeaderColumn width={100} columnTitle={true} dataAlign="left" dataField="RMFreightCost" dataFormat={this.freightCostFormatter} searchable={false}>{this.rendorFreightRate()}</TableHeaderColumn>
                            <TableHeaderColumn width={100} columnTitle={true} dataAlign="left" dataField="RMShearingCost" dataFormat={this.shearingCostFormatter} searchable={false}>{this.renderShearingCost()}</TableHeaderColumn>
                            <TableHeaderColumn width={100} columnTitle={true} dataAlign="left" dataField="ScrapRate" searchable={false} >{this.renderScrapRate()}</TableHeaderColumn>
                            <TableHeaderColumn width={120} columnTitle={true} dataAlign="left" dataField="NetLandedCost" searchable={false} dataFormat={this.costFormatter} >{this.renderNetCost()}</TableHeaderColumn>
                            <TableHeaderColumn width={100} columnTitle={true} dataAlign="left" searchable={false} dataField="EffectiveDate" dataSort={true} dataFormat={this.effectiveDateFormatter} >{this.renderEffectiveDate()}</TableHeaderColumn>
                            {!this.props.isSimulation && <TableHeaderColumn width={100} dataAlign="right" dataField="RawMaterialId" export={false} searchable={false} isKey={true} dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>}
                            {this.props.isSimulation && <TableHeaderColumn width={100} dataAlign="right" dataField="RawMaterialId" export={false} searchable={false} hidden isKey={true} dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>}
                        </BootstrapTable>
                    </Col>
                </Row>
                {
                    isBulkUpload && (
                        <BulkUpload
                            isOpen={isBulkUpload}
                            closeDrawer={this.closeBulkUploadDrawer}
                            isEditFlag={false}
                            densityAlert={this.densityAlert}
                            fileName={"RMDomestic"}
                            isZBCVBCTemplate={true}
                            messageLabel={"RM Domestic"}
                            anchor={"right"}
                        />
                    )
                }
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
    const { rawMaterialNameSelectList, gradeSelectList, vendorListByVendorType, filterRMSelectList, rmDataList, loading } = material;
    const { initialConfiguration } = auth;
    const { plantSelectList, technologySelectList } = comman;

    return { rawMaterialNameSelectList, gradeSelectList, vendorListByVendorType, filterRMSelectList, rmDataList, loading, initialConfiguration, plantSelectList, technologySelectList }

}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    deleteRawMaterialAPI,
    getRMDomesticDataList,
    getRawMaterialNameChild,
    getGradeSelectList,
    getVendorListByVendorType,
    getRawMaterialFilterSelectList,
    getGradeFilterByRawMaterialSelectList,
    getVendorFilterByRawMaterialSelectList,
    getRawMaterialFilterByGradeSelectList,
    getVendorFilterByGradeSelectList,
    getRawMaterialFilterByVendorSelectList,
    getGradeFilterByVendorSelectList,
    getPlantSelectListByType,
    getTechnologySelectList,
})(reduxForm({
    form: 'RMDomesticListing',
    enableReinitialize: true,
})(RMDomesticListing));