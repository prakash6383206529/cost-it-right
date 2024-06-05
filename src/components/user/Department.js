import React, { Component } from "react";
import { Field, reduxForm } from "redux-form";
import Toaster from "../common/Toaster";
import { connect } from "react-redux";
import { Loader } from "../common/Loader";
import { required, checkWhiteSpaces, acceptAllExceptSingleSpecialCharacter, checkSpacesInString, excludeOnlySpecialCharacter, maxLength50, hashValidation, maxLength75, getNameBySplitting, getCodeBySplitting } from "../../helper/validation";
import { focusOnError, renderText, renderMultiSelectField } from "../layout/FormInputs";

import { addDepartmentAPI, getDepartmentAPI, setEmptyDepartmentAPI, updateDepartmentAPI, addCompanyAPI, updateCompanyAPI } from "../../actions/auth/AuthActions";
import { MESSAGES } from "../../config/message";
import { Container, Row, Col } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import DayTime from "../common/DayTimeWrapper"
import { getConfigurationKey, handleDepartmentHeader, loggedInUserId } from "../../helper";
import { ZBC } from "../../config/constants";
import { getPlantSelectListByType } from "../../actions/Common";
import TourWrapper from "../common/Tour/TourWrapper";
import { Steps } from "./TourMessages";
import { withTranslation } from "react-i18next";

class Department extends Component {
	constructor(props) {
		super(props);
		this.child = React.createRef();
		this.state = {
			isLoader: false,
			isSubmitted: false,
			isEditFlag: false,
			selectedPlants: [],
			plantSelectAll: [],
		};
	}

	/**
	* @method componentDidMount
	* @description used to called after mounting component
	*/
	componentDidMount() {
		const { DepartmentId, isEditFlag } = this.props;
		this.setState({ isLoader: true });

		this.props.getPlantSelectListByType(ZBC, "", '', (res) => {
			if (res?.status === 204) {
				this.setState({ plantSelectAll: [] });
			} else if (res?.status === 200 && res?.data?.Result) {           
				let list = res?.data?.DataList?.filter(element => element?.Value !== '0')
				let temp = []
				list?.forEach((item) => {
					if (item?.PlantId === '0') return false
					temp.push({ Text: item.PlantNameCode, Value: item.PlantId })
					return temp
				})
				this.setState({ plantSelectAll: temp })
			} else {
				Toaster.errors(res?.data?.Message);
			}
		})
		if (isEditFlag) {


			this.props.getDepartmentAPI(DepartmentId, (res) => {
				if (res?.status === 204) {
					this.setState({ DataToChange: null, selectedPlants: [] });
				}
				else if (res && res?.status === 200 && res?.data?.Result) {
					let plantArray = []
					res?.data?.Data?.PlantList && res?.data?.Data?.PlantList?.map((item) => {
						plantArray.push({ Text: `${item.PlantName ?? ''} (${item.PlantCode ?? ''})`, Value: (item?.PlantId ?? '')?.toString() })
						return null;
					})


					this.setState({ DataToChange: res?.data?.Data, selectedPlants: plantArray })
					this.props.change("plant", plantArray)
				}

				this.setState({ isLoader: false })

			})
		} else {


			this.props.setEmptyDepartmentAPI('', (res) => {
				if (res?.status === 204) {
					this.setState({ DataToChange: null, selectedPlants: [] });
					return false
				}
				this.setState({ isLoader: false })
			})
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
		this.toggleDrawer('', 'cancel')
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

	toggleDrawer = (event, type) => {
		if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
			return;
		}

		this.props.closeDrawer('', type)
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
		const { DataToChange, selectedPlants } = this.state;
		this.setState({ isLoader: true })

		let plantArray = []
		selectedPlants && selectedPlants.map(item => {
			let obj = {
				PlantId: item?.Value,
				PlantName: getNameBySplitting(item?.Text),
				PlantCode: getCodeBySplitting(item?.Text),
			}
			plantArray.push(obj)
		})
		if (isEditFlag) {
			if (DataToChange?.DepartmentName === values?.DepartmentName && DataToChange?.DepartmentCode === values?.DepartmentCode && (JSON.stringify(selectedPlants) === JSON.stringify(DataToChange?.PlantList))) {
				this.toggleDrawer('', 'cancel')
				return false
			}
			// Update existing department
			let formReq = {
				DepartmentId: DepartmentId,
				IsActive: true,
				CreatedDate: DayTime(new Date()).format('YYYY/MM/dd HH:mm:ss'),
				DepartmentName: values.DepartmentName ? values.DepartmentName.trim() : values.DepartmentName,
				DepartmentCode: values.DepartmentCode ? values.DepartmentCode.trim() : '',
				CompanyId: departmentDetail.CompanyId ? departmentDetail.CompanyId : '',
				PlantList: plantArray,
			}
			this.setState({ isLoader: true })
			this.props.updateDepartmentAPI(formReq, (res) => {
				// IF COMPANY CONFIGURABLE IS TRUE
				if (res && res.data && res.data.Result) {
					Toaster.success(MESSAGES.UPDATE_DEPARTMENT_SUCCESSFULLY)
				}
				reset();
				this.toggleDrawer('', 'submit')
				this.props.setEmptyDepartmentAPI('', () => { })
			})

		} else {

			let depObj = {
				DepartmentName: values.DepartmentName ? values.DepartmentName.trim() : values.DepartmentName,
				DepartmentCode: values.DepartmentCode ? values.DepartmentCode.trim() : ``,
				CompanyId: '',
				LoggedInUserId: loggedInUserId(),
				PlantList: plantArray,
			}
			this.props.addDepartmentAPI(depObj, (res) => {
				if (res && res.data && res.data.Result) {
					Toaster.success(MESSAGES.ADD_DEPARTMENT_SUCCESSFULLY)
					reset();
					this.toggleDrawer('', 'submit')
				}
			})
		}
	}
	/**
   * @method renderListing
   * @description Used to show type of listing
   */
	renderListing = (label, isScrapRateUOM) => {
		const { plantSelectList } = this.props
		const temp = []
		if (label === 'plant') {

			plantSelectList?.forEach((item) => {
				if (item?.PlantId === '0') {
					temp.push({ Text: "Select All", Value: item?.PlantId });
				} else {
					temp.push({ Text: item.PlantNameCode, Value: item.PlantId })
				}
			});

			const isSelectAllOnly = temp.length === 1 && temp[0]?.Text === "Select All" && temp[0]?.Value === "0";

			if (isSelectAllOnly) {
				return [];
			} else {
				return temp;
			}
		}

	}

	handlePlant = (newValue) => {
		const { plantSelectAll } = this.state
		if (newValue?.filter(element => element?.Value === '0')?.length > 0) {
			this.setState({ selectedPlants: plantSelectAll })
		} else {
			this.setState({ selectedPlants: newValue })
		}
	}
	render() {
		const { handleSubmit, isEditFlag, t } = this.props;
		const { isSubmitted } = this.state;
		return (
			<div>
				<Drawer className="add-department-drawer" anchor={this.props.anchor} open={this.props.isOpen}
				//  onClose={(e) => this.toggleDrawer(e)}
				>
					<Container>
						{this.state.isLoader && <Loader />}
						<div className={'drawer-wrapper'}>
							<form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>

								<Row className="drawer-heading">
									<Col>
										<div className={'header-wrapper left'}>
											<h3>{isEditFlag ? `Update ${handleDepartmentHeader()}` : `Add ${handleDepartmentHeader()}`}
												<TourWrapper
													buttonSpecificProp={{ id: "Add_Department_Form" }}
													stepsSpecificProp={{
														steps: Steps(t, { isEditFlag: isEditFlag }).ADD_COMPANY
													}} />
											</h3>

										</div>
										<div
											onClick={(e) => this.toggleDrawer(e, 'cancel')}
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
												validate={[required, acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, maxLength75, checkSpacesInString, hashValidation]}
												component={renderText}
												required={true}
												customClassName={'withBorder'}
											/>
										</div>
										{<div className="input-group col-md-12 input-withouticon">
											<Field
												label="Code"
												name={"DepartmentCode"}
												type="text"
												placeholder={''}
												validate={[required, excludeOnlySpecialCharacter, checkWhiteSpaces, maxLength50, checkSpacesInString]}
												component={renderText}
												required={true}
												customClassName={'withBorder'}
											/>
										</div>}
										{getConfigurationKey().IsPlantsAllowedForDepartment && <div className="input-group col-md-12 input-withouticon">
											<Field
												label="Plant (Code)"
												name="plant"
												placeholder={"Select"}
												selection={this.state.selectedPlants == null || this.state.selectedPlants.length === 0 ? [] : this.state.selectedPlants}
												options={this.renderListing("plant")}
												selectionChanged={this.handlePlant}
												validate={
													this.state.selectedPlants == null || this.state.selectedPlants.length === 0 ? [required] : []}
												required={true}
												optionValue={(option) => option.Value}
												optionLabel={(option) => option.Text}
												component={renderMultiSelectField}
												mendatory={true}
												className="multiselect-with-border"
											/>
										</div>}

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
													id="AddDepartment_Cancel"
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
													id="AddDepartment_Save"
													type="submit"
													disabled={isSubmitted ? true : false}
													className="user-btn save-btn"
												>
													<div className={"save-icon"}></div>
													{isEditFlag ? 'Update' : 'Save'}
												</button>
											</div>
										</div>
									</Row >

								</div >
							</form >
						</div >
					</Container >
				</Drawer >
			</div >
		);
	}
}


/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
const mapStateToProps = (state) => {
	const { comman, auth } = state
	const { departmentDetail } = auth;
	let initialValues = {};
	const { plantSelectList } = comman
	if (departmentDetail && departmentDetail !== undefined) {
		initialValues = {
			DepartmentName: departmentDetail.DepartmentName,
			DepartmentCode: departmentDetail.DepartmentCode,
			Description: departmentDetail.Description,
		}
	}

	return { initialValues, departmentDetail, plantSelectList };
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
	updateCompanyAPI,
	getPlantSelectListByType
})(reduxForm({
	form: 'Department',
	enableReinitialize: true,
	touchOnChange: true,
	onSubmitFail: errors => {
		focusOnError(errors);
	},
})(withTranslation(['UserRegistration'])(Department)));
