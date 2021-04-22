import React, { Component } from "react";
import { Field, reduxForm } from "redux-form";
import { toastr } from "react-redux-toastr";
import { connect } from "react-redux";
import { Loader } from "../../common/Loader";
import { required, alphabetsOnlyForName, checkWhiteSpaces, acceptAllExceptSingleSpecialCharacter, maxLength80, } from "../../../helper/validation";
import { renderText } from "../../layout/FormInputs";
import "../UserRegistration.scss";
import {
	addRoleAPI, getAllRoleAPI, getRoleDataAPI, updateRoleAPI, setEmptyRoleDataAPI,
	getActionHeadsSelectList, getModuleActionInit,
} from "../../../actions/auth/AuthActions";
import { MESSAGES } from "../../../config/message";
import { } from 'reactstrap';
import { userDetails, loggedInUserId } from "../../../helper/auth";
import PermissionsTabIndex from "./PermissionsTabIndex";
import ConfirmComponent from "../../../helper/ConfirmComponent";

class Role extends Component {
	constructor(props) {
		super(props);
		this.child = React.createRef();
		this.state = {
			isLoader: false,
			isSubmitted: false,
			isEditFlag: false,
			activeTab: '1',
			permissions: [],
			checkedAll: false,
			RoleId: '',
			Modules: [],
			isNewRole: true,
		};
	}

	/**
	* @method componentDidMount
	* @description used to called after mounting component
	*/
	UNSAFE_componentWillMount() {
		const { data } = this.props;
		if (data && data.isEditFlag) {
			this.getRoleDetail()
		}
	}

	componentDidMount() {

	}

	/**
	* @method getRoleDetail
	* @description used to get role detail
	*/
	getRoleDetail = () => {
		const { data } = this.props;
		this.setState({ isLoader: true })
		this.props.getRoleDataAPI(data.RoleId, (res) => {
			if (res && res.data && res.data.Data) {
				let Data = res.data.Data;

				this.setState({
					isEditFlag: true,
					isNewRole: false,
					RoleId: data.RoleId,
					Modules: Data.Modules,
					isLoader: false,
				}, () => this.child.getUpdatedData(Data.Modules))

			}
		})
	}

	/**
		* @method toggle
		* @description toggling the tabs
		*/
	toggle = (tab) => {
		if (this.state.activeTab !== tab) {
			this.setState({
				activeTab: tab
			});
		}
	}

	/**
		* @method setInitialModuleData
		* @description SET INITIAL MODULE DATA FROM PERMISSION TAB
		*/
	setInitialModuleData = (data) => {
		this.setState({ Modules: data })
	}

	moduleDataHandler = (data, ModuleName) => {
		const { Modules } = this.state;
		let tempArray = [];
		let oldData = data;
		let isAnyChildChecked = data && data.map((item, i) => {
			let index = item.Actions.findIndex(el => el.IsChecked === true)
			if (index !== -1) {
				oldData[i].IsChecked = true;
				tempArray.push(index)
			}
		})

		let isParentChecked = oldData.findIndex(el => el.IsChecked === true)
		const isAvailable = Modules && Modules.findIndex(a => a.ModuleName === ModuleName)
		if (isAvailable !== -1 && Modules) {
			let tempArray = Object.assign([...Modules], { [isAvailable]: Object.assign({}, Modules[isAvailable], { IsChecked: isParentChecked !== -1 ? true : false, Pages: oldData, }) })
			this.setState({ Modules: tempArray })
		}
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
		//this.getRolePermission()
		this.props.hideForm()
	}

	clearForm = () => {
		const { reset } = this.props;
		reset();
		this.setState({
			isLoader: false,
			isEditFlag: false,
			Modules: [],
		})
		this.props.getAllRoleAPI(res => { })
		//this.getRolePermission()
		this.props.setEmptyRoleDataAPI('', () => { })
		this.props.hideForm()
	}

	/**
	* @method confirmUpdate
	* @description confirm Update
	*/
	confirmUpdate = (updateData) => {
		this.setState({ isLoader: true })
		this.props.updateRoleAPI(updateData, (res) => {
			if (res.data.Result) {
				toastr.success(MESSAGES.UPDATE_ROLE_SUCCESSFULLY)
				this.clearForm()
			}
			this.setState({ isLoader: false })
		})
	}

	/**
	 * @name onSubmit
	 * @param values
	 * @desc Submit the signup form values.
	 * @returns {{}}
	 */
	onSubmit(values) {
		const { isEditFlag, Modules, RoleId } = this.state;

		let userDetail = userDetails()

		if (isEditFlag) {

			let updateData = {
				RoleId: RoleId,
				IsActive: true,
				CreatedDate: '',
				CreatedByName: userDetail.Name,
				RoleName: values.RoleName,
				Description: '',
				CreatedBy: loggedInUserId(),
				Modules: Modules
			}

			const toastrConfirmOptions = {
				onOk: () => {
					this.confirmUpdate(updateData)
				},
				onCancel: () => this.clearForm(),
				component: () => <ConfirmComponent />
			};
			return toastr.confirm(`${MESSAGES.ROLE_UPDATE_ALERT}`, toastrConfirmOptions);


		} else {
			// Add new role

			const isSelected = Modules.filter(el => el.IsChecked === true)


			if (isSelected.length < 1) {
				toastr.warning("Please select atleast one module.")
				return false
			}

			let formData = {
				RoleName: values.RoleName,
				Description: '',
				CreatedBy: loggedInUserId(),
				Modules: Modules
			}

			this.setState({ isLoader: true })
			this.props.addRoleAPI(formData, (res) => {
				if (res && res.data && res.data.Result) {
					toastr.success(MESSAGES.ADD_ROLE_SUCCESSFULLY)
					this.clearForm()
				}
				this.setState({ isLoader: false })
			})
		}

	}

	render() {
		const { handleSubmit, } = this.props;
		const { isLoader, isSubmitted, isEditFlag } = this.state;

		return (
			<div className="container-fluid role-permision-page">
				{isLoader && <Loader />}
				<div className="login-container signup-form ">
					<div className="row">
						<div className="col-md-12">
							<div className="shadow-lgg login-formg ">
								<div className="form-headingg">
									<h2>{isEditFlag ? 'Update Role' : 'Add Role'}</h2>
								</div>
								<form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>
									<div className="add-min-height">
										<div className="row role-form mb-0">
											<div className="col-md-6 ">
												<div className="d-flex">

													<div class="header-title  Personal-Details pr-3"><h5>Role Name:</h5></div>

													<Field
														name={"RoleName"}
														type="text"
														placeholder={'Enter'}
														validate={[required, acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, maxLength80]}
														component={renderText}
														required={true}
														maxLength={26}
														customClassName={'withBorder mb-0 mn-height-auto hide-text-help-mb-0'}
													/>
												</div>
											</div>
										</div>

										<div className="row form-group grant-user-grid">
											<div className="col-md-12">
												<PermissionsTabIndex
													onRef={ref => (this.child = ref)}
													isEditFlag={this.state.isEditFlag}
													setInitialModuleData={this.setInitialModuleData}
													moduleData={this.moduleDataHandler}
													isNewRole={this.state.isNewRole}
												/>
											</div>
										</div>
									</div>

									<div className="row sf-btn-footer no-gutters justify-content-between bottom-footer">
										<div className="col-sm-12 text-right bluefooter-butn">
											<button
												//disabled={pristine || submitting}
												onClick={this.cancel}
												type="button"
												value="Cancel"
												className="mr15 cancel-btn">
												<div className={'cross-icon'}><img src={require('../../../assests/images/times.png')} alt='cancel-icon.jpg' /></div> Cancel</button>
											<button
												disabled={isSubmitted ? true : false}
												type="submit"
												className="user-btn save-btn"
											>	<div className={'check-icon'}><img src={require('../../../assests/images/check.png')} alt='check-icon.jpg' />
												</div>
												{isEditFlag ? 'Update' : 'Save'}
											</button>
										</div>
									</div>
								</form>
							</div>
						</div>
					</div>
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
const mapStateToProps = (state, ownProps) => {
	const { auth } = state;
	const { roleList, roleDetail, actionSelectList, loading } = auth;
	let initialValues = {};

	if (roleDetail && roleDetail !== undefined) {
		initialValues = {
			RoleName: roleDetail.RoleName,
			Description: roleDetail.Description,
		}
	}

	return { loading, roleList, initialValues, actionSelectList };
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
	getActionHeadsSelectList,
	getModuleActionInit,
})(reduxForm({
	form: 'Role',
	enableReinitialize: true,
})(Role));