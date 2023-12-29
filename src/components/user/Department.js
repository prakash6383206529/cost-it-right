import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import Toaster from "../common/Toaster";
import { Loader } from "../common/Loader";
import { required, checkWhiteSpaces, acceptAllExceptSingleSpecialCharacter, maxLength80, checkSpacesInString, excludeOnlySpecialCharacter, maxLength50, hashValidation } from "../../helper/validation";
import { addDepartmentAPI, getDepartmentAPI, setEmptyDepartmentAPI, updateDepartmentAPI, addCompanyAPI, updateCompanyAPI } from "../../actions/auth/AuthActions";
import { MESSAGES } from "../../config/message";
import { Container, Row, Col } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import DayTime from "../common/DayTimeWrapper"
import { getConfigurationKey, loggedInUserId } from "../../helper";
import { TextFieldHookForm } from "../layout/HookFormInputs";
const Department = ({ DepartmentId, isEditFlag, anchor, isOpen, closeDrawer }) => {
	const dispatch = useDispatch();
	const { register, control, setValue, handleSubmit, getValues, reset, formState: { errors } } = useForm({
		mode: "onChange",
		reValidateMode: "onChange",
	});
	const { departmentDetail } = useSelector((state) => state.auth);

	const [state, setState] = useState({
		isLoader: false,
		isSubmitted: false,
		isEditFlag,
		isCompanyConfigurable: getConfigurationKey().IsCompanyConfigureOnPlant,
		dataToChange: null,
	});
	useEffect(() => {
		if (state.isEditFlag) {
			dispatch(getDepartmentAPI(DepartmentId, (res) => {
				const dataToChange = res?.data?.Data;
				// Set the values using setValue
				setValue("DepartmentName", dataToChange?.DepartmentName);
				setValue("DepartmentCode", dataToChange?.DepartmentCode);

				setState((prevState) => ({ ...prevState, dataToChange }));
			}));
		} else {
			dispatch(setEmptyDepartmentAPI('', () => { }));
		}
	}, []);

	/**
		* @method cancel
		* @description used to cancel role edit
		*/

	const cancel = () => {
		reset();
		dispatch(setEmptyDepartmentAPI('', () => { }));
		toggleDrawer('', 'cancel');
	};

	const toggleDrawer = (event, type) => {
		if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
			return;
		}
		closeDrawer('', type);
	};
	/**
	 * @name onSubmit
	 * @param values
	 * @desc Submit the signup form values.
	 * @returns {{}}
	 */

	const onSubmit = (values) => {
		console.log(values, "values")
		const formValues = getValues();
		console.log(formValues, "formValues");
		const { DepartmentName, DepartmentCode } = values;
		reset()

		setState((prevState) => ({ ...prevState, isLoader: true }));

		if (state.isEditFlag) {
			if (state.dataToChange?.DepartmentName === DepartmentName && state.dataToChange?.DepartmentCode === DepartmentCode) {
				toggleDrawer('', 'cancel');
				return false;
			}

			// Update existing department
			const formReq = {
				DepartmentId: DepartmentId,
				IsActive: true,
				CreatedDate: DayTime(new Date()).format('YYYY/MM/dd HH:mm:ss'),
				DepartmentName: DepartmentName ? DepartmentName.trim() : DepartmentName,
				DepartmentCode: DepartmentCode ? DepartmentCode.trim() : '',
				CompanyId: departmentDetail.CompanyId ? departmentDetail.CompanyId : '',
			};

			dispatch(updateDepartmentAPI(formReq, (res) => {
				if (res && res.data && res.data.Result) {
					if (state.isCompanyConfigurable) {
						Toaster.success(MESSAGES.UPDATE_COMPANY_SUCCESSFULLY);
					} else {
						Toaster.success(MESSAGES.UPDATE_DEPARTMENT_SUCCESSFULLY);
					}
				}
				reset();
				toggleDrawer('', 'submit');
				dispatch(setEmptyDepartmentAPI('', () => { }));
			}));
		} else {
			const depObj = {
				DepartmentName: DepartmentName ? DepartmentName.trim() : DepartmentName,
				DepartmentCode: DepartmentCode ? DepartmentCode.trim() : '',
				CompanyId: '',
				LoggedInUserId: loggedInUserId(),
			};

			dispatch(addDepartmentAPI(depObj, (res) => {
				if (res && res.data && res.data.Result) {
					Toaster.success(MESSAGES.ADD_DEPARTMENT_SUCCESSFULLY);
					reset();
					toggleDrawer('', 'submit');
				}
			}));
		}
	};

	console.log("required",required)
	console.log("checkSpacesInString",checkSpacesInString)
	console.log("checkWhiteSpaces",checkWhiteSpaces)
	return (
		<div>
		  {state.isLoader && <Loader />}
		  <Drawer className="add-department-drawer" anchor={anchor} open={isOpen}>
			<Container>
			  <div className={'drawer-wrapper'}>
				<form noValidate>
				  <Row className="drawer-heading">
					<Col>
					  <div className={'header-wrapper left'}>
						<h3>{isEditFlag ? `Update ${state.isCompanyConfigurable ? 'Company' : 'Department'}` : `Add ${state.isCompanyConfigurable ? 'Company' : 'Department'}`}</h3>
					  </div>
					  <div
						onClick={(e) => toggleDrawer(e, 'cancel')}
						className={'close-button right'}>
					  </div>
					</Col>
				  </Row>
				  <div className="drawer-body">
					<Row className="pr-0">
					  <div className="input-group col-md-12 input-withouticon">
						<TextFieldHookForm
						  label={"Name"}
						  rules={{
							required: true,
							validate: { acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, maxLength80, checkSpacesInString, hashValidation},
						  }}
						  handleChange={(e) => { }}
						  Controller={Controller}
						  control={control}
						  register={register}
						  name={"DepartmentName"}
						  defaultValue={""}
						  customClassName={'withBorder'}
						  mandatory
						  errors={errors?.DepartmentName && errors?.DepartmentName.message}

						/>
					  </div>
					  <div className="input-group col-md-12 input-withouticon">
						<TextFieldHookForm
						  label={"Code"}
						  name={"DepartmentCode"}
						  Controller={Controller}
						  control={control}
						  register={register}
						  mandatory
						  handleChange={(e) => { }}
						  customClassName={'withBorder'}
						  rules={{
							required: true,
							validate: {required, excludeOnlySpecialCharacter, checkWhiteSpaces, maxLength50, checkSpacesInString},
						  }}
						errors={errors?.DepartmentCode && errors?.DepartmentCode.message}
						/>
						
					  </div>
					  <div className="col-md-12">
						<div className="text-right mt-0">
						  <button
							onClick={cancel}
							type="button"
							value="CANCEL"
							className="mr15 cancel-btn">
							<div className={"cancel-icon"}></div>CANCEL
						  </button>
						  <button
							type="submit"
							disabled={state.isSubmitted ? true : false}
							className="user-btn save-btn"
							onClick={handleSubmit(onSubmit)}
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
};

export default Department;
