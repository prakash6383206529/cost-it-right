import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col, Button, Table } from 'reactstrap';
import { getAllLevelMappingAPI, deleteUserLevelAPI, getSimulationLevelDataList, getMasterLevelDataList } from '../../actions/auth/AuthActions';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../config/message';
import { CONSTANT } from '../../config/constants';
import NoContentFound from '../common/NoContentFound';
import ConfirmComponent from '../../helper/ConfirmComponent';
import LoaderCustom from '../common/LoaderCustom';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { getConfigurationKey } from '../../helper/auth';

const gridOptions = {};

class LevelTechnologyListing extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isEditFlag: false,
			tableData: [],
			gridApi: null,
			gridColumnApi: null,
			rowData: null,
			sideBar: { toolPanels: ['columns'] },
			showData: false,

		}
	}

	componentDidMount() {
		this.getLevelsListData();
		this.getSimulationDataList();
		this.getMasterDataList()
		this.props.onRef(this);
	}

	getLevelsListData = () => {
		this.props.getAllLevelMappingAPI(res => {
			if (res.status == 204 && res.data == '') {
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
		this.props.getSimulationLevelDataList(res => { })
	}
	getMasterDataList = () => {
		this.props.getMasterLevelDataList(res => { })
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
		const toastrConfirmOptions = {
			onOk: () => {
				this.confirmDeleteItem(Id)
			},
			onCancel: () => { },
			component: () => <ConfirmComponent />
		};
		return toastr.confirm(`${MESSAGES.LEVEL_DELETE_ALERT}`, toastrConfirmOptions);
	}

	/**
	* @method confirmDeleteItem
	* @description confirm delete level item
	*/
	confirmDeleteItem = (LevelId) => {
		this.props.deleteUserLevelAPI(LevelId, (res) => {
			if (res.data.Result === true) {
				toastr.success(MESSAGES.DELETE_LEVEL_SUCCESSFULLY);
				this.getUpdatedData()
			}
		});
	}

	buttonFormatter = (props) => {
		const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;

		const { EditAccessibility } = this.props;
		return (
			<>
				{EditAccessibility && <button type={'button'} className="Edit " onClick={() => this.editItemDetails(cellValue, 'Costing')} />}
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
				{EditAccessibility && <button type={'button'} className="Edit " onClick={() => this.editItemDetails(cellValue, 'Simulation')} />}
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
				{EditAccessibility && <button type={'button'} className="Edit " onClick={() => this.editItemDetails(cellValue, 'Master')} />}
				{/* {DeleteAccessibility && <button type={'button'} className="Delete" onClick={() => this.deleteItem(cell)} />} */}
			</>
		)
	}

	afterSearch = (searchText, result) => {

	}

	onGridReady = (params) => {
		this.gridApi = params.api;
		this.gridApi.sizeColumnsToFit();
		this.setState({ gridApi: params.api, gridColumnApi: params.columnApi })
		params.api.paginationGoToPage(0);
	};

	onPageSizeChanged = (newPageSize) => {
		var value = document.getElementById('page-size').value;
		this.state.gridApi.paginationSetPageSize(Number(value));
	};

	onFilterTextBoxChanged(e) {
		this.state.gridApi.setQuickFilter(e.target.value);
	}

	resetState() {
		gridOptions.columnApi.resetColumnState();
		gridOptions.api.setFilterModel(null);
	}

	onGridReady1 = (params) => {
		this.gridApi = params.api;
		this.gridApi.sizeColumnsToFit();
		this.setState({ gridApi: params.api, gridColumnApi: params.columnApi })
		params.api.paginationGoToPage(0);
	};

	onPageSizeChanged1 = (newPageSize) => {
		var value = document.getElementById('page-size1').value;
		this.state.gridApi.paginationSetPageSize(Number(value));
	};

	onFilterTextBoxChanged1(e) {
		this.state.gridApi.setQuickFilter(e.target.value);
	}

	resetState1() {
		gridOptions.columnApi.resetColumnState();
	}

	/**
	* @method render
	* @description Renders the component
	*/
	render() {
		const { isEditFlag } = this.state;
		const { AddAccessibility } = this.props;
		const options = {
			//clearSearch: true,
			noDataText: (this.props.levelMappingList === undefined ? <LoaderCustom /> : <NoContentFound title={CONSTANT.EMPTY_DATA} />),
			afterSearch: this.afterSearch,
			paginationShowsTotal: this.renderPaginationShowsTotal,
			prePage: <span className="prev-page-pg"></span>, // Previous page button text
			nextPage: <span className="next-page-pg"></span>, // Next page button text
			firstPage: <span className="first-page-pg"></span>, // First page button text
			lastPage: <span className="last-page-pg"></span>,
			pagination: true,
			sizePerPageList: [
				{ text: '5', value: 5 },
				{ text: '10', value: 10 }
			],
			sizePerPage: 5,
		};

		const defaultColDef = {
			resizable: true,
			filter: true,
			sortable: true,

		};

		const frameworkComponents = {
			totalValueRenderer: this.buttonFormatter,
			customLoadingOverlay: LoaderCustom,
			customNoRowsOverlay: NoContentFound,
			simulationButtonFormatter: this.simulationButtonFormatter,
			masterButtonFormatter: this.masterButtonFormatter
		};

		return (
			<>
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
						<button type="button" className="user-btn" title="Reset Grid" onClick={() => this.resetState1()}>
							<div className="refresh mr-0"></div>
						</button>
					</Col>
				</Row>
				<Row className="levellisting-page">
					<Col className="level-table" md="12">
						{/* <BootstrapTable
							data={this.state.tableData}
							striped={false}
							bordered={false}
							hover={false}
							options={options}
							//search
							ignoreSinglePage
							ref={'table'}
							trClassName={'userlisting-row'}
							tableHeaderClass='my-custom-header'
							pagination>
							<TableHeaderColumn dataField="Technology" isKey={true} dataAlign="left" dataSort={true}>Technology</TableHeaderColumn>
							<TableHeaderColumn dataField="Level" dataAlign="left" dataSort={true}>Highest Approval Level</TableHeaderColumn>
							<TableHeaderColumn dataAlign="right" dataField="LevelId" dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>
						</BootstrapTable> */}

						<div className="ag-grid-wrapper" style={{ width: '100%', height: '100%' }}>
							<div className="ag-grid-header">
								<input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" onChange={(e) => this.onFilterTextBoxChanged(e)} />
							</div>
							<div
								className="ag-theme-material"

							>
								<AgGridReact
									defaultColDef={defaultColDef}
									floatingFilter={true}
									domLayout='autoHeight'
									// columnDefs={c}
									rowData={this.state.tableData}
									pagination={true}
									paginationPageSize={5}
									onGridReady={this.onGridReady}
									gridOptions={gridOptions}
									loadingOverlayComponent={'customLoadingOverlay'}
									noRowsOverlayComponent={'customNoRowsOverlay'}
									noRowsOverlayComponentParams={{
										title: CONSTANT.EMPTY_DATA,
									}}
									frameworkComponents={frameworkComponents}
								>
									{/* <AgGridColumn field="" cellRenderer={indexFormatter}>Sr. No.yy</AgGridColumn> */}
									<AgGridColumn field="Technology" headerName="Technology"></AgGridColumn>
									<AgGridColumn field="Level" headerName="Highest Approval Level"></AgGridColumn>
									<AgGridColumn field="LevelId" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>
								</AgGridReact>
								<div className="paging-container d-inline-block float-right">
									<select className="form-control paging-dropdown" onChange={(e) => this.onPageSizeChanged(e.target.value)} id="page-size">
										<option value="5" selected={true}>5</option>
										<option value="20">20</option>
										<option value="50">50</option>
									</select>
								</div>
							</div>
						</div>


					</Col>
				</Row>

				<Row className="levellisting-page mt20">
					<Col md="12">
						<h2 className="manage-level-heading">{`Simulation Level Mapping`}</h2>
					</Col>
				</Row>
				<Row className="levellisting-page">
					<Col md="6" className=""></Col>
					<Col md="6" className="text-right search-user-block mb-3">
						<button type="button" className="user-btn" title="Reset Grid" onClick={() => this.resetState()}>
							<div className="refresh mr-0"></div>
						</button>
					</Col>
				</Row>

				<Row className="levellisting-page">
					<Col className="level-table" md="12 ">
						{/* <BootstrapTable
							data={this.props.simulationLevelDataList}
							striped={false}
							bordered={false}
							hover={false}
							options={options}
							//search
							ignoreSinglePage
							ref={'table'}
							trClassName={'userlisting-row'}
							tableHeaderClass='my-custom-header'
							pagination>
							<TableHeaderColumn dataField="Technology" isKey={true} dataAlign="left" dataSort={true}>Technology</TableHeaderColumn>
							<TableHeaderColumn dataField="Level" dataAlign="left" dataSort={true}>Highest Approval Level</TableHeaderColumn>
							<TableHeaderColumn dataAlign="right" dataField="LevelId" dataFormat={this.simulationButtonFormatter}>Actions</TableHeaderColumn>
						</BootstrapTable> */}

						<div className="ag-grid-wrapper" style={{ width: '100%', height: '100%' }}>
							<div className="ag-grid-header">
								<input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" onChange={(e) => this.onFilterTextBoxChanged1(e)} />
							</div>
							<div
								className="ag-theme-material"

							>
								<AgGridReact
									defaultColDef={defaultColDef}
									domLayout='autoHeight'
									floatingFilter={true}
									// columnDefs={c}
									rowData={this.props.simulationLevelDataList}
									pagination={true}
									paginationPageSize={5}
									onGridReady={this.onGridReady1}
									gridOptions={gridOptions}
									loadingOverlayComponent={'customLoadingOverlay'}
									noRowsOverlayComponent={'customNoRowsOverlay'}
									noRowsOverlayComponentParams={{
										title: CONSTANT.EMPTY_DATA,
									}}
									frameworkComponents={frameworkComponents}
								>
									{/* <AgGridColumn field="" cellRenderer={indexFormatter}>Sr. No.yy</AgGridColumn> */}
									<AgGridColumn field="Technology" headerName="Heads"></AgGridColumn>
									<AgGridColumn field="Level" headerName="Highest Approval Level"></AgGridColumn>
									<AgGridColumn field="LevelId" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'simulationButtonFormatter'}></AgGridColumn>
								</AgGridReact>
								<div className="paging-container d-inline-block float-right">
									<select className="form-control paging-dropdown" onChange={(e) => this.onPageSizeChanged1(e.target.value)} id="page-size1">
										<option value="5" selected={true}>5</option>
										<option value="20">20</option>
										<option value="50">50</option>
									</select>
								</div>
							</div>
						</div>


					</Col>
				</Row>
				{
					getConfigurationKey().IsMasterApprovalAppliedConfigure &&
					<>
						<Row className="levellisting-page mt20">
							<Col md="12">
								<h2 className="manage-level-heading">{`Master Level Mapping`}</h2>
							</Col>
						</Row>
						<Row className="levellisting-page">
							<Col md="6" className=""></Col>
							<Col md="6" className="text-right search-user-block mb-3">
								<button type="button" className="user-btn" title="Reset Grid" onClick={() => this.resetState()}>
									<div className="refresh mr-0"></div>
								</button>
							</Col>
						</Row>

						<Row className="levellisting-page">
							<Col className="level-table" md="12 ">
								<div className="ag-grid-wrapper" style={{ width: '100%', height: '100%' }}>
									<div className="ag-grid-header">
										<input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" onChange={(e) => this.onFilterTextBoxChanged1(e)} />
									</div>
									<div
										className="ag-theme-material"

									>
										<AgGridReact
											defaultColDef={defaultColDef}
											domLayout='autoHeight'
											floatingFilter={true}
											// columnDefs={c}
											rowData={this.props.masterLevelDataList}
											pagination={true}
											paginationPageSize={5}
											onGridReady={this.onGridReady1}
											gridOptions={gridOptions}
											loadingOverlayComponent={'customLoadingOverlay'}
											noRowsOverlayComponent={'customNoRowsOverlay'}
											noRowsOverlayComponentParams={{
												title: CONSTANT.EMPTY_DATA,
											}}
											frameworkComponents={frameworkComponents}
										>
											{/* <AgGridColumn field="" cellRenderer={indexFormatter}>Sr. No.yy</AgGridColumn> */}
											<AgGridColumn field="Master" headerName="Master"></AgGridColumn>
											<AgGridColumn field="Level" headerName="Highest Approval Level"></AgGridColumn>
											<AgGridColumn field="LevelId" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'masterButtonFormatter'}></AgGridColumn>
										</AgGridReact>
										<div className="paging-container d-inline-block float-right">
											<select className="form-control paging-dropdown" onChange={(e) => this.onPageSizeChanged1(e.target.value)} id="page-size1">
												<option value="5" selected={true}>5</option>
												<option value="20">20</option>
												<option value="50">50</option>
											</select>
										</div>
									</div>
								</div>


							</Col>
						</Row>
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

