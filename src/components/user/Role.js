import React, { Component } from "react";
import { Field, reduxForm } from "redux-form";
import { toastr } from "react-redux-toastr";
import { connect } from "react-redux";
import { Loader } from "../common/Loader";
import { required, alphabetsOnlyForName, number } from "../../helper/validation";
import { renderText } from "../layout/FormInputs";
import "./UserRegistration.scss";
import {
	addRoleAPI, getAllRoleAPI, getRoleDataAPI, updateRoleAPI, setEmptyRoleDataAPI,
	getModuleSelectList, getActionHeadsSelectList, getModuleActionInit,
} from "../../actions/auth/AuthActions";
import { MESSAGES } from "../../config/message";
import RolesListing from './RolesListing';
import { Table } from 'reactstrap';
import NoContentFound from "../common/NoContentFound";
import { CONSTANT } from "../../helper/AllConastant";
import { userDetails, loggedInUserId } from "../../helper/auth";
import Switch from "react-switch";

class Role extends Component {
	constructor(props) {
		super(props);
		this.child = React.createRef();
		this.state = {
			isLoader: false,
			isSubmitted: false,
			isEditFlag: false,
			permissions: [],
			checkedAll: false,
			RoleId: '',
			Modules: [],
		};
	}

	/**
	* @method componentDidMount
	* @description used to called after mounting component
	*/
	componentDidMount() {
		this.props.setEmptyRoleDataAPI('', () => { })
		this.props.getActionHeadsSelectList(() => {
			this.getRolePermission()
		})
		this.props.getModuleSelectList(() => { })

	}

	getRolePermission = () => {
		this.setState({ isLoader: true });
		this.props.getModuleActionInit((res) => {
			if (res && res.data && res.data.Data) {

				let Data = res.data.Data;
				let Modules = res.data.Data;

				let moduleCheckedArray = [];
				Modules && Modules.map((el, i) => {
					let tempObj = {
						ModuleName: el.ModuleName,
						IsChecked: el.IsChecked,
						ModuleId: el.ModuleId,
					}
					moduleCheckedArray.push(tempObj)
				})

				this.setState({
					actionData: Data,
					Modules: Modules,
					moduleCheckedAll: moduleCheckedArray,
					isLoader: false,
				})
			}
		})
	}

	/**
	* @method getRoleDetail
	* @description used to get role detail
	*/
	getRoleDetail = (data) => {
		if (data && data.isEditFlag) {
			this.setState({ isLoader: true })
			this.props.getRoleDataAPI(data.RoleId, (res) => {
				if (res && res.data && res.data.Data) {
					let Data = res.data.Data;
					let Modules = Data.Modules;

					let moduleCheckedArray = [];
					Modules && Modules.map((el, i) => {
						let tempObj = {
							ModuleName: el.ModuleName,
							IsChecked: el.IsChecked,
							ModuleId: el.ModuleId,
						}
						moduleCheckedArray.push(tempObj)
					})

					this.setState({
						isEditFlag: true,
						RoleId: data.RoleId,
						Modules: Modules,
						moduleCheckedAll: moduleCheckedArray,
						isLoader: false,
						isShowForm: true,
					})
					if (Modules.length == 0) this.getRolePermission();
				}
			})
		}
	}

	/**
	* @method moduleHandler
	* @description used to select permission's
	*/
	// moduleHandler = (ID) => {
	//     const { permissions } = this.state;
	//     let newArray = [];
	//     if (permissions.includes(ID)) {
	//         const index = permissions.indexOf(ID);
	//         if (index > -1) {
	//             permissions.splice(index, 1);
	//         }
	//         newArray = [...new Set(permissions)]
	//     } else {
	//         permissions.push(ID)
	//         newArray = [...new Set(permissions)]
	//     }
	//     this.setState({ permissions: newArray }, () => {
	//         this.setState({ checkedAll: this.isCheckAll() })
	//     })
	// }

	/**
	* @method selectAllHandler
	* @description used to select permission's
	*/
	// selectAllHandler = () => {
	//     const { permissions, checkedAll } = this.state;
	//     const { moduleSelectList } = this.props;
	//     let tempArray = [];
	//     let tempObj = {}
	//     if (checkedAll) {
	//         this.setState({ permissions: tempArray, checkedAll: false }, () => { console.log('All', this.state.permissions) })
	//     } else {
	//         moduleSelectList && moduleSelectList.map((item, index) => {
	//             if (item.Value == 0) return false;
	//             return tempArray.push(item.Value)
	//         })
	//         this.setState({ permissions: tempArray, checkedAll: true }, () => { console.log('All', this.state.permissions) })
	//     }

	// }

	/**
	* @method isSelected
	* @description used to select permission's
	*/
	// isSelected = ID => {
	//     const { permissions } = this.state;
	//     return permissions.includes(ID);
	// }

	/**
	* @method isCheckAll
	* @description used to select permission's
	*/
	// isCheckAll = () => {
	//     const { permissions } = this.state;
	//     const { moduleSelectList } = this.props;
	//     if (moduleSelectList && moduleSelectList != undefined) {
	//         return moduleSelectList.length - 1 == permissions.length ? true : false;
	//     }
	// }

	/**
	* @method renderModule
	* @description used to render module checkbox for roles permission
	*/
	// renderModule = () => {
	//     const { moduleSelectList } = this.props;

	//     return moduleSelectList && moduleSelectList.map((item, index) => {
	//         if (item.Value == 0) return false;
	//         return (
	//             <div>
	//                 <label
	//                     className="custom-checkbox"
	//                     onChange={() => this.moduleHandler(item.Value)}
	//                 >
	//                     {item.Text}
	//                     <input type="checkbox" value={item.Value} checked={this.isSelected(item.Value)} />
	//                     <span
	//                         className=" before-box"
	//                         checked={this.isSelected(item.Value)}
	//                         onChange={() => this.moduleHandler(item.Value)}
	//                     />
	//                 </label>
	//             </div>
	//         )
	//     })
	// }











	//Below code for Table rendering...... 

	/**
	* @method renderActionHeads
	* @description used to add more permission for user
	*/
	renderActionHeads = (actionHeads) => {
		return actionHeads && actionHeads.map((item, index) => {
			if (item.Value == 0) return false;
			return (
				<th className="crud-label">
					<div className={item.Text}></div>
					{item.Text}
				</th>
			)
		})
	}

	/**
	* @method moduleHandler
	* @description used to checked module
	*/
	moduleHandler = (index) => {
		//alert('hi')
		const { Modules, checkedAll } = this.state;
		const isModuleChecked = Modules[index].IsChecked;

		let actionArray = [];
		let tempArray = [];

		let actionRow = (Modules && Modules != undefined) ? Modules[index].Actions : [];
		if (isModuleChecked) {
			actionArray = actionRow && actionRow.map((item, index) => {
				item.IsChecked = false;
				return item;
			})

			tempArray = Object.assign([...Modules], { [index]: Object.assign({}, Modules[index], { IsChecked: false, Actions: actionArray }) })

			this.setState({ Modules: tempArray })
		} else {
			actionArray = actionRow && actionRow.map((item, index) => {
				item.IsChecked = true;
				return item;
			})

			tempArray = Object.assign([...Modules], { [index]: Object.assign({}, Modules[index], { IsChecked: true, Actions: actionArray }) })

			this.setState({ Modules: tempArray })
		}
	}

	/**
	* @method isCheckAll
	* @description used to select module's action row (Horizontally)
	*/
	isCheckAll = (parentIndex, actionData) => {
		const { actionSelectList } = this.props;

		let tempArray = actionData.filter(item => item.IsChecked == true)
		if (actionData && actionData != undefined) {
			return tempArray.length == actionSelectList.length - 1 ? true : false;
		}
	}

	selectAllHandler = (parentIndex, actionRows) => {
		const { Modules } = this.state;
		const { actionSelectList } = this.props;

		let checkedActions = actionRows.filter(item => item.IsChecked == true)

		let tempArray = [];
		let isCheckedSelectAll = (checkedActions.length == actionSelectList.length - 1) ? true : false;

		if (isCheckedSelectAll) {
			let actionArray = actionRows && actionRows.map((item, index) => {
				item.IsChecked = false;
				return item;
			})
			tempArray = Object.assign([...Modules], { [parentIndex]: Object.assign({}, Modules[parentIndex], { IsChecked: false, Actions: actionArray }) })
			this.setState({
				Modules: tempArray,
				//checkedAll: false,
			})
		} else {
			let actionArray = actionRows && actionRows.map((item, index) => {
				item.IsChecked = true;
				return item;
			})
			tempArray = Object.assign([...Modules], { [parentIndex]: Object.assign({}, Modules[parentIndex], { IsChecked: true, Actions: actionArray }) })
			this.setState({
				Modules: tempArray,
				//checkedAll: true
			})
		}
	}

	/**
	* @method renderAction
	* @description used to render row of actions
	*/
	renderAction = (actions, parentIndex) => {
		const { actionSelectList } = this.props;

		return actionSelectList && actionSelectList.map((el, i) => {
			return actions && actions.map((item, index) => {
				if (el.Text != item.ActionName) return false;
				return (
					<td className="text-center">
						{/* {<input
                            type="checkbox"
                            value={item.ActionId}
                            onChange={() => this.actionCheckHandler(parentIndex, index)}
                            checked={item.IsChecked}
                        />} */}
						{
							<label htmlFor="normal-switch">
								{/* <span>Switch with default style</span> */}
								<Switch
									onChange={() => this.actionCheckHandler(parentIndex, index)}
									checked={item.IsChecked}
									value={item.ActionId}
									id="normal-switch"
									onColor="#4DC771"
									onHandleColor="#ffffff"
									offColor="#959CB6"
									checkedIcon={false}
									uncheckedIcon={false}
									height={18}
									width={40}
								/>
							</label>
						}
					</td>
				)
			})
		})
	}

	/**
	* @method actionCheckHandler
	* @description Used to check/uncheck action's checkbox
	*/
	actionCheckHandler = (parentIndex, childIndex) => {
		const { Modules } = this.state;

		let checkedActions = Modules[parentIndex].Actions.filter(item => item.IsChecked == true)

		let actionRow = (Modules && Modules != undefined) ? Modules[parentIndex].Actions : [];
		let actionArray = actionRow && actionRow.map((el, index) => {
			if (childIndex == index) {
				el.IsChecked = !el.IsChecked
			}
			return el;
		})
		let tempArray = Object.assign([...Modules], { [parentIndex]: Object.assign({}, Modules[parentIndex], { Actions: actionArray }) })
		this.setState({ Modules: tempArray }, () => {
			const { Modules } = this.state;
			let aa = (Modules && Modules != undefined) ? Modules[parentIndex].Actions : [];
			let checkedActions = aa.filter(item => item.IsChecked == true)
			let abcd = checkedActions && checkedActions.length != 0 ? true : false;
			let tempArray1 = Object.assign([...Modules], { [parentIndex]: Object.assign({}, Modules[parentIndex], { IsChecked: abcd, Actions: actionArray }) })
			this.setState({ Modules: tempArray1 })
		})
	}

	/**
	* @method cancel
	* @description used to cancel role edit
	*/
	cancel = () => {
		const { reset } = this.props;
		reset();
		this.props.setEmptyRoleDataAPI('', () => { })
		this.setState({
			isEditFlag: false,
			Modules: [],
			RoleId: '',
		})
		this.getRolePermission()
	}

	/**
	 * @method resetForm
	 * @description used to Reset form
	 */
	resetForm = () => {
		const { reset } = this.props;
		reset();
		this.props.setEmptyRoleDataAPI('', () => { })
		this.setState({
			Modules: [],
			RoleId: '',
		})
		this.getRolePermission()
	}



	/**
	 * @name onSubmit
	 * @param values
	 * @desc Submit the signup form values.
	 * @returns {{}}
	 */
	onSubmit(values) {
		const { isEditFlag, Modules, RoleId } = this.state;
		const { reset } = this.props;

		//Validation for atleast 1 permission should be allowed for role, 
		//Should not be empty
		const checkedModules = Modules.filter(item => item.IsChecked == true)
		if (checkedModules.length == 0) {
			toastr.warning(MESSAGES.DEPARTMENT_EMPTY_ALERT)
			return false;
		}

		this.setState({ isLoader: true })
		values.Modules = Modules;

		let userDetail = userDetails()

		if (isEditFlag) {
			// Update existing role

			let formData = {
				RoleId: RoleId,
				IsActive: true,
				CreatedDate: '',
				RoleName: values.RoleName,
				Description: values.Description,
				Modules: this.state.Modules,
				CreatedDate: '',
				CreatedByName: userDetail.Name,
				CreatedBy: loggedInUserId(),
			}
			reset();
			this.props.updateRoleAPI(formData, (res) => {
				if (res.data.Result) {
					toastr.success(MESSAGES.UPDATE_ROLE_SUCCESSFULLY)
				}
				this.setState({
					isLoader: false,
					isEditFlag: false,
					Modules: [],
					isShowForm: false,
				})
				this.props.getAllRoleAPI(res => { })
				this.getRolePermission()
				this.props.setEmptyRoleDataAPI('', () => { })
				this.child.getUpdatedData();
			})
		} else {
			// Add new role
			this.props.addRoleAPI(values, (res) => {
				if (res && res.data && res.data.Result) {
					toastr.success(MESSAGES.ADD_ROLE_SUCCESSFULLY)
				}
				reset();
				this.props.getAllRoleAPI(res => { })
				this.getRolePermission()
				this.child.getUpdatedData();
				this.setState({ isLoader: false, Modules: [] })
			})
		}

	}


	render() {
		const { handleSubmit, pristine, reset, submitting, moduleSelectList, actionSelectList, loading } = this.props;
		const { isLoader, isSubmitted, permissions, isEditFlag } = this.state;

		return (
			<div>
				{isLoader && <Loader />}
				<div className="login-container signup-form ">
					<div className="row pt-30 mb-30">
						<div className="col-md-12" >
							<button
								type="button"
								className={'user-btn'}
								onClick={() => this.setState({ isShowForm: !this.state.isShowForm })}>
								<div className={'plus'}></div>{'ADD ROLE'}
							</button>
						</div>
						{this.state.isShowForm &&
							<div className="col-md-12">
								<div className="shadow-lgg login-formg ">
									<div className="form-headingg">
										<h2>{isEditFlag ? 'Update Role' : 'Add Role'}</h2>
									</div>
									<form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>
										<div className="row form-group role-form">
											<div className="col-md-6 ">
												<div className="row">
													<div className="col-md-3">
														<div class="header-title  Personal-Details"><h5>Role Name:</h5></div>
													</div>
													<Field
														name={"RoleName"}
														type="text"
														placeholder={'Enter'}
														validate={[required, alphabetsOnlyForName]}
														component={renderText}
														required={true}
														maxLength={26}
														customClassName={'withBorder col-md-5'}
													/>
												</div>

											</div>
											{/* <div className="input-group  col-md-6 input-withouticon">
                                    <Field
                                        label="Description"
                                        name={"Description"}
                                        type="text"
                                        placeholder={''}
                                        validate={[]}
                                        component={renderText}
                                        required={false}
                                        maxLength={100}
                                    />
                                </div> */}
											{/* <div className="input-group  col-md-6 input-withouticon">
                                    <label>Select Permission</label>
                                    <label
                                        className="custom-checkbox"
                                        onChange={this.selectAllHandler}
                                    >
                                        {'Select All'}
                                        <input type="checkbox" value={'All'} checked={this.isCheckAll()} />
                                        <span
                                            className=" before-box"
                                            checked={this.isCheckAll()}
                                            onChange={this.selectAllHandler}
                                        />
                                    </label>
                                    {this.renderModule()}
                                </div> */}

										</div>

										<div className="row form-group grant-user-grid">
											<div className="col-md-12">
												<Table className="table table-striped" size="sm" >
													<thead>
														<tr>
															<th>{`Module`}</th>
															<th>{``}</th>
															{this.renderActionHeads(actionSelectList)}
														</tr>
													</thead>
													<tbody >
														{this.state.Modules && this.state.Modules.map((item, index) => {
															return (
																<tr key={index}>

																	<td >{
																		<label
																			className="custom-checkbox"
																			onChange={() => this.moduleHandler(index)}
																		>
																			{item.ModuleName}
																			<input type="checkbox" value={'All'} checked={item.IsChecked} />
																			<span
																				className=" before-box"
																				checked={item.IsChecked}
																				onChange={() => this.moduleHandler(index)}
																			/>
																		</label>
																	}
																	</td>
																	<td className="select-all-block"> {<input
																		type="checkbox"
																		value={'All'}
																		className={this.isCheckAll(index, item.Actions) ? 'selected-box' : 'not-selected-box'}
																		checked={this.isCheckAll(index, item.Actions)}
																		onClick={() => this.selectAllHandler(index, item.Actions)} />}
																		<span>Select All</span>
																	</td>

																	{this.renderAction(item.Actions, index)}
																</tr>
															)
														})}
														{this.state.Modules.length == 0 && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
													</tbody>
												</Table>
											</div>
										</div>

										<div className="text-right btn-blue-block">
											{!isEditFlag &&
												// <input
												// 	disabled={pristine || submitting}
												// 	onClick={this.resetForm}
												// 	type="button"
												// 	value="Reset"
												// 	className="reset mr15 cancel-btn"
												// />
												<button
													disabled={pristine || submitting}
													onClick={this.resetForm}
													type="button"
													value="RESET"
													className="reset mr15 cancel-btn">
													<div className={'cross-icon'}><img src={require('../../assests/images/times.png')} alt='cancel-icon.jpg' /></div> RESET</button>}
											{isEditFlag &&
												// <input
												// 	//disabled={pristine || submitting}
												// 	onClick={this.cancel}
												// 	type="button"
												// 	value="Cancel"
												// 	className="reset mr15 cancel-btn"
												// />
												<button
													//disabled={pristine || submitting}
													onClick={this.cancel}
													type="button"
													value="Cancel"
													className="reset mr15 cancel-btn">
													<div className={'cross-icon'}><img src={require('../../assests/images/times.png')} alt='cancel-icon.jpg' /></div> Cancel</button>}
											{/* <input
												disabled={isSubmitted ? true : false}
												type="submit"
												value={isEditFlag ? 'Update' : 'Save'}
												className="btn-primary save-btn"
											/> */}
											<button
												disabled={isSubmitted ? true : false}
												type="submit"
												className="btn-primary save-btn"
											>	<div className={'check-icon'}><img src={require('../../assests/images/check.png')} alt='check-icon.jpg' />
												</div>
												{isEditFlag ? 'Update' : 'Save'}
											</button>
										</div>
									</form>
								</div>
							</div>}
					</div>
				</div>
				<RolesListing
					onRef={ref => (this.child = ref)}
					getRoleDetail={this.getRoleDetail}
				/>
			</div>
		);
	}
}


/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
const mapStateToProps = (state, ownProps) => {
	const { auth } = state;
	const { roleList, roleDetail, moduleSelectList, actionSelectList, loading } = auth;
	let initialValues = {};

	if (roleDetail && roleDetail != undefined) {
		initialValues = {
			RoleName: roleDetail.RoleName,
			Description: roleDetail.Description,
		}
	}

	return { loading, roleList, initialValues, moduleSelectList, actionSelectList };
};

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
	addRoleAPI,
	getAllRoleAPI,
	getRoleDataAPI,
	setEmptyRoleDataAPI,
	updateRoleAPI,
	getModuleSelectList,
	getActionHeadsSelectList,
	getModuleActionInit,
})(reduxForm({
	form: 'Role',
	enableReinitialize: true,
})(Role));