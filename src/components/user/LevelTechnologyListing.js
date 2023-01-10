import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col } from 'reactstrap';
import { getAllLevelMappingAPI, deleteUserLevelAPI, getSimulationLevelDataList, getMasterLevelDataList } from '../../actions/auth/AuthActions';
import Toaster from '../common/Toaster';
import { MESSAGES } from '../../config/message';
import { EMPTY_DATA } from '../../config/constants';
import NoContentFound from '../common/NoContentFound';
import LoaderCustom from '../common/LoaderCustom';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { getConfigurationKey } from '../../helper/auth';
import PopupMsgWrapper from '../common/PopupMsgWrapper';
import { PaginationWrapper } from '../common/commonPagination';

const gridOptions = {};
const defaultPageSize = 5;
class LevelTechnologyListing extends Component {
	constructor(props) {
		super(props);
		this.agGrid1 = React.createRef();
		this.agGrid2 = React.createRef();
		this.agGrid3 = React.createRef();
		this.state = {
			isEditFlag: false,
			tableData: [],
			gridApi: null,
			gridColumnApi: null,
			rowData: null,
			sideBar: { toolPanels: ['columns'] },
			showData: false,
			showPopup: false,
			deletedId: '',
			isLoder: false

		}
	}

	componentDidMount() {
		this.getLevelsListData();
		this.getSimulationDataList();
		this.getMasterDataList()
		this.props.onRef(this);
	}

	getLevelsListData = () => {
		this.setState({ isLoader: true })
		this.props.getAllLevelMappingAPI(res => {
			this.setState({ isLoader: false })
			if (res.status === 204 && res.data === '') {
				this.setState({ tableData: [], })
			} else if (res && res.data && res.data.DataList) {
				let Data = res.data.DataList;
				this.setState({
					tableData: Data,
				})
			} else {

			}
		});
	}

	getSimulationDataList = () => {
		this.setState({ isLoader: true })
		this.props.getSimulationLevelDataList(res => {
			this.setState({ isLoader: false })
		})
	}
	getMasterDataList = () => {
		this.setState({ isLoader: true })
		this.props.getMasterLevelDataList(res => {
			this.setState({ isLoader: false })
		})
	}

	componentDidUpdate(prevProps) {
		if (this.props.updateApi !== prevProps.updateApi) {

			if (this.props.cancelButton) {
				return
			} else {
				this.getUpdatedData()
			}
		}
	}

	/**
	* @method getUpdatedData
	* @description get updated data after updatesuccess
	*/
	getUpdatedData = () => {
		this.getLevelsListData()
		this.getSimulationDataList()
		this.getMasterDataList()
	}

	/**
	 * @method editItemDetails
	 * @description confirm edit item
	 */
	editItemDetails = (Id, levelType) => {
		this.props.getLevelMappingDetail(Id, levelType)
	}

	/**
	* @method deleteItem
	* @description confirm delete level
	*/
	deleteItem = (Id) => {
		this.setState({ showPopup: true, deletedId: Id })
	}

	/**
	* @method confirmDeleteItem
	* @description confirm delete level item
	*/
	confirmDeleteItem = (LevelId) => {
		this.props.deleteUserLevelAPI(LevelId, (res) => {
			if (res.data.Result === true) {
				Toaster.success(MESSAGES.DELETE_LEVEL_SUCCESSFULLY);
				this.getUpdatedData()
			}
		});
		this.setState({ showPopup: false })
	}
	onPopupConfirm = () => {
		this.confirmDeleteItem(this.state.deletedId);

	}
	closePopUp = () => {
		this.setState({ showPopup: false })
	}
	buttonFormatter = (props) => {
		const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;

		const { EditAccessibility } = this.props;
		return (
			<>
				{EditAccessibility && <button title="Edit" type={'button'} className="Edit " onClick={() => this.editItemDetails(cellValue, 'Costing')} />}
				{/* {DeleteAccessibility && <button type={'button'} className="Delete" onClick={() => this.deleteItem(cell)} />} */}
			</>
		)
	}


	/**
	* @method simulationButtonFormatter
	* @description Renders buttons
	*/
	simulationButtonFormatter = (props) => {
		const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;


		const { EditAccessibility } = this.props;
		return (
			<>
				{EditAccessibility && <button title="Edit" type={'button'} className="Edit " onClick={() => this.editItemDetails(cellValue, 'Simulation')} />}
				{/* {DeleteAccessibility && <button type={'button'} className="Delete" onClick={() => this.deleteItem(cell)} />} */}
			</>
		)
	}
	/**
	* @method masterButtonFormatter
	* @description Renders buttons
	*/
	masterButtonFormatter = (props) => {
		const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;


		const { EditAccessibility } = this.props;
		return (
			<>
				{EditAccessibility && <button title={"Edit"} type={'button'} className="Edit " onClick={() => this.editItemDetails(cellValue, 'Master')} />}
				{/* {DeleteAccessibility && <button type={'button'} className="Delete" onClick={() => this.deleteItem(cell)} />} */}
			</>
		)
	}

	onGridReady = (params) => {
		this.gridApi = params.api;
		this.gridApi.sizeColumnsToFit();
		this.setState({ gridApi: params.api, gridColumnApi: params.columnApi })
		params.api.paginationGoToPage(0);
	};

	levelMappingFilterHandler(e) {
		this.agGrid1?.current.api.setQuickFilter(e.target.value);
	}

	simulationFilterHandler(e) {
		this.agGrid2?.current.api.setQuickFilter(e.target.value);
	}

	masterFilterHandler(e) {
		this.agGrid3?.current.api.setQuickFilter(e.target.value);
	}

	levelMappingResetState() {
		this.agGrid1?.current?.columnApi?.resetColumnState();
		this.agGrid1?.current?.api.setFilterModel(null)
	}
	simulationResetState() {
		this.agGrid2?.current?.columnApi?.resetColumnState();
		this.agGrid2?.current?.api.setFilterModel(null)
	}
	masterResetState() {
		this.agGrid3?.current?.columnApi?.resetColumnState();
		this.agGrid3?.current?.api.setFilterModel(null)
	}

	levelMappingPagination = (newPageSize) => {
		this.agGrid1?.current.api.paginationSetPageSize(Number(newPageSize))
	};

	simulationPagination = (newPageSize) => {
		this.agGrid2?.current.api.paginationSetPageSize(Number(newPageSize))
	};

	masterPagination = (newPageSize) => {
		this.agGrid3?.current.api.paginationSetPageSize(Number(newPageSize))
	};


	/**
	* @method render
	* @description Renders the component
	*/
	render() {
		const { AddAccessibility } = this.props;
		const defaultColDef = {
			resizable: true,
			filter: true,
			sortable: false,

		};

		const frameworkComponents = {
			totalValueRenderer: this.buttonFormatter,
			customNoRowsOverlay: NoContentFound,
			simulationButtonFormatter: this.simulationButtonFormatter,
			masterButtonFormatter: this.masterButtonFormatter
		};

		return (
			<>
				<div className='p-relative'>
					{this.state.isLoader && <LoaderCustom />}
					<Row className="levellisting-page">
						<Col md="12">
							<h2 className="manage-level-heading">{`Level Mapping`}</h2>
						</Col>
					</Row>
					<Row className="levellisting-page">
						<Col md="6" className=""></Col>
						<Col md="6" className="text-right search-user-block mb-3">
							{AddAccessibility && <button
								type="button"
								className={'user-btn mr5'}
								title="Add"
								onClick={this.props.mappingToggler}>
								<div className={'plus mr-0'}></div>
							</button>}
							<button type="button" className="user-btn" title="Reset Grid" onClick={() => this.levelMappingResetState()}>
								<div className="refresh mr-0"></div>
							</button>
						</Col>
					</Row>
					<Row className="levellisting-page">
						<Col className="level-table" md="12">
							<div className={`ag-grid-wrapper height-width-wrapper ${this.state.tableData && this.state.tableData?.length <= 0 ? "overlay-contain" : ""}`}>
								<div className="ag-grid-header">
									<input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" autoComplete={'off'} onChange={(e) => this.levelMappingFilterHandler(e)} />
								</div>
								<div className={`ag-theme-material ${this.state.isLoader && "max-loader-height"}`}>
									<AgGridReact
										defaultColDef={defaultColDef}
										floatingFilter={true}
										domLayout='autoHeight'
										// columnDefs={c}
										rowData={this.state.tableData}
										pagination={true}
										ref={this.agGrid1}
										paginationPageSize={defaultPageSize}
										onGridReady={this.onGridReady}
										gridOptions={gridOptions}
										loadingOverlayComponent={'customLoadingOverlay'}
										noRowsOverlayComponent={'customNoRowsOverlay'}
										noRowsOverlayComponentParams={{
											title: EMPTY_DATA,
											imagClass: 'imagClass'
										}}
										frameworkComponents={frameworkComponents}
									>
										{/* <AgGridColumn field="" cellRenderer={indexFormatter}>Sr. No.yy</AgGridColumn> */}
										<AgGridColumn field="Technology" headerName="Technology"></AgGridColumn>
										<AgGridColumn field="Level" headerName="Highest Approval Level"></AgGridColumn>
										<AgGridColumn field="TechnologyId" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>
									</AgGridReact>
									{<PaginationWrapper gridApi={this.gridApi} setPage={this.levelMappingPagination} pageSize1={5} pageSize2={15} pageSize3={25} />}
								</div>
							</div>
						</Col>
					</Row>
				</div>
				<div className='p-relative'>
					{this.state.isLoader && <LoaderCustom />}
					<Row className="levellisting-page mt20">
						<Col md="12">
							<h2 className="manage-level-heading">{`Simulation Level Mapping`}</h2>
						</Col>
					</Row>
					<Row className="levellisting-page">
						<Col md="6" className=""></Col>
						<Col md="6" className="text-right search-user-block mb-3">
							<button type="button" className="user-btn" title="Reset Grid" onClick={() => this.simulationResetState()}>
								<div className="refresh mr-0"></div>
							</button>
						</Col>
					</Row>

					<Row className="levellisting-page">
						<Col className="level-table" md="12 ">
							<div className={`ag-grid-wrapper height-width-wrapper ${this.props.simulationLevelDataList && this.props.simulationLevelDataList?.length <= 0 ? "overlay-contain" : ""}`}>
								<div className="ag-grid-header">
									<input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" autoComplete={'off'} onChange={(e) => this.simulationFilterHandler(e)} />
								</div>
								<div className={`ag-theme-material ${this.state.isLoader && "max-loader-height"}`}>
									<AgGridReact
										defaultColDef={defaultColDef}
										domLayout='autoHeight'
										// columnDefs={c}
										rowData={this.props.simulationLevelDataList}
										pagination={true}
										paginationPageSize={defaultPageSize}
										ref={this.agGrid2}
										onGridReady={this.onGridReady}
										gridOptions={gridOptions}
										loadingOverlayComponent={'customLoadingOverlay'}
										noRowsOverlayComponent={'customNoRowsOverlay'}
										noRowsOverlayComponentParams={{
											title: EMPTY_DATA,
											imagClass: 'imagClass'
										}}
										frameworkComponents={frameworkComponents}
									>
										{/* <AgGridColumn field="" cellRenderer={indexFormatter}>Sr. No.yy</AgGridColumn> */}
										<AgGridColumn field="Technology" headerName="Heads"></AgGridColumn>
										<AgGridColumn field="Level" headerName="Highest Approval Level"></AgGridColumn>
										<AgGridColumn field="TechnologyId" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'simulationButtonFormatter'}></AgGridColumn>
									</AgGridReact>
									{<PaginationWrapper gridApi={this.gridApi} setPage={this.simulationPagination} pageSize1={5} pageSize2={15} pageSize3={25} />}
								</div>
							</div>
						</Col>
					</Row>
				</div>
				{
					getConfigurationKey().IsMasterApprovalAppliedConfigure &&
					<>
						<div className='p-relative'>
							{this.state.isLoader && <LoaderCustom />}
							<Row className="levellisting-page mt20">
								<Col md="12">
									<h2 className="manage-level-heading">{`Master Level Mapping`}</h2>
								</Col>
							</Row>
							<Row className="levellisting-page">
								<Col md="6" className=""></Col>
								<Col md="6" className="text-right search-user-block mb-3">
									<button type="button" className="user-btn" title="Reset Grid" onClick={() => this.masterResetState()}>
										<div className="refresh mr-0"></div>
									</button>
								</Col>
							</Row>

							<Row className="levellisting-page">
								<Col className="level-table" md="12 ">
									<div className={`ag-grid-wrapper height-width-wrapper ${this.props.masterLevelDataList && this.props.masterLevelDataList?.length <= 0 ? "overlay-contain" : ""}`}>
										<div className="ag-grid-header">
											<input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" autoComplete={'off'} onChange={(e) => this.masterFilterHandler(e)} />
										</div>
										<div className={`ag-theme-material ${this.state.isLoader && "max-loader-height"}`}>
											<AgGridReact
												defaultColDef={defaultColDef}
												domLayout='autoHeight'
												// columnDefs={c}
												rowData={this.props.masterLevelDataList}
												pagination={true}
												ref={this.agGrid3}
												paginationPageSize={defaultPageSize}
												onGridReady={this.onGridReady}
												gridOptions={gridOptions}
												loadingOverlayComponent={'customLoadingOverlay'}
												noRowsOverlayComponent={'customNoRowsOverlay'}
												noRowsOverlayComponentParams={{
													title: EMPTY_DATA,
													imagClass: 'imagClass'
												}}
												frameworkComponents={frameworkComponents}
											>
												{/* <AgGridColumn field="" cellRenderer={indexFormatter}>Sr. No.yy</AgGridColumn> */}
												<AgGridColumn field="Master" headerName="Master"></AgGridColumn>
												<AgGridColumn field="Level" headerName="Highest Approval Level"></AgGridColumn>
												<AgGridColumn field="MasterId" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'masterButtonFormatter'}></AgGridColumn>
											</AgGridReact>
											{<PaginationWrapper gridApi={this.gridApi} setPage={this.masterPagination} pageSize1={5} pageSize2={15} pageSize3={25} />}
										</div>
									</div>

									{
										this.state.showPopup && <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} message={`${MESSAGES.LEVEL_DELETE_ALERT}`} />
									}
								</Col>
							</Row>
						</div>
					</>
				}
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
	const { loading, levelMappingList, simulationLevelDataList, masterLevelDataList } = auth;

	return { loading, levelMappingList, simulationLevelDataList, masterLevelDataList };
}

export default connect(mapStateToProps,
	{
		getAllLevelMappingAPI,
		deleteUserLevelAPI,
		getSimulationLevelDataList,
		getMasterLevelDataList
	})(LevelTechnologyListing);

