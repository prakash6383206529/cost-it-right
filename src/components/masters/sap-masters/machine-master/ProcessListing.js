import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { searchableSelect } from "../../../layout/FormInputs";
import { Loader } from '../../../common/Loader';
import { CONSTANT } from '../../../../helper/AllConastant';
import {
    getInitialPlantSelectList, getInitialMachineSelectList, deleteProcess,
    getProcessDataList,
    getMachineSelectListByPlant,
    getPlantSelectListByMachine,
} from '../../../../actions/master/Process';
import NoContentFound from '../../../common/NoContentFound';
import { MESSAGES } from '../../../../config/message';
import { toastr } from 'react-redux-toastr';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import AddProcessDrawer from './AddProcessDrawer';
import { GridTotalFormate } from '../../../common/TableGridFunctions';

class ProcessListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpenProcessDrawer: false,
            isEditFlag: false,
            Id: '',
            tableData: [],

            plant: [],
            machine: [],

        }
    }

    /**
    * @method componentDidMount
    * @description Called after rendering the component
    */
    componentDidMount() {
        this.props.getInitialPlantSelectList(() => { })
        this.props.getInitialMachineSelectList(() => { })
        this.getDataList()
    }

    getDataList = (plant_id = '', machine_id = '') => {
        const filterData = {
            plant_id: plant_id,
            machine_id: machine_id,
        }
        this.props.getProcessDataList(filterData, (res) => {
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
    * @method handlePlant
    * @description  PLANT FILTER
    */
    handlePlant = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ plant: newValue }, () => {
                const { plant } = this.state;
                this.props.getMachineSelectListByPlant(plant.value, () => { })
            });
        } else {
            this.setState({ plant: [], });
            this.props.getInitialMachineSelectList(() => { })
        }
    }

    /**
    * @method handleMachineType
    * @description called
    */
    handleMachineType = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ machine: newValue }, () => {
                const { machine } = this.state;
                this.props.getPlantSelectListByMachine(machine.value, () => { })
            });
        } else {
            this.setState({ machine: [], })
            this.props.getInitialPlantSelectList(() => { })
        }
    };

    /**
    * @method editItemDetails
    * @description EDIT ITEM
    */
    editItemDetails = (Id) => {
        this.setState({ isOpenProcessDrawer: true, isEditFlag: true, Id: Id, })
    }

    /**
    * @method deleteItem
    * @description CONFIRM DELETE ITEM
    */
    deleteItem = (Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDelete(Id)
            },
            onCancel: () => console.log('CANCEL: clicked')
        };
        return toastr.confirm(`${MESSAGES.PROCESS_DELETE_ALERT}`, toastrConfirmOptions);
    }

    /**
    * @method confirmDelete
    * @description DELETE PROCESS
    */
    confirmDelete = (ID) => {
        this.props.deleteProcess(ID, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.PROCESS_DELETE_SUCCESSFULLY);
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
                {EditAccessibility && <button className="Edit mr5" type={'button'} onClick={() => this.editItemDetails(cell)} />}
                {DeleteAccessibility && <button className="Delete" type={'button'} onClick={() => this.deleteItem(cell)} />}
            </>
        )
    }

    /**
    * @method costingHeadFormatter
    * @description Renders Costing head
    */
    costingHeadFormatter = (cell, row, enumObject, rowIndex) => {
        return cell ? 'VBC' : 'ZBC';
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


    /**
    * @method renderListing
    * @description Used to show type of listing
    */
    renderListing = (label) => {
        const { filterSelectList } = this.props;
        const temp = [];

        if (label === 'plant') {
            filterSelectList && filterSelectList.plants && filterSelectList.plants.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }

        if (label === 'Machine') {
            filterSelectList && filterSelectList.machine && filterSelectList.machine.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }
    }

    /**
    * @method filterList
    * @description GET FILTER DATALIST
    */
    filterList = () => {
        const { plant, machine } = this.state;
        const plantId = plant ? plant.value : '';
        const machineId = machine ? machine.value : '';

        this.getDataList(plantId, machineId)
    }

    /**
    * @method resetFilter
    * @description Reset user filter
    */
    resetFilter = () => {
        this.setState({
            plant: [],
            machine: [],
        }, () => {
            this.props.getInitialPlantSelectList(() => { })
            this.props.getInitialMachineSelectList(() => { })
            this.getDataList()
        })

    }

    processToggler = () => {
        this.setState({ isOpenProcessDrawer: true })
    }

    closeProcessDrawer = (e = '') => {
        this.setState({ isOpenProcessDrawer: false }, () => {
            this.getDataList()
        })
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
        const { handleSubmit, AddAccessibility } = this.props;
        const { isOpenProcessDrawer, isEditFlag } = this.state;
        const options = {
            clearSearch: true,
            noDataText: <NoContentFound title={CONSTANT.EMPTY_DATA} />,
            paginationShowsTotal: this.renderPaginationShowsTotal,
            paginationSize: 5,
        };

        return (
            <div>
                {this.props.loading && <Loader />}
                <form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>
                    <Row className="pt-30">
                        <Col md="10" className="filter-block">
                            <div className="d-inline-flex justify-content-start align-items-top w100">
                                <div className="flex-fills"><h5>{`Filter By:`}</h5></div>
                                <div className="flex-fill">
                                    <Field
                                        name="plant"
                                        type="text"
                                        label={''}
                                        component={searchableSelect}
                                        placeholder={'--Plant--'}
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
                                        name="MachineType"
                                        type="text"
                                        label=''
                                        component={searchableSelect}
                                        placeholder={'-Machine-'}
                                        isClearable={false}
                                        options={this.renderListing('Machine')}
                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                        //validate={(this.state.machine == null || this.state.machine.length == 0) ? [required] : []}
                                        //required={true}
                                        handleChangeDescription={this.handleMachineType}
                                        valueDescription={this.state.machine}
                                        disabled={false}
                                    />
                                </div>


                                <div className="flex-fill">
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
                                        className="apply mr5"
                                    >
                                        {'Apply'}
                                    </button>
                                </div>
                            </div>
                        </Col>
                        <Col md="2" className="search-user-block">
                            <div className="d-flex justify-content-end bd-highlight w100">
                                <div>
                                    {AddAccessibility && <button
                                        type="button"
                                        className={'user-btn'}
                                        onClick={this.processToggler}>
                                        <div className={'plus'}></div>ADD</button>}
                                </div>
                            </div>
                        </Col>
                    </Row>

                </form>
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
                            ignoreSinglePage
                            ref={'table'}
                            pagination>
                            <TableHeaderColumn dataField="ProcessName" width={100} columnTitle={true} dataAlign="center" dataSort={true} >{'Process Name'}</TableHeaderColumn>
                            <TableHeaderColumn dataField="ProcessCode" width={100} columnTitle={true} dataAlign="center" dataSort={true} >{'Process Code'}</TableHeaderColumn>
                            <TableHeaderColumn dataField="Plants" width={100} columnTitle={true} dataAlign="center" dataSort={true} >{'Plant'}</TableHeaderColumn>
                            <TableHeaderColumn dataField="Machines" width={100} columnTitle={true} dataAlign="center" dataSort={true} >{'Machine'}</TableHeaderColumn>
                            <TableHeaderColumn width={100} dataField="ProcessId" export={false} isKey={true} dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>
                        </BootstrapTable>
                    </Col>
                </Row>
                {isOpenProcessDrawer && <AddProcessDrawer
                    isOpen={isOpenProcessDrawer}
                    closeDrawer={this.closeProcessDrawer}
                    isEditFlag={isEditFlag}
                    isMachineShow={true}
                    ID={this.state.Id}
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
function mapStateToProps({ process }) {
    const { filterSelectList } = process;
    return { filterSelectList }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    getInitialPlantSelectList,
    getInitialMachineSelectList,
    deleteProcess,
    getProcessDataList,
    getMachineSelectListByPlant,
    getPlantSelectListByMachine,
})(reduxForm({
    form: 'ProcessListing',
    enableReinitialize: true,
})(ProcessListing));