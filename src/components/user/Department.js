import React, { Component } from "react";
import { Field, reduxForm } from "redux-form";
import { langs } from "../../config/localization";
import { toastr } from "react-redux-toastr";
import { connect } from "react-redux";
import { Loader } from "../common/Loader";
import { required, alphabetsOnlyForName, number } from "../../helper/validation";
import { renderText } from "../layout/FormInputs";
import "./UserRegistration.scss";
import { addDepartmentAPI, getDepartmentAPI, setEmptyDepartmentAPI, updateDepartmentAPI } from "../../actions/auth/AuthActions";
import { MESSAGES } from "../../config/message";
import { Container, Row, Col, Button, Table } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';

class Department extends Component {
	constructor(props) {
		super(props);
		this.child = React.createRef();
		this.state = {
			isLoader: false,
			isSubmitted: false,
			isEditFlag: false,
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
		const { isEditFlag, DepartmentId } = this.props;
		const { reset } = this.props;
		this.setState({ isLoader: true })

		if (isEditFlag) {

			// Update existing department
			let formReq = {
				DepartmentId: DepartmentId,
				IsActive: true,
				CreatedDate: '',
				DepartmentName: values.DepartmentName,
				Description: values.Description,
			}
			this.props.updateDepartmentAPI(formReq, (res) => {
				if (res && res.data && res.data.Result) {
					toastr.success(MESSAGES.UPDATE_DEPARTMENT_SUCCESSFULLY)
				}
				reset();
				this.toggleDrawer('')
				this.props.setEmptyDepartmentAPI('', () => { })
			})

		} else {

			// Add new department
			this.props.addDepartmentAPI(values, (res) => {
				if (res && res.data && res.data.Result) {
					toastr.success(MESSAGES.ADD_DEPARTMENT_SUCCESSFULLY)
				}
				reset();
				this.toggleDrawer('')
			})

		}

	}

	render() {
		const { handleSubmit, pristine, reset, submitting, isEditFlag } = this.props;
		const { isLoader, isSubmitted } = this.state;

		return (
			<div>
				{this.props.loading && <Loader />}
				<Drawer className="add-department-drawer" anchor={this.props.anchor} open={this.props.isOpen} onClose={(e) => this.toggleDrawer(e)}>
					<Container>
						<div className={'drawer-wrapper'}>
							<form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>

								<Row className="drawer-heading">
									<Col>
										<div className={'header-wrapper left'}>
											<h3>{isEditFlag ? 'Update Department' : 'Add Department'}</h3>
										</div>
										<div
											onClick={(e) => this.toggleDrawer(e)}
											className={'close-button right'}>
										</div>
									</Col>
								</Row>

								<div className="drawer-body">
									<Row>
										<div className="input-group col-md-12 input-withouticon" >
											<Field
												label="Department Name"
												name={"DepartmentName"}
												type="text"
												placeholder={''}
												validate={[required, alphabetsOnlyForName]}
												component={renderText}
												required={true}
												maxLength={26}
												customClassName={'withBorder'}
											/>
										</div>

										<div className="col-md-12">
											<div className="text-right mt-30">
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
													className="reset mr15 cancel-btn">
													<div className={'cross-icon'}><img src={require('../../assests/images/times.png')} alt='cancel-icon.jpg' /></div>CANCEL</button>
												{/* <input
													disabled={isSubmitted ? true : false}
													type="submit"
													value={this.state.isEditFlag ? 'Update' : 'Save'}
													className="submit-button mr5 save-btn"
												/> */}
												<button
													type="submit"
													disabled={isSubmitted ? true : false}
													className="btn-primary save-btn"
												>	<div className={'check-icon'}><img src={require('../../assests/images/check.png')} alt='check-icon.jpg' />
													</div>
													{this.state.isEditFlag ? 'Update' : 'Save'}
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
})(reduxForm({
	form: 'Department',
	enableReinitialize: true,
})(Department));
