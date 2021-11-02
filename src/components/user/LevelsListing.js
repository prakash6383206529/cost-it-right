import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col, } from 'reactstrap';
import { getAllLevelAPI, deleteUserLevelAPI, getLeftMenu, getUsersByTechnologyAndLevel } from '../../actions/auth/AuthActions';
import { toastr } from 'react-redux-toastr';
import Switch from "react-switch";
import { MESSAGES } from '../../config/message';
import { Loader } from '../common/Loader';
import { CONSTANT } from '../../config/constants';
import NoContentFound from '../common/NoContentFound';
import { getConfigurationKey, loggedInUserId } from '../../helper/auth';
import { checkPermission } from '../../helper/util';
import { reactLocalStorage } from 'reactjs-localstorage';
import LevelTechnologyListing from './LevelTechnologyListing';
import Level from './Level';
import { LEVELS } from '../../config/constants';
import { GridTotalFormate } from '../common/TableGridFunctions';
import ConfirmComponent from '../../helper/ConfirmComponent';
import { renderText } from '../layout/FormInputs';
import { Field, reduxForm } from 'redux-form';
import { focusOnError } from "../layout/FormInputs";
import ImpactDrawer from './ImpactDrawer';
import LoaderCustom from '../common/LoaderCustom';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';

const gridOptions = {};

/*************************************THIS FILE IS FOR SHOWING LEVEL LISTING ****************************************/

class LevelsListing extends Component {
	constructor(props) {
		super(props);
		this.child = React.createRef();
		this.state = {
			isEditFlag: false,
			tableData: [],
			isShowForm: false,
			isShowMappingForm: false,
			AddAccessibility: false,
			EditAccessibility: false,
			DeleteAccessibility: false,

			showImpact: false,
			idForImpact: '',
			levelType: '',
			gridApi: null,
			gridColumnApi: null,
			rowData: null,
			sideBar: { toolPanels: ['columns'] },
			showData: false

		}
	}

	componentDidMount() {
		const { topAndLeftMenuData } = this.props;
		if (topAndLeftMenuData !== undefined) {
			const userMenu = topAndLeftMenuData && topAndLeftMenuData.find(el => el.ModuleName === 'Users');
			const accessData = userMenu && userMenu.Pages.find(el => el.PageName === LEVELS)
			const permmisionData = accessData && accessData.Actions && checkPermission(accessData.Actions)

			if (permmisionData !== undefined) {
				this.setState({
					AddAccessibility: permmisionData && permmisionData.Add ? permmisionData.Add : false,
					EditAccessibility: permmisionData && permmisionData.Edit ? permmisionData.Edit : false,
					DeleteAccessibility: permmisionData && permmisionData.Delete ? permmisionData.Delete : false,
				})
			}
		}

		this.getLevelsListData();
		this.props.getUsersByTechnologyAndLevel(() => { })
	}

	UNSAFE_componentWillUpdate() {
		this.props.getUsersByTechnologyAndLevel(() => { })
	}

	getLevelsListData = () => {
		this.props.getAllLevelAPI(res => {
			if (res && res.data && res.data.DataList) {
				let Data = res.data.DataList;
				this.setState({
					tableData: Data,
				})
			}
		});
	}

	/**
	* @method getUpdatedData
	* @description get updated data after updatesuccess
	*/
	getUpdatedData = () => {
		this.getLevelsListData()
	}

	mappingToggler = () => {
		this.setState({
			isShowMappingForm: true,
			isOpen: true,
			isShowForm: false,
		})
	}

	levelToggler = () => {
		this.setState({
			isShowForm: true,
			isOpen: true,
			isShowMappingForm: false,
		})
	}

	/**
	 * @method closeDrawer
	 * @description  used to cancel filter form
	 */
	closeDrawer = (e = '') => {
		this.setState({
			isOpen: false,
			isShowMappingForm: false,
			isShowForm: false,
			isEditFlag: false,
		}, () => {
			this.getUpdatedData()
			this.child.getUpdatedData();
		})
	}

	/**
	 * @method getLevelMappingDetail
	 * @description confirm edit item
	 */
	getLevelMappingDetail = (Id, levelType) => {
		this.setState({
			isEditFlag: true,
			LevelId: Id,
			isOpen: true,
			isShowForm: false,
			isShowMappingForm: true,
			levelType: levelType,
		})
	}

	/**
	 * @method editItemDetails
	 * @description confirm edit item
	 */
	editItemDetails = (cell, Id) => {

		this.setState({
			// isEditFlag: true,
			// LevelId: Id,
			//isOpen: true,
			// isShowForm: true,
			idForImpact: Id,
			showImpact: true,
			isShowMappingForm: false,
		})
	}

	closeImpactDrawer = (e = '', ImpactValue = '') => {
		const { idForImpact, tableData } = this.state


		let tempData = tableData[idForImpact]

		tempData = {
			...tempData,
			Condition: ImpactValue
		}
		let gridTempArr = Object.assign([...tableData], { [idForImpact]: tempData })


		this.setState({
			// isOpen: false,
			// isShowMappingForm: false,
			tableData: gridTempArr,
			isShowForm: false,
			showImpact: false
			// isEditFlag: false,
		}, () => {
			this.getUpdatedData()
			this.child.getUpdatedData();
		})
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
				this.getLevelsListData()
			}
		});
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
				{EditAccessibility && <button type={'button'} className="Edit mr-2" onClick={() => this.editItemDetails(cell, rowIndex)} />}
				{/* {DeleteAccessibility && <button type={'button'} className="Delete" onClick={() => this.deleteItem(cell)} />} */}
			</>
		)
	}

	afterSearch = (searchText, result) => {

	}

	handleChange = (cell, row, enumObject, rowIndex) => {
		let data = {
			Id: row.LevelId,
			ModifiedBy: loggedInUserId(),
			IsActive: !cell, //Status of the user.
		}
		const toastrConfirmOptions = {
			onOk: () => {
				this.confirmDeactivateItem(data, cell)
			},
			onCancel: () => { },
			component: () => <ConfirmComponent />,
		};
		return toastr.confirm(`${cell ? MESSAGES.PLANT_DEACTIVE_ALERT : MESSAGES.PLANT_ACTIVE_ALERT}`, toastrConfirmOptions);
	}

	confirmDeactivateItem = (data, cell) => {
		//   this.props.activeInactiveStatus(data, res => {
		//     if (res && res.data && res.data.Result) {
		//         // if (cell == true) {
		//         //     toastr.success(MESSAGES.PLANT_INACTIVE_SUCCESSFULLY)
		//         // } else {
		//         //     toastr.success(MESSAGES.PLANT_ACTIVE_SUCCESSFULLY)
		//         // }
		//         // this.getTableListData()
		//         this.filterList()
		//     }
		// })
	}

	/**
	 * @method statusButtonFormatter
	 * @description Renders buttons
	 */
	statusButtonFormatter = (cell, row, enumObject, rowIndex) => {
		const { ActivateAccessibility } = this.props;
		// if (ActivateAccessibility) {
		return (
			<>
				<label htmlFor="normal-switch" className="normal-switch">
					{/* <span>Switch with default style</span> */}
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
		// } else {
		// 	return (
		// 		<>
		// 			{
		// 				cell ?
		// 					<div className={'Activated'}> {'Active'}</div>
		// 					:
		// 					<div className={'Deactivated'}>{'Deactive'}</div>
		// 			}
		// 		</>
		// 	)
		// }
	}

	/**
	 * @method TextFormatter
	 * @description Renders buttons
	 */
	TextFormatter = (cell, row, enumObject, rowIndex) => {
		// 
		// this.setState({
		// 	idForImpact: rowIndex
		// })
		return (
			<>
				{/* <input type="text" value={cell} name={rowIndex} /> */}
				<Field
					label=""
					name={`Condition${rowIndex}`}
					type="text"
					placeholder={'Enter'}
					//validate={[required, checkWhiteSpaces, acceptAllExceptSingleSpecialCharacter, maxLength80]}
					component={renderText}
					//required={true}
					// maxLength={26}
					customClassName={'withBorder'}
				/>
			</>
		)
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


	/**
	* @method render
	* @description Renders the component
	*/
	render() {
		const { isEditFlag, isShowForm, isShowMappingForm, isOpen, LevelId,
			AddAccessibility, EditAccessibility, DeleteAccessibility, showImpact } = this.state;
		const options = {
			clearSearch: true,
			noDataText: (this.props.usersListByTechnologyAndLevel === undefined ? <LoaderCustom /> : <NoContentFound title={CONSTANT.EMPTY_DATA} />),
			afterSearch: this.afterSearch,
			paginationShowsTotal: this.renderPaginationShowsTotal,
			prePage: <span className="prev-page-pg"></span>, // Previous page button text
			nextPage: <span className="next-page-pg"></span>, // Next page button text
			firstPage: <span className="first-page-pg"></span>, // First page button text
			lastPage: <span className="last-page-pg"></span>,
			pagination: true,
			sizePerPageList: [{
				text: '5', value: 5
			}, {
				text: '10', value: 10
			}],
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
			customNoRowsOverlay: NoContentFound
		};

		return (
			<div className={"levellisting-page-main"}>
				<div className={"ag-grid-react"}>
					<>
						<form className="levellisting-page">
							{/* {this.props.loading && <Loader />} */}
							<Row className="pt-4">
								<Col md="12">
									<LevelTechnologyListing
										onRef={ref => (this.child = ref)}
										mappingToggler={this.mappingToggler}
										getLevelMappingDetail={this.getLevelMappingDetail}
										AddAccessibility={AddAccessibility}
										EditAccessibility={EditAccessibility}
										DeleteAccessibility={DeleteAccessibility}
									/>
								</Col>
							</Row>
							<Row className="pt-4">
								<Col md="12">
									<Row>
										<Col md="12">
											<h2 className="manage-level-heading">{`Levels`}</h2>
										</Col>
									</Row>
									<Row>
										<Col md="6" className=""></Col>
										<Col md="6" className="search-user-block mb-3 text-right">
											<button type="button" className="user-btn" title="Reset Grid" onClick={() => this.resetState()}>
												<div className="refresh mr-0"></div>
											</button>
										</Col>
									</Row>
									<Row>
										<Col className="mt-0 level-table" md="12">

											{/* <BootstrapTable
											data={this.props.usersListByTechnologyAndLevel}
											striped={false}
											bordered={false}
											hover={false}
											options={options}
											search
											ignoreSinglePage
											ref={'table'}
											trClassName={'userlisting-row'}
											tableHeaderClass={'my-custom-header'}
											pagination>
											<TableHeaderColumn dataField="Technology" dataAlign="left">Technology</TableHeaderColumn>
											<TableHeaderColumn dataField="Level" isKey={true} dataAlign="left" dataSort={true}>Level</TableHeaderColumn>
											<TableHeaderColumn dataField="Users" columnTitle={true} dataAlign="left">Users</TableHeaderColumn> */}
											{/* <TableHeaderColumn dataField="IsActive" dataAlign="left" dataFormat={this.statusButtonFormatter}>Conditional Approval</TableHeaderColumn>
													<TableHeaderColumn dataField="Condition" dataAlign="left" dataFormat={this.TextFormatter}>Condition</TableHeaderColumn>

													{/* <TableHeaderColumn dataField="Sequence" dataAlign="center" dataSort={true}>Sequence</TableHeaderColumn> */}
											{/* <TableHeaderColumn dataField="LevelId" dataAlign="right" dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>  */}
											{/* </BootstrapTable> */}

											<div className="ag-grid-wrapper" style={{ width: '100%', height: '100%' }}>
												<div className="ag-grid-header">
													<input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" onChange={(e) => this.onFilterTextBoxChanged(e)} />
												</div>
												<div
													className="ag-theme-material"

												>
													<AgGridReact
														defaultColDef={defaultColDef}
														domLayout='autoHeight'
														floatingFilter={true}
														// columnDefs={c}
														rowData={this.props.usersListByTechnologyAndLevel}
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
														<AgGridColumn width="250" suppressSizeToFit={true} field="Technology" headerName={`Tehnology/Heads${getConfigurationKey().IsMasterApprovalAppliedConfigure ? '/Masters' : ''}`}></AgGridColumn>
														<AgGridColumn width="100" field="Level" suppressSizeToFit={true} headerName="Level"></AgGridColumn>
														<AgGridColumn field="Users" headerName="Users"></AgGridColumn>
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
								</Col>

							</Row>

							{isOpen && (
								<Level
									isOpen={isOpen}
									isShowForm={isShowForm}
									isShowMappingForm={isShowMappingForm}
									closeDrawer={this.closeDrawer}
									isEditFlag={isEditFlag}
									LevelId={LevelId}
									anchor={'right'}
									isEditedlevelType={this.state.levelType}
								/>
							)}
							{showImpact && (
								<ImpactDrawer
									isOpen={showImpact}
									isShowForm={isShowForm}
									isShowMappingForm={isShowMappingForm}
									closeDrawer={this.closeImpactDrawer}
									//isEditFlag={isEditFlag}
									//LevelId={LevelId}
									anchor={'right'}
								/>
							)}
						</form>
					</>
				</div>
			</div>
		);
	}
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ auth }) {
	const { levelList, leftMenuData, loading, usersListByTechnologyAndLevel, topAndLeftMenuData } = auth;

	return { levelList, leftMenuData, loading, usersListByTechnologyAndLevel, topAndLeftMenuData };
}


export default connect(mapStateToProps,
	{
		getAllLevelAPI,
		deleteUserLevelAPI,
		getLeftMenu,
		getUsersByTechnologyAndLevel
	})(reduxForm({
		form: 'LevelsListing',
		onSubmitFail: errors => {
			focusOnError(errors);
		},
		enableReinitialize: true,
	})(LevelsListing));

