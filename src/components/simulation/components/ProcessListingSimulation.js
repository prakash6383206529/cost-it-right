import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { CONSTANT } from '../../../helper/AllConastant'
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';
import { toastr } from 'react-redux-toastr';
import { GridTotalFormate } from '../../common/TableGridFunctions';
import ConfirmComponent from '../../../helper/ConfirmComponent';
import LoaderCustom from '../../common/LoaderCustom'
import moment from 'moment'
import { ProcessMaster } from '../../../config/constants'
import ReactExport from 'react-export-excel';
import { PROCESSLISTING_DOWNLOAD_EXCEl } from '../../../config/masterData'
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { getCombinedProcessList } from '../../simulation/actions/Simulation'
import { Row, Col, } from 'reactstrap';

const gridOptions = {};

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

export function ProcessListingSimulation(props) {

    const {  handleSubmit } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    })

    const [isOpenProcessDrawer, setIsOpenProcessDrawer] = useState(false)
    const [isEditFlag, setIsEditFlag] = useState(false)
    const [Id, setId] = useState('')
    const [plant, setPlant] = useState([])
    const [machine, setMachine] = useState([])
    const [gridApi, setGridApi] = useState(null)
    const [gridColumnApi, setGridColumnApi] = useState(null)
    const [shown, setShown] = useState(false)

    const dispatch = useDispatch()
    const processCostingList = useSelector(state => state.simulation.combinedProcessList)

    useEffect(() => {

        let obj = {
            technologyId: props?.technology,
            vendorId: props?.vendorId
        }
        dispatch(getCombinedProcessList(obj, () => { }))

    }, [])



    /**
    * @method handlePlant
    * @description  PLANT FILTER
    */
    const handlePlant = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            setPlant(newValue)
        } else {
            setPlant([])
            // this.props.getInitialMachineSelectList(() => { })
        }
    }

    /**
    * @method handleMachineType
    * @description called
    */
    const handleMachineType = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            setMachine(newValue)
        } else {
            setMachine([])
            // this.props.getInitialPlantSelectList(() => { })
        }
    };

    /**
    * @method editItemDetails
    * @description EDIT ITEM
    */
    const editItemDetails = (Id) => {
        setIsOpenProcessDrawer(true)
        setIsEditFlag(true)
        setId(Id)
    }

    /**
    * @method deleteItem
    * @description CONFIRM DELETE ITEM
    */
    const deleteItem = (Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                confirmDelete(Id);
            },
            onCancel: () => { },
            component: () => <ConfirmComponent />,
        };
        return toastr.confirm(`${MESSAGES.PROCESS_DELETE_ALERT}`, toastrConfirmOptions);
    }

    /**
    * @method confirmDelete
    * @description DELETE PROCESS
    */
    const confirmDelete = (ID) => {
        // this.props.deleteProcess(ID, (res) => {
        //     if (res.data.Result === true) {
        //         toastr.success(MESSAGES.PROCESS_DELETE_SUCCESSFULLY);
        //         this.getDataList()
        //     }
        // });
    }

    /**
    * @method renderPaginationShowsTotal
    * @description Pagination
    */
    const renderPaginationShowsTotal = (start, to, total) => {
        return <GridTotalFormate start={start} to={to} total={total} />
    }

    /**
    * @method buttonFormatter
    * @description Renders buttons
    */
    const buttonFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;

        const { EditAccessibility, DeleteAccessibility } = props;
        return (
            <>
                {EditAccessibility && <button className="Edit mr-2" type={'button'} onClick={() => editItemDetails(cellValue, rowData)} />}
                {DeleteAccessibility && <button className="Delete" type={'button'} onClick={() => deleteItem(cellValue)} />}
            </>
        )
    };

    /**
    * @method costingHeadFormatter
    * @description Renders Costing head
    */
    const costingHeadFormatter = (cell, row, enumObject, rowIndex) => {
        return cell ? 'VBC' : 'ZBC';
    }

    const getDataList = (plant_id = '', machine_id = '') => {
        const filterData = {
            plant_id: plant_id,
            machine_id: machine_id,
        }
        // this.props.getProcessDataList(filterData, (res) => {
        //     if (res && res.status === 200) {
        //         let Data = res.data.DataList
        //         this.setState({ tableData: Data })
        //     } else if (res && res.response && res.response.status === 412) {
        //         this.setState({ tableData: [] })
        //     } else {
        //         this.setState({ tableData: [] })
        //     }
        // })
    }

    /**
    * @method effectiveDateFormatter
    * @description Renders buttons
    */
    const effectiveDateFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cellValue != null ? moment(cellValue).format('DD/MM/YYYY') : '';
    }

    /**
    * @method renderListing
    * @description Used to show type of listing
    */
    const renderListing = (label) => {
        const { filterSelectList } = this.props
        const temp = []

        if (label === 'plant') {
            filterSelectList &&
                filterSelectList.plants &&
                filterSelectList.plants.map((item) => {
                    if (item.Value === '0') return false
                    temp.push({ label: item.Text, value: item.Value })
                    return null
                })
            return temp
        }

        if (label === 'Machine') {
            filterSelectList &&
                filterSelectList.machine &&
                filterSelectList.machine.map((item) => {
                    if (item.Value === '0') return false
                    temp.push({ label: item.Text, value: item.Value })
                    return null
                })
            return temp
        }
    }

    /**
    * @method filterList
    * @description GET FILTER DATALIST
    */
    const filterList = () => {
        // const { plant, machine } = this.state
        const plantId = plant ? plant.value : ''
        const machineId = machine ? machine.value : ''

        getDataList(plantId, machineId)
    }

    /**
     * @method resetFilter
     * @description Reset user filter
     */
    const resetFilter = () => {
        setPlant([])
        setMachine([])
        // this.setState(
        //     {
        //         plant: [],
        //         machine: [],
        //     },
        //     () => {
        //         // this.props.getInitialPlantSelectList(() => { })
        //         // this.props.getInitialMachineSelectList(() => { })
        //         this.getDataList()
        //     },
        // )
    }

    const processToggler = () => {
        setIsOpenProcessDrawer(true)
        setIsEditFlag(false)
        setId('')
    }

    const closeProcessDrawer = (e = '') => {
        setIsOpenProcessDrawer(false)

        // this.setState({ isOpenProcessDrawer: false }, () => {
        //     this.getDataList()
        // })
    }

    /**
     * @method onSubmit
     * @description Used to Submit the form
     */
    const onSubmit = (values) => { }

    const onBtExport = () => {
        let tempArr = []
        const data = gridApi && gridApi.getModel().rowsToDisplay
        data && data.map((item => {
            tempArr.push(item.data)
        }))
        return this.returnExcelColumn(PROCESSLISTING_DOWNLOAD_EXCEl, tempArr)
    };

    const returnExcelColumn = (data = [], TempData) => {
        let temp = []
        temp = TempData.map((item) => {
            if (item.IsVendor === true) {
                item.IsVendor = 'Vendor Based'
            } else if (item.IsVendor === false) {
                item.IsVendor = 'Zero Based'
            } else if (item.VendorName === '-') {
                item.VendorName = ' '
            } else {
                return false
            }
            return item
        })
        return (<ExcelSheet data={temp} name={`${ProcessMaster}`}>
            {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)
            }
        </ExcelSheet>);
    }

    const onGridReady = (params) => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
        params.api.paginationGoToPage(0);
        window.screen.width >= 1366 && params.api.sizeColumnsToFit()
        var allColumnIds = [];
        params.columnApi.getAllColumns().forEach(function (column) {
            allColumnIds.push(column.colId);
        });

        // window.screen.width <= 1366 ? params.columnApi.autoSizeColumns(allColumnIds) : params.api.sizeColumnsToFit()
    };

    const onPageSizeChanged = (newPageSize) => {
        var value = document.getElementById('page-size').value;
        gridApi.paginationSetPageSize(Number(value));
    };

    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }

    const resetState = () => {
        gridOptions.columnApi.resetColumnState();
        gridOptions.api.setFilterModel(null);
    }

    const statusFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        // CHANGE IN STATUS IN AFTER KAMAL SIR API
        return <div className={row.Status}>{row.DisplayStatus}</div>
    }

    const options = {
        clearSearch: true,
        noDataText: (props.processList === undefined ? <LoaderCustom /> : <NoContentFound title={CONSTANT.EMPTY_DATA} />),
        paginationShowsTotal: renderPaginationShowsTotal,
        prePage: <span className="prev-page-pg"></span>, // Previous page button text
        nextPage: <span className="next-page-pg"></span>, // Next page button text
        firstPage: <span className="first-page-pg"></span>, // First page button text
        lastPage: <span className="last-page-pg"></span>,

    }

    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: true,

    };

    const frameworkComponents = {
        totalValueRenderer: buttonFormatter,
        costingHeadRenderer: costingHeadFormatter,
        customLoadingOverlay: LoaderCustom,
        customNoRowsOverlay: NoContentFound,
        // hyphenFormatter: hyphenFormatter,
        effectiveDateFormatter: effectiveDateFormatter,
        statusFormatter: statusFormatter
    };

    return (
        <div className={`ag-grid-react ${props.DownloadAccessibility ? "show-table-btn" : ""}`}>
            {/* {this.props.loading && <Loader />} */}
            < form onSubmit={handleSubmit(onSubmit)} noValidate >
                <Row className="pt-4">
                    {shown && (
                        <Col md="10" className="filter-block">
                            <div className="d-inline-flex justify-content-start align-items-top w100">
                                <div className="flex-fills"><h5>{`Filter By:`}</h5></div>
                                <div className="flex-fill">
                                    {/* <Field
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
                /> */}
                                </div>
                                {/* <div className="flex-fill">
                                    <Field
                                        name="MachineType"
                                        type="text"
                                        label=''
                                        component={searchableSelect}
                                        placeholder={'Machine'}
                                        isClearable={false}
                                        options={this.renderListing('Machine')}
                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                        //validate={(this.state.machine == null || this.state.machine.length == 0) ? [required] : []}
                                        //required={true}
                                        handleChangeDescription={this.handleMachineType}
                                        valueDescription={this.state.machine}
                                        disabled={false}
                                    />
                                </div> */}


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
                                        onClick={filterList}
                                        className="apply mr5"
                                    >
                                        {'Apply'}
                                    </button>
                                </div>
                            </div>
                        </Col>
                    )}
                    <Col md="6" className="search-user-block mb-3">
                        <div className="d-flex justify-content-end bd-highlight w100">
                            <div>
                                {shown ? (
                                    <button type="button" className="user-btn mr5 filter-btn-top" onClick={() => setShown(!shown)}>
                                        <div className="cancel-icon-white"></div></button>
                                ) : (
                                    ''
                                    // <button type="button" className="user-btn mr5" onClick={() => this.setState({ shown: !this.state.shown })}>Show Filter</button>
                                )}
                                {props.AddAccessibility && <button
                                    type="button"
                                    className={'user-btn mr5'}
                                    title="Add"
                                    onClick={processToggler}>
                                    <div className={'plus mr-0'}></div></button>}
                                {
                                    props.DownloadAccessibility &&
                                    <>
                                        <ExcelFile filename={ProcessMaster} fileExtension={'.xls'} element={<button type="button" className={'user-btn mr5'} title="Download"><div className="download mr-0"></div></button>}>
                                            {onBtExport()}
                                        </ExcelFile>
                                    </>
                                    //   <button type="button" className={"user-btn mr5"} onClick={this.onBtExport}><div className={"download"} ></div>Download</button>
                                }

                                <button type="button" className="user-btn" title="Reset Grid" onClick={() => resetState()}>
                                    <div className="refresh mr-0"></div>
                                </button>

                            </div>
                        </div>
                    </Col>
                </Row>

            </form>
            <Row>
                <Col>


                    <div className="ag-grid-wrapper" style={{ width: '100%', height: '100%' }}>
                        <div className="ag-grid-header">
                            <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" onChange={(e) => onFilterTextBoxChanged(e)} />
                        </div>
                        <div
                            className="ag-theme-material"
                            // style={{ height: '100%', width: '100%' }}
                        >
                            <AgGridReact
                                defaultColDef={defaultColDef}
                                domLayout='autoHeight'
                                floatingFilter={true}
                                rowData={processCostingList}
                                pagination={true}
                                paginationPageSize={10}
                                onGridReady={onGridReady}
                                gridOptions={gridOptions}
                                loadingOverlayComponent={'customLoadingOverlay'}
                                noRowsOverlayComponent={'customNoRowsOverlay'}
                                noRowsOverlayComponentParams={{
                                    title: CONSTANT.EMPTY_DATA,
                                }}
                                frameworkComponents={frameworkComponents}
                            >
                                <AgGridColumn field="TechnologyName" editable='false' headerName="Technology" minWidth={190}></AgGridColumn>
                                <AgGridColumn field="PlantName" editable='false' headerName="Plant" minWidth={190}></AgGridColumn>
                                <AgGridColumn suppressSizeToFit="true" editable='false' field="ConversionCost" headerName="Net CC" minWidth={190}></AgGridColumn>
                                <AgGridColumn field="RemainingTotal" editable='false' headerName="Remaining Fields Total" minWidth={190}></AgGridColumn>
                                <AgGridColumn suppressSizeToFit="true" field="TotalCost" headerName="Total" minWidth={190}></AgGridColumn>
                                <AgGridColumn field="EffectiveDate" headerName="Effective Date" editable='false' minWidth={190} cellRenderer='effectiveDateFormatter'></AgGridColumn>
                                <AgGridColumn field="CostingId" headerName="CostingId" hide></AgGridColumn>

                            </AgGridReact>
                            <div className="paging-container d-inline-block float-right">
                                <select className="form-control paging-dropdown" onChange={(e) => onPageSizeChanged(e.target.value)} id="page-size">
                                    <option value="10" selected={true}>10</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                            </div>
                        </div>
                    </div>

                </Col>
            </Row>

        </div>
    );
}