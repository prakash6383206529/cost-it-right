import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { searchableSelect } from "../../layout/FormInputs";
import { Loader } from '../../common/Loader';
import { CONSTANT } from '../../../helper/AllConastant';
import {
    getInitialPlantSelectList, getInitialMachineTypeSelectList, getInitialProcessesSelectList,
    getInitialVendorWithVendorCodeSelectList,
    getMachineTypeSelectListByPlant,
    getVendorSelectListByTechnology,
    getMachineTypeSelectListByTechnology,
    getMachineTypeSelectListByVendor,
    getProcessSelectListByMachineType,
} from '../actions/Process';
import { getMachineDataList, deleteMachine, copyMachine, } from '../actions/MachineMaster';
import { getTechnologySelectList, } from '../../../actions/Common';
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';
import { toastr } from 'react-redux-toastr';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import BulkUpload from '../../massUpload/BulkUpload';
import { GridTotalFormate } from '../../common/TableGridFunctions';
import { costingHeadObj } from '../../../config/masterData';
import ConfirmComponent from '../../../helper/ConfirmComponent';

class MachineRateListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isEditFlag: false,
            tableData: [],

            costingHead: [],
            plant: [],
            technology: [],
            vendorName: [],
            processName: [],
            machineType: [],

            isBulkUpload: false,
        }
    }

    /**
    * @method componentDidMount
    * @description Called after rendering the component
    */
    componentDidMount() {
        this.props.getTechnologySelectList(() => { })
        this.props.getInitialPlantSelectList(() => { })
        this.props.getInitialVendorWithVendorCodeSelectList(() => { })
        this.props.getInitialMachineTypeSelectList(() => { })
        this.props.getInitialProcessesSelectList(() => { })
        this.getDataList()
    }

    getDataList = (costing_head = '', technology_id = '', vendor_id = '', machine_type_id = '', process_id = '', plant_id = '') => {
        const filterData = {
            costing_head: costing_head,
            technology_id: technology_id,
            vendor_id: vendor_id,
            machine_type_id: machine_type_id,
            process_id: process_id,
            plant_id: plant_id,
        }
        this.props.getMachineDataList(filterData, (res) => {
            if (res && res.status === 200) {
                let Data = res.data.DataList;
                this.setState({ tableData: Data })
            } else if (res && res.response && res.response.status === 412) {
                this.setState({ tableData: [] })
            } else {
                this.setState({ tableData: [] })
            }
        })
    }

    /**
    * @method renderListing
    * @description Used to show type of listing
    */
    renderListing = (label) => {
        const { technologySelectList, filterSelectList } = this.props;
        const temp = [];

        if (label === 'costingHead') {
            return costingHeadObj;
        }

        if (label === 'plant') {
            filterSelectList && filterSelectList.plants && filterSelectList.plants.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }

        if (label === 'technology') {
            technologySelectList && technologySelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }

        if (label === 'VendorNameList') {
            filterSelectList && filterSelectList.vendor && filterSelectList.vendor.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }

        if (label === 'ProcessNameList') {
            filterSelectList && filterSelectList.processList && filterSelectList.processList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }

        if (label === 'MachineTypeList') {
            filterSelectList && filterSelectList.machineTypes && filterSelectList.machineTypes.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }

    }

    /**
    * @method handleHeadChange
    * @description called
    */
    handleHeadChange = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ costingHead: newValue, });
        } else {
            this.setState({ costingHead: [], })
        }
    };

    /**
    * @method handlePlant
    * @description  PLANT FILTER
    */
    handlePlant = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ plant: newValue }, () => {
                const { plant } = this.state;
                this.props.getMachineTypeSelectListByPlant(plant.value, () => { })
            });
        } else {
            this.setState({ plant: [], });
        }
    }

    /**
    * @method handleTechnology
    * @description called
    */
    handleTechnology = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ technology: newValue, }, () => {
                const { technology } = this.state;
                this.props.getVendorSelectListByTechnology(technology.value, () => { })
                this.props.getMachineTypeSelectListByTechnology(technology.value, () => { })
            });
        } else {
            this.setState({ technology: [], })
        }
    };

    /**
    * @method handleVendorName
    * @description called
    */
    handleVendorName = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ vendorName: newValue, }, () => {
                const { vendorName } = this.state;
                this.props.getMachineTypeSelectListByVendor(vendorName.value, () => { })
            });
        } else {
            this.setState({ vendorName: [], })
        }
    };

    /**
    * @method handleProcessName
    * @description called
    */
    handleProcessName = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ processName: newValue });
        } else {
            this.setState({ processName: [] })
        }
    };

    /**
    * @method handleMachineType
    * @description called
    */
    handleMachineType = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ machineType: newValue }, () => {
                const { machineType } = this.state;
                this.props.getProcessSelectListByMachineType(machineType.value, () => { })
            });
        } else {
            this.setState({ machineType: [], })
        }
    };

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
    * @method copyItem
    * @description edit material type
    */
    copyItem = (Id) => {
        this.props.copyMachine(Id, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.COPY_MACHINE_SUCCESS);
                this.getDataList()
            }
        });
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
            onCancel: () => console.log("CANCEL: clicked"),
            component: () => <ConfirmComponent />,
        };
        return toastr.confirm(`${MESSAGES.MACHINE_DELETE_ALERT}`, toastrConfirmOptions);
    }

    /**
    * @method confirmDelete
    * @description confirm delete Raw Material details
    */
    confirmDelete = (ID) => {
        this.props.deleteMachine(ID, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.DELETE_MACHINE_SUCCESS);
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
                <button className="Copy All Costing mr-2" title="Copy Machine" type={'button'} onClick={() => this.copyItem(cell)} />
                {DeleteAccessibility && <button className="Delete" type={'button'} onClick={() => this.deleteItem(cell)} />}
            </>
        )
    }

    /**
    * @method costingHeadFormatter
    * @description Renders Costing head
    */
    costingHeadFormatter = (cell, row, enumObject, rowIndex) => {
        return cell ? 'Vendor Based' : 'Zero Based';
    }

    /**
    * @method plantsFormatter
    * @description Renders Costing head
    */
    plantsFormatter = (cell, row, enumObject, rowIndex) => {
        return cell === '' ? '-' : cell;
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

    renderVendorName = () => {
        return <>Vendor <br />Name </>
    }
    renderMachineNo = () => {
        return <>Machine<br /> Number </>
    }

    renderMachineType = () => {
        return <>Machine<br /> Type </>
    }

    renderMachineTonage = () => {
        return <>Machine<br /> Tonnage </>
    }

    renderProcessName = () => {
        return <>Process<br /> Name </>
    }

    renderMachineRate = () => {
        return <>Machine<br /> Rate </>
    }



    bulkToggle = () => {
        this.setState({ isBulkUpload: true })
    }

    closeBulkUploadDrawer = () => {
        this.setState({ isBulkUpload: false }, () => {
            this.getDataList()
        })
    }

    /**
    * @method filterList
    * @description Filter user listing on the basis of role and department
    */
    filterList = () => {
        const { costingHead, plant, technology, vendorName, processName, machineType } = this.state;

        const costingId = costingHead ? costingHead.value : '';
        const technologyId = technology ? technology.value : '';
        const vendorId = vendorName ? vendorName.value : '';
        const machineTypeId = machineType ? machineType.value : '';
        const processId = processName ? processName.value : '';
        const plantId = plant ? plant.value : '';

        this.getDataList(costingId, technologyId, vendorId, machineTypeId, processId, plantId)
    }

    /**
    * @method resetFilter
    * @description Reset user filter
    */
    resetFilter = () => {
        this.setState({
            costingHead: [],
            plant: [],
            technology: [],
            vendorName: [],
            processName: [],
            machineType: [],
        }, () => {
            this.props.getTechnologySelectList(() => { })
            this.props.getInitialPlantSelectList(() => { })
            this.props.getInitialVendorWithVendorCodeSelectList(() => { })
            this.props.getInitialMachineTypeSelectList(() => { })
            this.props.getInitialProcessesSelectList(() => { })
            this.getDataList()
        })

    }

    displayForm = () => {
        this.props.displayForm()
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {

    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, AddAccessibility, BulkUploadAccessibility } = this.props;
        const { isBulkUpload, } = this.state;
        const options = {
            clearSearch: true,
            noDataText: <NoContentFound title={CONSTANT.EMPTY_DATA} />,
            paginationShowsTotal: this.renderPaginationShowsTotal,
            prePage: <span className="prev-page-pg"></span>, // Previous page button text
            nextPage: <span className="next-page-pg"></span>, // Next page button text
            firstPage: <span className="first-page-pg"></span>, // First page button text
            lastPage: <span className="last-page-pg"></span>,
            paginationSize: 5,
        };

        return (
            <div>
                {this.props.loading && <Loader />}
                <form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>
                    <Row className="pt-4 filter-row-large">
                        {this.state.shown ? (
                            <Col md="12" lg="9" className="filter-block">
                                <div className="d-inline-flex justify-content-start align-items-top w100">
                                    <div className="flex-fills"><h5>{`Filter By:`}</h5></div>
                                    <div className="flex-fill">
                                        <Field
                                            name="costingHead"
                                            type="text"
                                            label=""
                                            component={searchableSelect}
                                            placeholder={'Head'}
                                            isClearable={false}
                                            options={this.renderListing('costingHead')}
                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                            //validate={(this.state.costingHead == null || this.state.costingHead.length == 0) ? [required] : []}
                                            //required={true}
                                            handleChangeDescription={this.handleHeadChange}
                                            valueDescription={this.state.costingHead}
                                        />
                                    </div>
                                    <div className="flex-fill">
                                        <Field
                                            name="plant"
                                            type="text"
                                            label={''}
                                            component={searchableSelect}
                                            placeholder={'Plant'}
                                            isClearable={false}
                                            options={this.renderListing('plant')}
                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                            //validate={(this.state.plant == null || this.state.plant.length == 0) ? [required] : []}
                                            //required={true}
                                            handleChangeDescription={this.handlePlant}
                                            valueDescription={this.state.plant}
                                        />
                                    </div>
                                    <div className="flex-fill">
                                        <Field
                                            name="technology"
                                            type="text"
                                            label=""
                                            component={searchableSelect}
                                            placeholder={'Technology'}
                                            isClearable={false}
                                            options={this.renderListing('technology')}
                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                            //validate={(this.state.technology == null || this.state.technology.length == 0) ? [required] : []}
                                            //required={true}
                                            handleChangeDescription={this.handleTechnology}
                                            valueDescription={this.state.technology}
                                        />
                                    </div>
                                    <div className="flex-fill">
                                        <Field
                                            name="VendorName"
                                            type="text"
                                            label={''}
                                            component={searchableSelect}
                                            placeholder={'Vendor'}
                                            isClearable={false}
                                            options={this.renderListing('VendorNameList')}
                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                            //validate={(this.state.vendorName == null || this.state.vendorName.length == 0) ? [required] : []}
                                            //required={true}
                                            handleChangeDescription={this.handleVendorName}
                                            valueDescription={this.state.vendorName}
                                            disabled={false}
                                            className="fullinput-icon"
                                        />
                                    </div>
                                    <div className="flex-fill">
                                        <Field
                                            name="MachineType"
                                            type="text"
                                            label=''
                                            component={searchableSelect}
                                            placeholder={'Machine'}
                                            isClearable={false}
                                            options={this.renderListing('MachineTypeList')}
                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                            //validate={(this.state.machineType == null || this.state.machineType.length == 0) ? [required] : []}
                                            //required={true}
                                            handleChangeDescription={this.handleMachineType}
                                            valueDescription={this.state.machineType}
                                            disabled={false}
                                        />
                                    </div>
                                    <div className="flex-fill">
                                        <Field
                                            name="ProcessName"
                                            type="text"
                                            label=""
                                            component={searchableSelect}
                                            placeholder={'Process'}
                                            isClearable={false}
                                            options={this.renderListing('ProcessNameList')}
                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                            //validate={(this.state.processName == null || this.state.processName.length == 0) ? [required] : []}
                                            //required={true}
                                            handleChangeDescription={this.handleProcessName}
                                            valueDescription={this.state.processName}
                                            disabled={false}
                                        />
                                    </div>
                                    <div className="flex-fill w-180">
                                        <button
                                            type="button"
                                            //disabled={pristine || submitting}
                                            onClick={this.resetFilter}
                                            className="reset mr10"
                                        >
                                            {'Reset'}
                                        </button>

                                        <button
                                            type="button"
                                            //disabled={pristine || submitting}
                                            onClick={this.filterList}
                                            className="apply"
                                        >
                                            {'Apply'}
                                        </button>
                                    </div>
                                </div>
                            </Col>
                        ) : ("")}
                        <Col md="6" lg="6" className="search-user-block pl-0 mb-3">
                            <div className="d-flex justify-content-end bd-highlight w100">
                                <div>
                                    {this.state.shown ? (
                                        <button type="button" className="user-btn mr5 filter-btn-top" onClick={() => this.setState({ shown: !this.state.shown })}>
                                            <img src={require("../../../assests/images/times.png")} alt="cancel-icon.jpg" /></button>
                                    ) : (
                                            <button type="button" className="user-btn mr5" onClick={() => this.setState({ shown: !this.state.shown })}>Show Filter</button>
                                        )}
                                    {BulkUploadAccessibility && <button
                                        type="button"
                                        className={'user-btn mr5'}
                                        onClick={this.bulkToggle}>
                                        <div className={'upload'}></div>Bulk Upload</button>}
                                    {AddAccessibility && <button
                                        type="button"
                                        className={'user-btn'}
                                        onClick={this.displayForm}>
                                        <div className={'plus'}></div>ADD</button>}

                                </div>
                            </div>
                        </Col>
                    </Row>

                </form>
                <Row>
                    <Col>
                        <BootstrapTable
                            data={this.props.machineDatalist}
                            striped={false}
                            hover={false}
                            bordered={false}
                            options={options}
                            search
                            // exportCSV
                            //ignoreSinglePage
                            ref={'table'}
                            pagination>
                            <TableHeaderColumn dataField="IsVendor" searchable={false} width={100} columnTitle={true} dataAlign="left" dataSort={true} dataFormat={this.costingHeadFormatter}>{this.renderCostingHead()}</TableHeaderColumn>
                            <TableHeaderColumn dataField="Technologies" searchable={false} width={100} columnTitle={true} dataAlign="left" dataSort={true} >{'Technology'}</TableHeaderColumn>
                            <TableHeaderColumn dataField="VendorName" width={100} columnTitle={true} dataAlign="left" dataSort={true} >{this.renderVendorName()}</TableHeaderColumn>
                            <TableHeaderColumn dataField="Plants" searchable={false} width={100} columnTitle={true} dataAlign="left" dataSort={true} dataFormat={this.plantsFormatter} >{'Plant'}</TableHeaderColumn>
                            <TableHeaderColumn dataField="MachineNumber" searchable={true} width={150} columnTitle={true} dataAlign="left" dataSort={true} >{this.renderMachineNo()}</TableHeaderColumn>
                            <TableHeaderColumn dataField="MachineTypeName" width={120} columnTitle={true} dataAlign="left" dataSort={true} >{this.renderMachineType()}</TableHeaderColumn>
                            <TableHeaderColumn dataField="MachineTonnage" searchable={false} width={150} columnTitle={true} dataAlign="left" dataSort={true} >{this.renderMachineTonage()}</TableHeaderColumn>
                            <TableHeaderColumn dataField="ProcessName" width={130} columnTitle={true} dataAlign="left" dataSort={true} >{this.renderProcessName()}</TableHeaderColumn>
                            <TableHeaderColumn dataField="MachineRate" searchable={false} width={110} columnTitle={true} dataAlign="left" dataSort={true} >{this.renderMachineRate()}</TableHeaderColumn>
                            <TableHeaderColumn width={150} dataField="MachineId" searchable={false} export={false} isKey={true} dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>
                        </BootstrapTable>
                    </Col>
                </Row>
                {isBulkUpload && <BulkUpload
                    isOpen={isBulkUpload}
                    closeDrawer={this.closeBulkUploadDrawer}
                    isEditFlag={false}
                    fileName={'Machine'}
                    isZBCVBCTemplate={true}
                    isMachineMoreTemplate={true}
                    messageLabel={'Machine'}
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
function mapStateToProps(state) {
    const { comman, process, machine, } = state;
    const { technologySelectList, } = comman;
    const { filterSelectList } = process;
    const { machineDatalist } = machine
    return { technologySelectList, filterSelectList, machineDatalist }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    getTechnologySelectList,
    getInitialPlantSelectList,
    getInitialVendorWithVendorCodeSelectList,
    getInitialMachineTypeSelectList,
    getInitialProcessesSelectList,
    getMachineDataList,
    deleteMachine,
    copyMachine,
    getMachineTypeSelectListByPlant,
    getVendorSelectListByTechnology,
    getMachineTypeSelectListByTechnology,
    getMachineTypeSelectListByVendor,
    getProcessSelectListByMachineType,
})(reduxForm({
    form: 'MachineRateListing',
    enableReinitialize: true,
})(MachineRateListing));