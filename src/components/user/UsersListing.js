import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Button, Table } from 'reactstrap';
import {
	getAllUserDataAPI, deleteUser, getAllDepartmentAPI, getAllRoleAPI,
	activeInactiveUser,
} from '../../actions/auth/AuthActions';
import { focusOnError, searchableSelect } from "../layout/FormInputs";
import { required } from "../../helper/validation";
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../config/message';
import { Loader } from '../common/Loader';
import { CONSTANT } from '../../helper/AllConastant';
import NoContentFound from '../common/NoContentFound';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import Switch from "react-switch";
import { loggedInUserId } from '../../helper/auth';
import ViewUserDetails from './ViewUserDetails';

function enumFormatter(cell, row, enumObject) {
	return enumObject[cell];
}

class UsersListing extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isEditFlag: false,
			RoleId: '',
			userData: [],
			departmentType: {},
			roleType: {},
			department: [],
			role: [],
			UserId: '',
			isOpen: false,
		}
	}

	componentDidMount() {
		this.getUsersListData('', '');

		// Get department listing
		this.props.getAllDepartmentAPI((res) => {
			if (res && res.data && res.data.DataList) {
				const { departmentType } = this.state;
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
		this.props.onRef(this)
	}

	// Get updated user list after any action performed.
	getUpdatedData = () => {
		this.getUsersListData('', '')
	}

	/**
	* @method getUsersListData
	* @description Get user list data
	*/
	getUsersListData = (departmentId = '', roleId = '') => {
		let data = {
			UserId: loggedInUserId(),
			PageSize: 0,
			LastIndex: 0,
			DepartmentId: departmentId,
			RoleId: roleId,
		}
		this.props.getAllUserDataAPI(data, res => {
			if (res.status == 204 && res.data == '') {
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

		if (label == 'role') {
			roleList && roleList.map(item =>
				temp.push({ label: item.RoleName, value: item.RoleId })
			);
			return temp;
		}

		if (label == 'department') {
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
	editItemDetails = (Id) => {
		let requestData = {
			isEditFlag: true,
			UserId: Id,
		}
		this.closeUserDetails()
		this.props.getUserDetail(requestData)
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
			onCancel: () => console.log('CANCEL: clicked')
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
				this.getUsersListData('', '');
			}
		});
	}

	/**
	* @method buttonFormatter
	* @description Renders buttons
	*/
	buttonFormatter = (cell, row, enumObject, rowIndex) => {
		return (
			<>
				{/* <Button className="btn btn-secondary" onClick={() => this.editItemDetails(cell)}><i className="fas fa-pencil-alt"></i></Button> */}
				<button className="Edit" type={'button'} onClick={() => this.editItemDetails(cell)} />
				{/* <Button className="btn btn-danger" onClick={() => this.deleteItem(cell)}><i className="far fa-trash-alt"></i></Button> */}
			</>
		)
	}

	handleChange = (cell, row, enumObject, rowIndex) => {
		let data = {
			Id: row.UserId,
			ModifiedBy: loggedInUserId(),
			IsActive: !cell, //Status of the user.
		}
		this.props.activeInactiveUser(data, res => {
			if (res && res.data && res.data.Result) {
				if (cell == true) {
					toastr.success(MESSAGES.USER_INACTIVE_SUCCESSFULLY)
				} else {
					toastr.success(MESSAGES.USER_ACTIVE_SUCCESSFULLY)
				}
				this.getUsersListData('', '')
			}
		})
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
						onChange={() => this.handleChange(cell, row, enumObject, rowIndex)}
						checked={cell}
						background="#ff6600"
						onColor="#4DC771"
						onHandleColor="#ffffff"
						id="normal-switch"
						height={24}
					/>
				</label>
			</>
		)
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
		if (currentPage == 1) {
			serialNumber = rowIndex + 1;
		} else {
			serialNumber = (rowIndex + 1) + (sizePerPage * (currentPage - 1));
		}
		return serialNumber;
	}

	onExportToCSV = (row) => {
		console.log('row', row)
		// ...
		return this.state.userData; // must return the data which you want to be exported
	}

	renderPaginationShowsTotal(start, to, total) {
		return (
			<p style={{ color: 'blue' }}>
				Showing {start} of {to} entries.
			</p>
		);
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
	/**
	* @method render
	* @description Renders the component
	*/
	render() {
		const { handleSubmit, pristine, submitting, } = this.props;
		const { isOpen, isEditFlag, editIndex, PartId, departmentType, roleType } = this.state;
		const options = {
			clearSearch: true,
			noDataText: <NoContentFound title={CONSTANT.EMPTY_DATA} />,
			//exportCSVText: 'Download Excel',
			//onExportToCSV: this.onExportToCSV,
			//paginationShowsTotal: true,
			paginationShowsTotal: this.renderPaginationShowsTotal,
			paginationSize: 2,
		};

		return (
			<>
				{/* {this.props.loading && <Loader />} */}
				<form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>
					<Row className="pt-30">
						<Col md="8" className="filter-block">
							<div className="d-inline-flex justify-content-start align-items-top w100">
								<div className="flex-fills"><h5>{`Filter By:`}</h5></div>
								<div className="flex-fill"> <Field
									name="DepartmentId"
									type="text"
									component={searchableSelect}
									placeholder={'Department'}
									options={this.searchableSelectType('department')}
									//onKeyUp={(e) => this.changeItemDesc(e)}
									//validate={(this.state.department == null || this.state.department.length == 0) ? [required] : []}
									//required={true}
									handleChangeDescription={this.departmentHandler}
									valueDescription={this.state.department}
								/></div>
								<div className="flex-fill"><Field
									name="RoleId"
									type="text"
									component={searchableSelect}
									placeholder={'Role'}
									options={this.searchableSelectType('role')}
									//onKeyUp={(e) => this.changeItemDesc(e)}
									//validate={(this.state.role == null || this.state.role.length == 0) ? [required] : []}
									//required={true}
									handleChangeDescription={this.roleHandler}
									valueDescription={this.state.role}
								/></div>
								<div className="flex-fill">
									<button
										type="button"
										//disabled={pristine || submitting}
										onClick={this.resetFilter}
										className="reset mr10"
									>
										{'Reset'}
									</button>
									{/* </Col>
                        <Col md="2"> */}
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
						<Col md="4" className="search-user-block">
							<div className="d-flex justify-content-end bd-highlight w100">
								<div>
									{!this.props.isShowForm &&
										<button
											type="button"
											className={'user-btn'}
											onClick={this.formToggle}>
											<div className={'plus'}></div>ADD USER</button>
									}
								</div>
							</div>
						</Col>
					</Row>

				</form>
				<BootstrapTable
					data={this.state.userData}
					striped={false}
					bordered={false}
					hover={true}
					options={options}
					search
					// exportCSV
					ignoreSinglePage
					ref={'table'}
					trClassName={'userlisting-row'}
					tableHeaderClass='my-custom-header'
					pagination>
					<TableHeaderColumn dataField="Sr. No." csvHeader='Full-Name' dataFormat={this.indexFormatter}>Sr. No.</TableHeaderColumn>
					<TableHeaderColumn dataField="FullName" csvHeader='Full-Name' dataFormat={this.linkableFormatter} dataAlign="center" dataSort={true}>Name</TableHeaderColumn>
					<TableHeaderColumn dataField="UserName" dataSort={true}>User name</TableHeaderColumn>
					<TableHeaderColumn dataField="Email" dataSort={true}>Email Id</TableHeaderColumn>
					<TableHeaderColumn dataField="Mobile" dataSort={false}>Mobile No.</TableHeaderColumn>
					<TableHeaderColumn dataField="PhoneNumber" dataSort={false}>Phone No.</TableHeaderColumn>

					<TableHeaderColumn dataField='DepartmentName' export hidden>Product Name</TableHeaderColumn>
					{/* <TableHeaderColumn dataField='DepartmentId' export={false} filterFormatted dataFormat={enumFormatter} formatExtraData={departmentType}
                                filter={{ type: 'SelectFilter', options: departmentType }}>Department</TableHeaderColumn> */}
					<TableHeaderColumn dataField='DepartmentId' export={false} filterFormatted dataFormat={enumFormatter} formatExtraData={departmentType} dataSort={true} >Department</TableHeaderColumn>
					<TableHeaderColumn dataField='RoleName' export hidden>Role Name</TableHeaderColumn>
					{/* <TableHeaderColumn dataField='RoleId' export={false} filterFormatted dataFormat={enumFormatter} formatExtraData={roleType}
                                filter={{ type: 'SelectFilter', options: roleType }}>Role</TableHeaderColumn> */}
					<TableHeaderColumn dataField='RoleId' export={false} filterFormatted dataFormat={enumFormatter} formatExtraData={roleType} dataSort={true}>Role</TableHeaderColumn>
					<TableHeaderColumn dataField="IsActive" export={false} dataFormat={this.statusButtonFormatter}>Status</TableHeaderColumn>
					<TableHeaderColumn className="action" dataField="UserId" export={false} isKey={true} dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>

				</BootstrapTable>

				{this.state.isOpen &&
					<ViewUserDetails
						UserId={this.state.UserId}
						isOpen={this.state.isOpen}
						editItemDetails={this.editItemDetails}
						closeUserDetails={this.closeUserDetails}
						anchor={'right'}
					/>}
			</ >
		);
	}
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ auth }) {
	const { userDataList, roleList, departmentList, loading } = auth;

	return { userDataList, roleList, departmentList, loading };
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
})(reduxForm({
	form: 'UsersListing',
	onSubmitFail: errors => {
		//console.log('Register errors', errors)
		focusOnError(errors);
	},
	enableReinitialize: true,
})(UsersListing));
