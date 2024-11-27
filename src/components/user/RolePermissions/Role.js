// eslint-disable-next-line react-hooks/exhaustive-deps
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { useDispatch } from "react-redux";
import Toaster from "../../common/Toaster";
import { Loader } from "../../common/Loader";
import {
	addRoleAPI,
	getAllRoleAPI,
	getRoleDataAPI,
	updateRoleAPI,
	setEmptyRoleDataAPI,
} from "../../../actions/auth/AuthActions";
import { MESSAGES } from "../../../config/message";
import { userDetails, loggedInUserId } from "../../../helper/auth";
import PermissionsTabIndex from "./PermissionsTabIndex";
import PopupMsgWrapper from "../../common/PopupMsgWrapper";
import TooltipCustom from "../../common/Tooltip";
import { TextFieldHookForm } from "../../layout/HookFormInputs";
import TourWrapper from "../../common/Tour/TourWrapper";
import { Steps } from "../TourMessages";
import { useTranslation } from 'react-i18next'

const Role = (props) => {
	const { t } = useTranslation("UserRegistration")
	const dispatch = useDispatch();
	const {
		handleSubmit,
		register,
		control,
		setValue,
		reset,
		formState: { errors },
	} = useForm({
		mode: "onChange",
		reValidateMode: "onChange",
	});
	const [isLoader, setIsLoader] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [isEditFlag, setIsEditFlag] = useState(false);
	const [RoleId, setRoleId] = useState("");
	const [Modules, setModules] = useState([]);
	const [isNewRole, setIsNewRole] = useState(true);
	const [showPopup, setShowPopup] = useState(false);
	const [accessibility, setAccessibility] = useState(false);
	const [updatedObj, setUpdatedObj] = useState({});
	const childRef = useRef();

	const getRoleDetail = useCallback(() => {
		const { data } = props;
		setIsLoader(true);
		dispatch(
			getRoleDataAPI(data.RoleId, (res) => {
				if (res && res.data && res.data.Data) {
					let Data = res.data.Data;
					setValue("RoleName", Data.RoleName);
					setModules(Data.Modules);
					setIsEditFlag(true);
					setIsNewRole(false);
					setRoleId(data.RoleId);
					setAccessibility(Data.IsDataAccessibleToAllRole);
					childRef.current.getUpdatedData(Data.Modules);
					setIsLoader(false);
				}
			})
		);
	}, []);

	useEffect(() => {
		const { data } = props;
		if (data && data.isEditFlag) {
			getRoleDetail();
		}
	}, []);

	const setInitialModuleData = (data) => {
		setModules(data);
	};

	const moduleDataHandler = (data, ModuleName) => {
		let oldData = data;
		let isSelectAll = true;

		let isParentChecked = oldData.findIndex((el) => el.IsChecked === true);

		if (ModuleName === "Costing" || ModuleName === "Simulation") {
			oldData &&
				oldData.map((ele, index) => {
					if (ele.Sequence !== 0) {
						if (ele.IsChecked === false) {
							isSelectAll = false;
						}
					}
					return null;
				});
		} else {
			oldData &&
				oldData.map((ele, index) => {
					if (ele.IsChecked === false) {
						isSelectAll = false;
					}
					return null;
				});
		}

		const isAvailable =
			Modules && Modules.findIndex((a) => a.ModuleName === ModuleName);

		if (isAvailable !== -1 && Modules) {
			let tempArray = Object.assign([...Modules], {
				[isAvailable]: Object.assign({}, Modules[isAvailable], {
					SelectAll: isSelectAll,
					IsChecked: isParentChecked !== -1 ? true : false,
					Pages: oldData,
				}),
			});
			setModules(tempArray);
		}
	};
	/**
	 * @method cancel
	 * @description used to cancel role edit
	 */

	const cancel = () => {
		reset();
		dispatch(setEmptyRoleDataAPI("", () => { }));
		setIsEditFlag(false);
		setModules([]);
		setRoleId("");
		props.hideForm();
	};

	const clearForm = () => {
		reset();
		setIsLoader(false);
		setIsEditFlag(false);
		setModules([]);
		dispatch(getAllRoleAPI((res) => { }));
		dispatch(setEmptyRoleDataAPI("", () => { }));
		props.hideForm();
	};

	const confirmUpdate = (updateData) => {
		setIsLoader(true);
		dispatch(
			updateRoleAPI(updateData, (res) => {
				if (res.data.Result) {
					Toaster.success(MESSAGES.UPDATE_ROLE_SUCCESSFULLY);
					clearForm();
				}
				setIsLoader(false);
			})
		);
	};
	/**
	 * @name onSubmit
	 * @param values
	 * @desc Submit the signup form values.
	 * @returns {{}}
	 */
	const onSubmit = (values) => {
		let userDetail = userDetails();
		if (isEditFlag) {
			let updateData = {
				RoleId: RoleId,
				IsActive: true,
				CreatedDate: "",
				CreatedByName: userDetail.Name,
				RoleName: values.RoleName,
				Description: "",
				CreatedBy: loggedInUserId(),
				Modules: Modules,
				IsDataAccessibleToAllRole: accessibility,
			};
			setShowPopup(true);
			setUpdatedObj(updateData);
		} else {
			const isSelected = Modules.filter((el) => el.IsChecked === true);

			if (isSelected.length < 1) {
				Toaster.warning("Please select at least one module.");
				return false;
			}

			let formData = {
				RoleName: values.RoleName,
				Description: "",
				CreatedBy: loggedInUserId(),
				Modules: Modules,
				IsDataAccessibleToAllRole: accessibility,
			};

			setIsLoader(true);
			dispatch(
				addRoleAPI(formData, (res) => {
					if (res && res.data && res.data.Result) {
						Toaster.success(MESSAGES.ADD_ROLE_SUCCESSFULLY);
						clearForm();
					}
					setIsLoader(false);
				})
			);
		}
	};

	const onPopupConfirm = () => {
		confirmUpdate(updatedObj);
	};

	const closePopUp = () => {
		setShowPopup(false);
	};

	const AccessibilityHandler = () => {
		setAccessibility(!accessibility);
	};

	return (
		<div className="container-fluid role-permision-page">
			{isLoader && <Loader />}
			<div className="login-container signup-form ">
				<div className="row">
					<div className="col-md-12">
						<div className="shadow-lgg login-formg ">
							<div className="form-headingg">
								<h2>{isEditFlag ? "Update Role" : "Add Role"}
									<TourWrapper
										buttonSpecificProp={{ id: "Add_Role_Form" }}
										stepsSpecificProp={{
											steps: Steps(t, { isEditFlag: isEditFlag }).ADD_ROLE
										}} />
								</h2>
							</div>
							<form
								className="form"
								onSubmit={handleSubmit(onSubmit)}
								noValidate
							>
								<div className="add-min-height">
									<div className="row role-form mb-0">
										<div className="col-md-6 ">
											<div className="d-flex">
												<div className="header-title d-flex Personal-Details pr-3">
													<h5>Role Name:</h5>
													<span className="asterisk-required">*</span>
												</div>
												<TextFieldHookForm
													id="AddRole_Name"
													label={"RoleName"}
													Controller={Controller}
													control={control}
													register={register}
													name={"RoleName"}
													defaultValue={""}

													customClassName={'withBorder'}
													mandatory
													errors={errors.RoleName}
													rules={{
														required: true,
													}}
													handleChange={(e) => { }}
												/>
												<label
													className={`custom-checkbox ml-2 mt-1`}
													onChange={AccessibilityHandler}
												>
													Accessibility to All Data
													<input
														type="checkbox"
														checked={accessibility}
														onChange={AccessibilityHandler}
													/>
													<span
														className=" before-box"
														checked={accessibility}
														onChange={AccessibilityHandler}
													/>
												</label>
												<TooltipCustom
													customClass="mt-2"
													id="all-data-tooltip"
													tooltipText={"All data will be visible to this role"}
												/>
											</div>
										</div>
									</div>

									<div className="row form-group grant-user-grid">
										<div className="col-md-12">
											{isLoader && <Loader />}
											<PermissionsTabIndex
												onRef={(ref) => (childRef.current = ref)}
												isEditFlag={props?.data?.isEditFlag}
												setInitialModuleData={setInitialModuleData}
												moduleData={moduleDataHandler}
												isNewRole={props?.data?.isNewRole}
												refVariable={true}
											/>
										</div>
									</div>
								</div>

								<div className="row sf-btn-footer no-gutters justify-content-between bottom-footer">
									<div className="col-sm-12 text-right bluefooter-butn">
										<button
											id="AddRole_Cancel"
											onClick={cancel}
											type="button"
											value="Cancel"
											className="mr15 cancel-btn"
										>
											<div className={"cancel-icon"}></div> Cancel
										</button>
										<button
											id="AddRole_Save"
											disabled={isSubmitted ? true : false}
											type="submit"
											className="user-btn save-btn"
										>
											<div className={"save-icon"}></div>
											{isEditFlag ? "Update" : "Save"}
										</button>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
			{showPopup && (
				<PopupMsgWrapper
					isOpen={showPopup}
					closePopUp={closePopUp}
					confirmPopup={onPopupConfirm}
					message={`${MESSAGES.ROLE_UPDATE_ALERT}`}
				/>
			)}
		</div>
	);
};

export default Role;
