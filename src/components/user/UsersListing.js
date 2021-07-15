import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { getAllUserDataAPI, deleteUser, getAllDepartmentAPI, getAllRoleAPI, activeInactiveUser, getLeftMenu, } from '../../actions/auth/AuthActions';
import $ from 'jquery';
import { focusOnError, searchableSelect } from "../layout/FormInputs";
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../config/message';
import { CONSTANT } from '../../helper/AllConastant';
import { USER } from '../../config/constants';
import NoContentFound from '../common/NoContentFound';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import Switch from "react-switch";
import { loggedInUserId } from '../../helper/auth';
import ViewUserDetails from './ViewUserDetails';
import { checkPermission } from '../../helper/util';
import { reactLocalStorage } from 'reactjs-localstorage';
import { GridTotalFormate } from '../common/TableGridFunctions';
import ConfirmComponent from "../../helper/ConfirmComponent";
import LoaderCustom from '../common/LoaderCustom';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';

const gridOptions = {};

function enumFormatter(cell, row, enumObject) {
	return enumObject[cell];
}

class UsersListing extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isEditFlag: false,
			shown: false,
			RoleId: '',
			userData: [],
			departmentType: {},
			roleType: {},
			department: [],
			role: [],
			UserId: '',
			isOpen: false,
			AddAccessibility: false,
			EditAccessibility: false,
			DeleteAccessibility: false,
			ActivateAccessibility: false,
			gridApi: null,
			gridColumnApi: null,
			rowData: null,
		}
	}

	UNSAFE_componentWillMount() {

		let ModuleId = reactLocalStorage.get('ModuleId');
		this.props.getLeftMenu(ModuleId, loggedInUserId(), (res) => {
			const { leftMenuData } = this.props;
			if (leftMenuData !== undefined) {
				let Data = leftMenuData;
				const userPermissions = Data && Data.find(el => el.PageName === USER)
				const permmisionData = userPermissions && userPermissions.Actions && checkPermission(userPermissions.Actions)

				if (permmisionData !== undefined) {
					this.setState({
						AddAccessibility: permmisionData && permmisionData.Add ? permmisionData.Add : false,
						EditAccessibility: permmisionData && permmisionData.Edit ? permmisionData.Edit : false,
						DeleteAccessibility: permmisionData && permmisionData.Delete ? permmisionData.Delete : false,
						ActivateAccessibility: permmisionData && permmisionData.Activate ? permmisionData.Activate : false,
					})
				}
			}
		})
	}

	componentDidMount() {
		this.getUsersListData(null, null);

		//Get Department Listing
		this.props.getAllDepartmentAPI((res) => {
			if (res && res.data && res.data.DataList) {
				let Data = res.data.DataList;
				let obj = {}
				Data && Data.map((el, i) => {
					obj[el.DepartmentId] = el.DepartmentName
				})
				this.setState({
					departmentType: obj,
				})
			}
		})

		// Get roles listing
		this.props.getAllRoleAPI((res) => {
			if (res && res.data && res.data.DataList) {
				let Data = res.data.DataList;
				let obj = {}
				Data && Data.map((el, i) => {
					obj[el.RoleId] = el.RoleName
				})
				this.setState({
					roleType: obj,
				})
			}
		})
		//this.props.onRef(this)
	}



	// Get updated user list after any action performed.
	getUpdatedData = () => {
		this.getUsersListData(null, null);
	}

	/**
	* @method getUsersListData
	* @description Get user list data
	*/
	getUsersListData = (departmentId = null, roleId = null) => {
		let data = {
			logged_in_user: loggedInUserId(),
			DepartmentId: departmentId,
			RoleId: roleId,
		}
		this.props.getAllUserDataAPI(data, res => {
			if (res.status === 204 && res.data === '') {
				this.setState({ userData: [], })
			} else if (res && res.data && res.data.DataList) {
				let Data = res.data.DataList;
				this.setState({
					userData: Data,
				})
			} else {

			}
		});
	}

	/**
 * @method selectType
 * @description Used show listing of unit of measurement
 */
	searchableSelectType = (label) => {
		const { roleList, departmentList } = this.props;
		const temp = [];

		if (label === 'role') {
			roleList && roleList.map(item =>
				temp.push({ label: item.RoleName, value: item.RoleId })
			);
			return temp;
		}

		if (label === 'department') {
			departmentList && departmentList.map(item =>
				temp.push({ label: item.DepartmentName, value: item.DepartmentId })
			);
			return temp;
		}

	}

	/**
	 * @method departmentHandler
	 * @description Used to handle 
	 */
	departmentHandler = (newValue, actionMeta) => {
		this.setState({ department: newValue });
	};
	/**
		 * @method roleHandler
		 * @description Used to handle 
		 */
	roleHandler = (newValue, actionMeta) => {
		this.setState({ role: newValue });
	};

	/**
	* @method editItemDetails
	* @description confirm edit item
	*/
	editItemDetails = (Id, passwordFlag = false) => {
		let data = {
			isEditFlag: true,
			UserId: Id,
			passwordFlag: passwordFlag,
		}
		this.closeUserDetails()
		this.props.getUserDetail(data)
	}

	/**
	* @method deleteItem
	* @description confirm delete part
	*/
	deleteItem = (Id) => {
		const toastrConfirmOptions = {
			onOk: () => {
				this.confirmDeleteItem(Id)
			},
			onCancel: () => { }
		};
		return toastr.confirm(`${MESSAGES.USER_DELETE_ALERT}`, toastrConfirmOptions);
	}

	/**
	* @method confirmDeleteItem
	* @description confirm delete user item
	*/
	confirmDeleteItem = (UserId) => {
		this.props.deleteUser(UserId, (res) => {
			if (res.data.Result === true) {
				toastr.success(MESSAGES.DELETE_USER_SUCCESSFULLY);
				this.getUsersListData(null, null);
			}
		});
	}

	/**
	* @method buttonFormatter
	* @description Renders buttons
	*/
	buttonFormatter = (props) => {
		const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
		const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;

		const { EditAccessibility } = this.state;
		if (cellValue === loggedInUserId()) return null;
		return (
			<div className="">
				{EditAccessibility && <button className="Edit " type={'button'} onClick={() => this.editItemDetails(cellValue, false)} />}
				{/* <Button className="btn btn-danger" onClick={() => this.deleteItem(cell)}><i className="far fa-trash-alt"></i></Button> */}
			</div>
		)
	}

	/**
	* @method hyphenFormatter
	*/
	hyphenFormatter = (props) => {
		const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
		return cellValue != null ? cellValue : '-';
	}

	handleChange = (cell, row) => {
		let data = {
			Id: row.UserId,
			ModifiedBy: loggedInUserId(),
			IsActive: !cell, //Status of the user.
		}
		const toastrConfirmOptions = {
			onOk: () => {
				this.confirmDeactivateItem(data, cell);
			},
			onCancel: () => { },
			component: () => <ConfirmComponent />,
		};
		return toastr.confirm(
			`${cell ? MESSAGES.USER_DEACTIVE_ALERT : MESSAGES.USER_ACTIVE_ALERT}`,
			toastrConfirmOptions
		);
	}

	/**
	* @method confirmDeactivateItem
	* @description confirm deactivate user item
	*/
	confirmDeactivateItem = (data, cell) => {
		this.props.activeInactiveUser(data, res => {
			if (res && res.data && res.data.Result) {
				// if (cell == true) {
				// 	toastr.success(MESSAGES.USER_INACTIVE_SUCCESSFULLY)
				// } else {
				// 	toastr.success(MESSAGES.USER_ACTIVE_SUCCESSFULLY)
				// }
				this.getUsersListData(null, null);
			}
		})
	}

	/**
	* @method statusButtonFormatter
	* @description Renders buttons
	*/
	statusButtonFormatter = (props) => {
		const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
		const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;

		const { ActivateAccessibility } = this.state;
		if (rowData.UserId === loggedInUserId()) return null;
		if (ActivateAccessibility) {
			return (
				<>
					<label htmlFor="normal-switch">
						{/* <span>Switch with default style</span> */}
						<Switch
							onChange={() => this.handleChange(cellValue, rowData)}
							checked={cellValue}
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
		} else {
			return (
				<>
					{
						cellValue ?
							<div className={'Activated'}> {'Active'}</div>
							:
							<div className={'Deactivated'}>{'Deactive'}</div>
					}
				</>
			)
		}

	}

	/**
	* @method linkableFormatter
	* @description Renders Name link
	*/
	linkableFormatter = (cell, row, enumObject, rowIndex) => {
		return (
			<>
				<div
					onClick={() => this.viewDetails(row.UserId)}
					className={'link'}
				>{cell}</div>
			</>
		)
	}

	viewDetails = (UserId) => {
		$('html, body').animate({ scrollTop: 0 }, 'slow');
		this.setState({
			UserId: UserId,
			isOpen: true,
		})

	}

	closeUserDetails = () => {
		this.setState({
			UserId: '',
			isOpen: false,
		})
	}

	/**
	* @method indexFormatter
	* @description Renders serial number
	*/
	indexFormatter = (cell, row, enumObject, rowIndex) => {
		let currentPage = this.refs.table.state.currPage;
		let sizePerPage = this.refs.table.state.sizePerPage;
		let serialNumber = '';
		if (currentPage === 1) {
			serialNumber = rowIndex + 1;
		} else {
			serialNumber = (rowIndex + 1) + (sizePerPage * (currentPage - 1));
		}
		return serialNumber;
	}

	onExportToCSV = (row) => {
		return this.state.userData; // must return the data which you want to be exported
	}

	renderPaginationShowsTotal(start, to, total) {
		return <GridTotalFormate start={start} to={to} total={total} />
	}

	/**
	* @method filterList
	* @description Filter user listing on the basis of role and department
	*/
	filterList = () => {
		const { role, department } = this.state;
		const filterDepartment = department ? department.value : '';
		const filterRole = role ? role.value : '';
		this.getUsersListData(filterDepartment, filterRole)
	}

	/**
	* @method resetFilter
	* @description Reset user filter
	*/
	resetFilter = () => {
		this.setState({
			role: [],
			department: []
		}, () => {
			const { role, department } = this.state;
			const filterDepartment = department ? department.value : '';
			const filterRole = role ? role.value : '';
			this.getUsersListData(filterDepartment, filterRole)
		})
	}
	formToggle = () => {
		this.props.formToggle()
	}

	/**
	* @name onSubmit
	* @param values
	* @desc Submit the signup form values.
	* @returns {{}}
	*/
	onSubmit(values) {
	}

	onPageSizeChanged = (newPageSize) => {
		var value = document.getElementById('page-size').value;
		this.state.gridApi.paginationSetPageSize(Number(value));
	};

	onFilterTextBoxChanged = (e) => {
		this.state.gridApi.setQuickFilter(e.target.value);
	}


	resetState = () => {
		gridOptions.columnApi.resetColumnState();
	}

	onGridReady = (params) => {
		this.setState({ gridApi: params.api, gridColumnApi: params.columnApi })
		params.api.paginationGoToPage(0);
	};

	/**
	* @method render
	* @description Renders the component
	*/
	render() {
		const { handleSubmit, initialConfiguration, } = this.props;
		const { EditAccessibility, departmentType, roleType, AddAccessibility } = this.state;
		const options = {
			clearSearch: true,
			noDataText: (this.props.userDataList === undefined ? <LoaderCustom /> : <NoContentFound title={CONSTANT.EMPTY_DATA} />),
			paginationShowsTotal: this.renderPaginationShowsTotal,
			prePage: <span className="prev-page-pg"></span>, // Previous page button text
			nextPage: <span className="next-page-pg"></span>, // Next page button text
			firstPage: <span className="first-page-pg"></span>, // First page button text
			lastPage: <span className="last-page-pg"></span>,

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
			statusButtonFormatter: this.statusButtonFormatter,
			hyphenFormatter: this.hyphenFormatter
		};

		return (
			<div className={"ag-grid-react"}>
				<>
					{" "}
					{/* {this.props.loading && <Loader />} */}
					<form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>
						<Row className="pt-4">
							{this.state.shown &&
								<Col md="8" className="filter-block">
									<div className="d-inline-flex justify-content-start align-items-top w100">
										<div className="flex-fills">
											<h5>{`Filter By:`}</h5>
										</div>
										<div className="flex-fill">
											<Field
												name="DepartmentId"
												type="text"
												component={searchableSelect}
												placeholder={"Department"}
												options={this.searchableSelectType("department")}
												//onKeyUp={(e) => this.changeItemDesc(e)}
												//validate={(this.state.department == null || this.state.department.length == 0) ? [required] : []}
												//required={true}
												handleChangeDescription={this.departmentHandler}
												valueDescription={this.state.department}
											/>
										</div>
										<div className="flex-fill">
											<Field
												name="RoleId"
												type="text"
												component={searchableSelect}
												placeholder={"Role"}
												options={this.searchableSelectType("role")}
												//onKeyUp={(e) => this.changeItemDesc(e)}
												//validate={(this.state.role == null || this.state.role.length == 0) ? [required] : []}
												//required={true}
												handleChangeDescription={this.roleHandler}
												valueDescription={this.state.role}
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
												className="user-btn mr5"
											>
												{"Apply"}
											</button>
										</div>
									</div>
								</Col>
							}
							<Col md="6" className="search-user-block mb-3">
									<div className="d-flex justify-content-end bd-highlight w100">
								{AddAccessibility && (
										<div>
											{this.state.shown ? (
												<button type="button" className="user-btn mr5 filter-btn-top" onClick={() => this.setState({ shown: !this.state.shown })}>
													<div className="cancel-icon-white"></div></button>
											) : (
												<button title="Filter" type="button" className="user-btn mr5" onClick={() => this.setState({ shown: !this.state.shown })}>
                                                    <div className="filter mr-0"></div>
                                                </button>
											)}
											<button
												type="button"
												className={"user-btn mr5"}
												onClick={this.formToggle}
												title="Add"
											>
												<div className={"plus mr-0"}></div>
											</button>
										</div>
								)}
								<button type="button" className="user-btn" title="Reset Grid" onClick={() => this.resetState()}>
                                                <div className="refresh mr-0"></div>
                                            </button>
									</div>


							</Col>
						</Row>
					</form>
					{/* <BootstrapTable
					data={this.props.userDataList}
					striped={false}
					bordered={false}
					hover={false}
					options={options}
					search
					// exportCSV
					// ignoreSinglePage

					ref={"table"}
					trClassName={"userlisting-row"}
					tableHeaderClass="my-custom-header"
					pagination
				> */}
					{/* <TableHeaderColumn dataField="Sr. No." width={'70'} csvHeader='Full-Name' dataFormat={this.indexFormatter}>Sr. No.</TableHeaderColumn> */}
					{/* <TableHeaderColumn dataField="FullName" csvHeader="Full-Name" dataFormat={this.linkableFormatter} dataAlign="left" dataSort={true}>Name</TableHeaderColumn>
					{initialConfiguration && !initialConfiguration.IsLoginEmailConfigure ? (
						<TableHeaderColumn dataField="UserName" width={"150"} dataSort={true}>User name</TableHeaderColumn>
					) : null}
					<TableHeaderColumn dataField="EmailAddress" columnTitle width={"220"} dataSort={true}>Email Id </TableHeaderColumn>
					<TableHeaderColumn dataField="Mobile" width={"110"} dataSort={false}>Mobile No.</TableHeaderColumn>
					<TableHeaderColumn dataField="PhoneNumber" width={"110"} dataSort={false}>Phone No.</TableHeaderColumn>
					<TableHeaderColumn dataField="DepartmentName" dataSort={true}>Purchase Group</TableHeaderColumn>
					{/* <TableHeaderColumn dataField='DepartmentId' export={false} filterFormatted dataFormat={enumFormatter} formatExtraData={departmentType}
                                		filter={{ type: 'SelectFilter', options: departmentType }}>Department</TableHeaderColumn> */}
					{/* <TableHeaderColumn dataField='DepartmentId' export={false} filterFormatted dataFormat={enumFormatter} formatExtraData={departmentType} dataSort={true} >Department</TableHeaderColumn> */}
					{/* <TableHeaderColumn dataField="RoleName" dataSort={true}>Role</TableHeaderColumn> */}
					{/* <TableHeaderColumn dataField='RoleId' export={false} filterFormatted dataFormat={enumFormatter} formatExtraData={roleType}
                                filter={{ type: 'SelectFilter', options: roleType }}>Role</TableHeaderColumn> */}
					{/* <TableHeaderColumn dataField='RoleId' export={false} filterFormatted dataFormat={enumFormatter} formatExtraData={roleType} dataSort={true}>Role</TableHeaderColumn> */}
					{/* <TableHeaderColumn dataField="IsActive" export={false} dataFormat={this.statusButtonFormatter} width={80}>Status</TableHeaderColumn>
					<TableHeaderColumn width={80} className="action" dataField="UserId" export={false} isKey={true} dataAlign="right" dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>
				</BootstrapTable> */}

					<div className="ag-grid-wrapper" style={{ width: '100%', height: '100%' }}>
						<div className="ag-grid-header">
							<input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" onChange={(e) => this.onFilterTextBoxChanged(e)} />
						</div>
						<div
							className="ag-theme-material"
							style={{ height: '100%', width: '100%' }}
						>
							<AgGridReact
								defaultColDef={defaultColDef}
								// columnDefs={c}
								rowData={this.props.userDataList}
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
								{/* <AgGridColumn field="" cellRenderer={indexFormatter}>Sr. No.yy</AgGridColumn> */}
								<AgGridColumn field="FullName" headerName="Name"></AgGridColumn>
								{initialConfiguration && !initialConfiguration.IsLoginEmailConfigure ? (
									<AgGridColumn field="UserName" headerName="User Name"></AgGridColumn>
								) : null}
								<AgGridColumn field="EmailAddress" headerName="Email Id"></AgGridColumn>
								<AgGridColumn field="Mobile" headerName="Mobile No." cellRenderer={'hyphenFormatter'}></AgGridColumn>
								<AgGridColumn field="PhoneNumber" headerName="Phone No." cellRenderer={'hyphenFormatter'}></AgGridColumn>
								<AgGridColumn field="DepartmentName" headerName="Purchase Group"></AgGridColumn>
								<AgGridColumn field="RoleName" headerName="Role"></AgGridColumn>
								<AgGridColumn field="IsActive" headerName="Status"  cellRenderer={'statusButtonFormatter'}></AgGridColumn>
								<AgGridColumn field="UserId" headerName="Action"  cellRenderer={'totalValueRenderer'}></AgGridColumn>
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

					{this.state.isOpen && (
						<ViewUserDetails
							UserId={this.state.UserId}
							isOpen={this.state.isOpen}
							editItemDetails={this.editItemDetails}
							closeUserDetails={this.closeUserDetails}
							EditAccessibility={EditAccessibility}
							anchor={"right"}
							IsLoginEmailConfigure={initialConfiguration.IsLoginEmailConfigure}
						/>
					)}
				</>
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
	const { userDataList, roleList, departmentList, leftMenuData, initialConfiguration, loading } = auth;

	return { userDataList, roleList, departmentList, leftMenuData, initialConfiguration, loading };
}


/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/

export default connect(mapStateToProps, {
	getAllUserDataAPI,
	deleteUser,
	getAllDepartmentAPI,
	getAllRoleAPI,
	activeInactiveUser,
	getLeftMenu,
})(reduxForm({
	form: 'UsersListing',
	onSubmitFail: errors => {
		focusOnError(errors);
	},
	enableReinitialize: true,
})(UsersListing));
