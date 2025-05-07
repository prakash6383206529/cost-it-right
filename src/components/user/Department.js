import React, { Component } from "react";
import { Field, reduxForm } from "redux-form";
import Toaster from "../common/Toaster";
import { connect } from "react-redux";
import { Loader } from "../common/Loader";
import { required, checkWhiteSpaces, acceptAllExceptSingleSpecialCharacter, checkSpacesInString, excludeOnlySpecialCharacter, maxLength50, hashValidation, maxLength75, getNameBySplitting, getCodeBySplitting } from "../../helper/validation";
import { focusOnError, renderText, renderMultiSelectField, validateForm } from "../layout/FormInputs";

import { addDepartmentAPI, getDepartmentAPI, setEmptyDepartmentAPI, updateDepartmentAPI, addCompanyAPI, updateCompanyAPI, addDivisionAPI, updateDivisionAPI, getDivisionAPI, getDivisionListAPI } from "../../actions/auth/AuthActions";
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
			divisionId: 0,
			divisions: [],
			divisionSelectAll: [],
			isApplyDivision: false,
			isAssociated: false
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
		this.props.getDivisionListAPI((res) => {
			if (res?.status === 204) {
				this.setState({ divisionSelectAll: [] });
			} else if (res?.status === 200 && res?.data?.Result) {
				let list = res?.data?.DataList?.filter(element => String(element?.DivisionId) !== '0')
				let temp = []
				list?.forEach((item) => {
					if (String(item?.Value) === '0') return false
					temp.push({ Text: item.DivisionNameCode, Value: item.DivisionId, DivisionName: item.DivisionName, DivisionCode: item.DivisionCode })
					return temp
				})
				this.setState({ divisionSelectAll: temp })
			} else {
				Toaster.errors(res?.data?.Message);
			}
		})
		if (isEditFlag) {

			if (this.props.isDivision) {
				this.props.getDivisionAPI(DepartmentId, (res) => {
					
					let Data = res?.data?.Data
					if (res?.status === 204) {
						this.setState({ DataToChange: null, selectedPlants: [] });
					} else {

						this.setState({ DataToChange: Data, selectedPlants: [], divisionId: Data?.DivisionId, })
						this.props.change("DivisionCode", Data?.DivisionCode)
						this.props.change("DivisionName", Data?.DivisionName)

					}
					this.setState({ isLoader: false })
				})
			} else {
				this.props.getDepartmentAPI(DepartmentId, (res) => {
					
					
					if (res?.status === 204) {
						this.setState({ DataToChange: null, selectedPlants: [] });
					}
					else if (res && res?.status === 200 && res?.data?.Result) {
						this.setState({ isAssociated: res?.data?.Data?.IsAssociated })
						let plantArray = []
						res?.data?.Data?.PlantList && res?.data?.Data?.PlantList?.map((item) => {
							plantArray.push({ Text: `${item.PlantName ?? ''} (${item.PlantCode ?? ''})`, Value: (item?.PlantId ?? '')?.toString() })
							return null;
						})
						let divisionArray = []
						res?.data?.Data?.DivisionList?.map(item => {
							divisionArray.push({ Text: `${item.DivisionName ?? ''} (${item.DivisionCode ?? ''})`, Value: item.DivisionId, DivisionName: item.DivisionName, DivisionCode: item.DivisionCode })
							return null
						})
						this.props.change("DivisionList", divisionArray)
						this.setState({ DataToChange: res?.data?.Data, selectedPlants: plantArray, divisions: divisionArray, isApplyDivision: res?.data?.Data?.IsDivision })
						this.props.change("plant", plantArray)
					}

					this.setState({ isLoader: false })

				})
			}
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
		const { DataToChange, selectedPlants, isApplyDivision, divisions } = this.state;
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
		let divisionArray = []
		divisions && divisions.map(item => {
			let obj = {
				DivisionId: item?.Value,
				DivisionName: item?.DivisionName,
				DivisionCode: item?.DivisionCode,
			}
			divisionArray.push(obj)
		})

		if (isEditFlag) {
			const hasChanges = 
			DataToChange?.DepartmentName !== values?.DepartmentName?.trim() ||
			DataToChange?.DepartmentCode !== values?.DepartmentCode?.trim() ||
			JSON.stringify(selectedPlants) !== JSON.stringify(DataToChange?.PlantList) ||
			isApplyDivision !== DataToChange?.IsDivision ||
			JSON.stringify(divisions) !== JSON.stringify(DataToChange?.DivisionList);
		 if (!hasChanges) {
			this.toggleDrawer('', 'cancel');
			return false;
		}
			// Update existing department
			let formReq = {}
			if (this.props.isDivision) {
				formReq = {
					"LoggedInUserId": loggedInUserId(),
					"DivisionCode": values.DivisionCode,
					"DivisionName": values.DivisionName,
					"DivisionId": this.state.divisionId,
				}
			} else {
				formReq = {
					LoggedInUserId: loggedInUserId(),
					DepartmentId: DepartmentId,
					IsActive: true,
					CreatedDate: DayTime(new Date()).format('YYYY/MM/dd HH:mm:ss'),
					DepartmentName: values.DepartmentName ? values.DepartmentName.trim() : values.DepartmentName,
					DepartmentCode: values.DepartmentCode ? values.DepartmentCode.trim() : '',
					CompanyId: departmentDetail.CompanyId ? departmentDetail.CompanyId : '',
					PlantList: plantArray,
					IsDivision: isApplyDivision,
					DivisionList: divisionArray
				}
			}

			this.setState({ isLoader: true })
			if (this.props.isDivision) {
				this.props.updateDivisionAPI(formReq, (res) => {
					if (res && res.data && res.data.Result) {
						Toaster.success(MESSAGES.UPDATE_DIVISION_SUCCESSFULLY)
					}
					reset();
					this.toggleDrawer('', 'submit')
					this.setState({ isLoader: false })
				})
			} else {
				this.props.updateDepartmentAPI(formReq, (res) => {
					// IF COMPANY CONFIGURABLE IS TRUE
					if (res && res.data && res.data.Result) {
						Toaster.success(MESSAGES.UPDATE_DEPARTMENT_SUCCESSFULLY)
					}
					reset();
					this.toggleDrawer('', 'submit')
					this.props.setEmptyDepartmentAPI('', () => { })
				})
			}

		} else {
			let ojb = {}
			if (this.props.isDivision) {
				ojb = {
					"LoggedInUserId": loggedInUserId(),
					"DivisionCode": values.DivisionCode,
					"DivisionName": values.DivisionName
				}
			} else {
				ojb = {
					DepartmentName: values.DepartmentName ? values.DepartmentName.trim() : values.DepartmentName,
					DepartmentCode: values.DepartmentCode ? values.DepartmentCode.trim() : ``,
					CompanyId: '',
					LoggedInUserId: loggedInUserId(),
					PlantList: plantArray,
					DivisionList: divisionArray,
					IsDivision: isApplyDivision,
				}
			}
			if (this.props.isDivision) {
				this.props.addDivisionAPI(ojb, (res) => {
					if (res && res.data && res.data.Result) {
						Toaster.success(MESSAGES.ADD_DIVISION_SUCCESSFULLY)
						reset();
						this.toggleDrawer('', 'submit')
						this.props.setEmptyDepartmentAPI('', () => { })
					}
					this.setState({ isLoader: false })
				})
			} else {
				this.props.addDepartmentAPI(ojb, (res) => {
					if (res && res.data && res.data.Result) {
						Toaster.success(MESSAGES.ADD_DEPARTMENT_SUCCESSFULLY)
						reset();
						this.toggleDrawer('', 'submit')
					}
				})
			}
		}
	}
	/**
   * @method renderListing
   * @description Used to show type of listing
   */
	renderListing = (label) => {
		const { plantSelectList, divisionList } = this.props
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
		if (label === 'division') {
			divisionList?.forEach((item) => {
				if (String(item?.DivisionId) === '0') {
					temp.push({ Text: "Select All", Value: item?.DivisionId });
				} else {
					temp.push({ Text: item.DivisionNameCode, Value: item.DivisionId, DivisionName: item.DivisionName, DivisionCode: item.DivisionCode })
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
	handleDivision = (newValue) => {
		const { divisionSelectAll } = this.state
		if (newValue?.filter(element => String(element?.Value) === '0')?.length > 0) {
			this.setState({ divisions: divisionSelectAll })
		} else {
			this.setState({ divisions: newValue })
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
	checkboxHandler = (e) => {
		this.setState({ isApplyDivision: e.target.checked })
	}
	render() {
		const { handleSubmit, isEditFlag, t } = this.props;
		const { isSubmitted, isApplyDivision } = this.state;
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
											<h3>{isEditFlag ? `Update ${this.props.isDivision ? "Division" : handleDepartmentHeader()}` : `Add ${this.props.isDivision ? "Division" : handleDepartmentHeader()}`}
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
												name={this.props.isDivision ? "DivisionName" : "DepartmentName"}
												type="text"
												placeholder={''}
												validate={[required, acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, maxLength75, checkSpacesInString, hashValidation]}
												component={renderText}
												required={true}
												customClassName={'withBorder'}
												disabled={this.state.isAssociated}
											/>
										</div>
										{<div className="input-group col-md-12 input-withouticon">
											<Field
												label="Code"
												name={this.props.isDivision ? "DivisionCode" : "DepartmentCode"}
												type="text"
												placeholder={''}
												validate={[required, excludeOnlySpecialCharacter, checkWhiteSpaces, maxLength50, checkSpacesInString]}
												component={renderText}
												required={true}
												customClassName={'withBorder'}
												disabled={this.state.isAssociated}
											/>
										</div>}
										{getConfigurationKey().IsDivisionAllowedForDepartment && <>
											{!this.props.isDivision && !getConfigurationKey().IsShowDivisionSelectionDropDownInManageDepartment && <Col md="6" className="d-flex align-items-center mb-2">
												<span className="d-inline-block">
													<label
														className={`custom-checkbox mb-0`}
														onChange={this.checkboxHandler}>
														Apply Division
														<input
															type="checkbox"
															checked={isApplyDivision}
														/>
														<span
															className=" before-box"
															checked={isApplyDivision}
															onChange={this.checkboxHandler}
														/>
													</label>
												</span>
											</Col>}
											{!this.props.isDivision && getConfigurationKey().IsShowDivisionSelectionDropDownInManageDepartment && <div className="input-group col-md-12 input-withouticon">
												<Field
													label="Division (Code)"
													name="Division"
													placeholder={"Select"}
													selection={this.state.divisions == null || this.state.divisions.length === 0 ? [] : this.state.divisions}
													options={this.renderListing("division")}
													selectionChanged={this.handleDivision}
													validate={[]}
													required={false}
													optionValue={(option) => option.Value}
													optionLabel={(option) => option.Text}
													component={renderMultiSelectField}
													mendatory={false}
													className="multiselect-with-border"
												/>
											</div>}
										</>}

										{!this.props.isDivision && getConfigurationKey().IsPlantsAllowedForDepartment && <div className="input-group col-md-12 input-withouticon">
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
	const { departmentDetail, divisionList } = auth;
	let initialValues = {};
	const { plantSelectList } = comman
	if (departmentDetail && departmentDetail !== undefined) {
		initialValues = {
			DepartmentName: departmentDetail.DepartmentName,
			DepartmentCode: departmentDetail.DepartmentCode,
			Description: departmentDetail.Description,
		}
	}

	return { initialValues, departmentDetail, plantSelectList, divisionList };
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
	getPlantSelectListByType,
	addDivisionAPI,
	updateDivisionAPI,
	getDivisionAPI,
	getDivisionListAPI
})(reduxForm({
	form: 'Department',
	validate: validateForm,
	enableReinitialize: true,
	touchOnChange: true,
	onSubmitFail: errors => {
		focusOnError(errors);
	},
})(withTranslation(['UserRegistration'])(Department)));
