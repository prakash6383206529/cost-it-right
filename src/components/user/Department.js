import React, { Component } from "react";
import { Field, reduxForm } from "redux-form";
import Toaster from "../common/Toaster";
import { connect } from "react-redux";
import { Loader } from "../common/Loader";
import { required, checkWhiteSpaces, acceptAllExceptSingleSpecialCharacter, maxLength80 } from "../../helper/validation";
import { renderText } from "../layout/FormInputs";
import "./UserRegistration.scss";
import { addDepartmentAPI, getDepartmentAPI, setEmptyDepartmentAPI, updateDepartmentAPI, addCompanyAPI, updateCompanyAPI } from "../../actions/auth/AuthActions";
import { MESSAGES } from "../../config/message";
import { Container, Row, Col } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import moment from "moment";
import { getConfigurationKey, userDetails } from "../../helper";

class Department extends Component {
	constructor(props) {
		super(props);
		this.child = React.createRef();
		this.state = {
			isLoader: false,
			isSubmitted: false,
			isEditFlag: false,
			isCompanyConfigurable: getConfigurationKey().IsCompanyConfigureOnPlant
		};
	}

	/**
	* @method componentDidMount
	* @description used to called after mounting component
	*/
	componentDidMount() {
		const { DepartmentId, isEditFlag } = this.props;
		if (isEditFlag) {
			this.props.getDepartmentAPI(DepartmentId, () => { })
		} else {
			this.props.setEmptyDepartmentAPI('', () => { })
		}

	}

	/**
	* @method cancel
	* @description used to cancel role edit
	*/
	cancel = () => {
		const { reset } = this.props;
		reset();
		this.props.setEmptyDepartmentAPI('', () => { })
		this.toggleDrawer('')
	}

	/**
	 * @method resetForm
	 * @description used to Reset form
	 */
	resetForm = () => {
		const { reset } = this.props;
		reset();
		this.props.setEmptyDepartmentAPI('', () => { })
	}

	toggleDrawer = (event) => {
		if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
			return;
		}

		this.props.closeDrawer('')
	};

	/**
	 * @name onSubmit
	 * @param values
	 * @desc Submit the signup form values.
	 * @returns {{}}
	 */
	onSubmit(values) {
		const { isEditFlag, DepartmentId, departmentDetail } = this.props;
		const { reset } = this.props;
		this.setState({ isLoader: true })

		if (isEditFlag) {

			// Update existing department
			let formReq = {
				DepartmentId: DepartmentId,
				IsActive: true,
				CreatedDate: moment(new Date()).format('YYYY/MM/dd HH:mm:ss'),
				DepartmentName: values.DepartmentName ? values.DepartmentName.trim() : values.DepartmentName,
				DepartmentCode: values.CompanyCode ? values.CompanyCode.trim() : '',
				CompanyId: departmentDetail.CompanyId ? departmentDetail.CompanyId : ''
			}
			let comObj = {
				CompanyId: departmentDetail.CompanyId,
				LoggedInUserId: userDetails().LoggedInUserId,
				CompanyName: values.DepartmentName ? values.DepartmentName.trim() : values.DepartmentName,
				CompanyCode: values.CompanyCode ? values.CompanyCode.trim() : ''
			}
			this.setState({isLoader:true})
			this.props.updateDepartmentAPI(formReq, (res) => {
				// IF COMPANY CONFIGURABLE IS TRUE
				if (res && res.data && res.data.Result) {
					if (this.state.isCompanyConfigurable) {
						this.props.updateCompanyAPI(comObj, () => {
							Toaster.success(MESSAGES.UPDATE_COMPANY_SUCCESSFULLY)
						})
					} else {
						// IF COMPANY CONFIGURABLE IS FALSE
						Toaster.success(MESSAGES.UPDATE_DEPARTMENT_SUCCESSFULLY)
					}
				}
				reset();
				this.toggleDrawer('')
				this.props.setEmptyDepartmentAPI('', () => { })
			})

		} else {

			let obj = {
				CompanyName: values.DepartmentName ? values.DepartmentName.trim() : '',
				CompanyCode: values.CompanyCode ? values.CompanyCode.trim() : ``
			}
			// IF COMPANY CONFIGURABLE KEY IS TRUE
			if (this.state.isCompanyConfigurable) {

				// ADD NEW COMPANY VIA DEPARTMENT
				this.props.addCompanyAPI(obj, (res) => {
					if (res && res.data && res.data.Result) {
						const id = res.data.Identity
						let formReq = {
							DepartmentName: values.DepartmentName ? values.DepartmentName.trim() : values.DepartmentName,
							DepartmentCode: values.CompanyCode ? values.CompanyCode.trim() : ``,
							CompanyId: id
						}
						this.props.addDepartmentAPI(formReq, (res) => {

							if (res && res.data && res.data.Result) {
								Toaster.success(MESSAGES.ADD_COMPANY_SUCCESSFULLY)
								reset();
								this.toggleDrawer('')
							}
						})
					}
				})
			} else {
				// IF COMPANY CONFIGURABLE KEY IS FALSE
				let depObj = {
					DepartmentName: values.DepartmentName ? values.DepartmentName.trim() : values.DepartmentName,
					DepartmentCode: values.CompanyCode ? values.CompanyCode.trim() : ``,
					CompanyId: ''
				}
				this.props.addDepartmentAPI(depObj, (res) => {
					if (res && res.data && res.data.Result) {
						Toaster.success(MESSAGES.ADD_DEPARTMENT_SUCCESSFULLY)
						reset();
						this.toggleDrawer('')
					}
				})
			}


		}

	}

	render() {
		const { handleSubmit, pristine, reset, submitting, isEditFlag } = this.props;
		const { isLoader, isSubmitted } = this.state;

		return (
			<div>
				{this.props.loading && <Loader />}
				<Drawer className="add-department-drawer" anchor={this.props.anchor} open={this.props.isOpen}
				//  onClose={(e) => this.toggleDrawer(e)}
				>
					<Container>
						<div className={'drawer-wrapper'}>
							<form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>

								<Row className="drawer-heading">
									<Col>
										<div className={'header-wrapper left'}>
											<h3>{isEditFlag ? `Update ${this.state.isCompanyConfigurable ? 'Company' : 'Department'}` : `Add ${this.state.isCompanyConfigurable ? 'Company' : 'Department'}`}</h3>
										</div>
										<div
											onClick={(e) => this.toggleDrawer(e)}
											className={'close-button right'}>
										</div>
									</Col>
								</Row>

								<div className="drawer-body">
									<Row className="pr-0">
										<div className="input-group col-md-12 input-withouticon" >
											<Field
												label="Name"
												name={"DepartmentName"}
												type="text"
												placeholder={''}
												validate={[required, acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, maxLength80]}
												component={renderText}
												required={true}
												maxLength={26}
												customClassName={'withBorder'}
											/>
										</div>
										{
											this.state.isCompanyConfigurable &&
											<div className="input-group col-md-12 input-withouticon" >
												<Field
													label="Code"
													name={"CompanyCode"}
													type="text"
													placeholder={''}
													validate={[required, acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, maxLength80]}
													component={renderText}
													required={true}
													customClassName={'withBorder'}
												/>
											</div>
										}

										<div className="col-md-12">
											<div className="text-right mt-0">
												{/* <input
													//disabled={pristine || submitting}
													onClick={this.cancel}
													type="button"
													value="Cancel"
													className="reset mr15 cancel-btn"
												/> */}
												<button
													//disabled={pristine || submitting}
													onClick={this.cancel}
													type="button"
													value="CANCEL"
													className="mr15 cancel-btn">
													<div className={"cancel-icon"}></div>CANCEL</button>
												{/* <input
													disabled={isSubmitted ? true : false}
													type="submit"
													value={this.state.isEditFlag ? 'Update' : 'Save'}
													className="submit-button mr5 save-btn"
												/> */}
												<button
													type="submit"
													disabled={isSubmitted ? true : false}
													className="user-btn save-btn"
												>	
												<div className={"save-icon"}></div>
													{isEditFlag ? 'Update' : 'Save'}
												</button>
											</div>
										</div>
									</Row>

								</div>
							</form>
						</div>
					</Container>
				</Drawer>
			</div>
		);
	}
}


/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
const mapStateToProps = ({ auth }) => {
	const { departmentDetail } = auth;
	let initialValues = {};

	if (departmentDetail && departmentDetail != undefined) {
		initialValues = {
			DepartmentName: departmentDetail.DepartmentName,
			CompanyCode: departmentDetail.DepartmentCode,
			Description: departmentDetail.Description,
		}
	}

	return { initialValues, departmentDetail };
};

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
	addDepartmentAPI,
	getDepartmentAPI,
	updateDepartmentAPI,
	setEmptyDepartmentAPI,
	addCompanyAPI,
	updateCompanyAPI
})(reduxForm({
	form: 'Department',
	enableReinitialize: true,
})(Department));
