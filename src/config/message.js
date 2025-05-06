import React from "react";
import TooltipCustom from "../components/common/Tooltip";
import { getConfigurationKey, handleDepartmentHeader, showBopLabel } from "../helper";

export const MESSAGES = {
  INVALID_EMAIL_PASSWORD: 'Either email or password is invalid or your account is inactive',
  SOME_ERROR: 'Opps! Something went wrong. Please try again later',
  //LOGIN_SUCCESS: 'You are successfully logged in', --- Remove Toaster at this step
  //LOGOUT_SUCCESS: 'You are successfully logged out', --- Remove Toaster at this step
  UPDATE_PASSWORD_SUCCESS: 'Your password updated successfully',
  NOT_VERIFIED_USER: 'Your account is pending for verification. Please verify your account for login',

  //PART MASTERS
  PART_ADD_SUCCESS: 'Part added successfully',
  PRODUCT_ADD_SUCCESS: 'Product added successfully',
  ASSEMBLY_PART_ADD_SUCCESS: 'Assembly part added successfully',
  PART_DELETE_SUCCESS: 'Part deleted successfully',
  PRODUCT_DELETE_SUCCESS: 'Product deleted successfully',
  UPDATE_PART_SUCESS: 'Part updated successfully',
  UPDATE_PRODUCT_SUCESS: 'Product updated successfully',
  MESSAGE_SENT_EXCEPT_USER: 'Message sent except the user',
  CONFIRM_DELETE: 'Are you sure you want to delete this part?',
  CONFIRM_PRODUCT_DELETE: 'Are you sure you want to delete this product?',

  PLANT_ADDED_SUCCESS: 'Plant created successfully',
  SUPPLIER_ADDED_SUCCESS: 'Vendor added successfully',

  BOM_ADD_SUCCESS: 'Bill of material added successfully',
  BOM_DELETE_ALERT: 'Are you sure you want to delete this assembly part?',
  DELETE_BOM_SUCCESS: 'Assembly Part deleted successfully',
  UPDATE_BOM_SUCCESS: 'Assembly Part updated successfully',
  PART_DELETE_SUCCESSFULLY: 'Assembly Part deleted successfully',

  //UOM
  UOM_ADD_SUCCESS: 'Unit of measurement added successfully',
  UPDATE_UOM_SUCESS: 'Unit of measurement updated successfully',
  DELETE_UOM_SUCCESS: 'Unit of measurement deleted successfully',
  UOM_ACTIVE_SUCCESSFULLY: 'UOM activated successfully',
  UOM_INACTIVE_SUCCESSFULLY: 'UOM de-activated successfully',

  //CATEGORY MASTER
  CATEGORY_TYPE_ADDED_SUCCESS: 'Category type added successfully',
  CATEGORY_TYPE_UPDATE_SUCCESS: 'Category type updated successfully',
  CATEGORY_TYPE_DELETE_ALERT:
    'Are you sure you want to delete this category type?',
  DELETE_CATEGORY_TYPE_SUCCESS: 'Category type deleted successfully',
  CATEGORY_UPDATE_SUCCESS: 'Category updated successfully',
  CATEGORY_DELETE_ALERT: 'Are you sure you want to delete this category?',
  DELETE_CATEGORY_SUCCESS: 'Category deleted successfully',

  //CATEGORY (RAW MATERIAL)
  CATEGORY_ADD_SUCCESS: 'Category created successfully',

  //OTHER OPERATION
  OTHER_OPERATION_ADD_SUCCESS: 'Other operation added successfully',
  OTHER_OPERATION_DELETE_ALERT: 'Are you sure you want to delete other operation?',
  DELETE_OTHER_OPERATION_SUCCESS: 'Other operation deleted successfully',

  //CED OTHER OPERATION
  CED_OTHER_OPERATION_ADD_SUCCESS: 'CED other operation added successfully',
  CED_OTHER_OPERATION_DELETE_ALERT: 'Are you sure you want to delete this CED other operation?',
  DELETE_CED_OTHER_OPERATION_SUCCESS: 'CED other operation deleted successfully',
  CED_OTHER_OPERATION_UPDATE_SUCCESS: 'CED other operation updated successfully',

  //OPERATION
  OPERATION_ADD_SUCCESS: 'Operation added successfully',
  OPERATION_UPDATE_SUCCESS: 'Operation updated successfully',
  OPERATION_DELETE_ALERT: 'Are you sure you want to delete this operation?',
  DELETE_OPERATION_SUCCESS: 'Operation deleted successfully',

  //RAW MATERIAL
  MATERIAL_ADD_SUCCESS: 'Raw material details added successfully',
  MATERIAL_TYPE_DELETE_ALERT: 'Are you sure you want to delete this material type?',
  DELETE_MATERIAL_TYPE_SUCCESS: 'Material type deleted successfully',
  RAW_MATERIAL_DETAIL_DELETE_ALERT: 'Are you sure you want to delete this raw material detail?',
  DELETE_RAW_MATERIAL_SUCCESS: 'Raw Material details deleted successfully',
  RAW_MATERIAL_DETAILS_UPDATE_SUCCESS: 'Raw material details updated successfully',

  //INDEXATION
  COMMODITYNAME_ADD_SUCCESS: 'Commodity added successfully',
  COMMODITYNAME_UPDATE_SUCCESS: 'Commodity updated successfully',
  COMMODITYNAME_DELETE_ALERT: 'Are you sure you want to delete this commodity?',
  DELETE_COMMODITYNAME_SUCCESS: 'Commodity deleted successfully',

  //RM GRADE
  GRADE_ADD_SUCCESS: 'RM grade added successfully',
  RM_GRADE_DELETE_ALERT: 'Are you sure you want to delete this grade?',
  RM_GRADE_UPDATE_SUCCESS: 'RM grade updated successfully',
  DELETE_RM_GRADE_SUCCESS: 'Grade deleted successfully',

  //RM SPECIFICATION
  SPECIFICATION_ADD_SUCCESS: 'RM specification added successfully',
  SPECIFICATION_DELETE_ALERT: 'Are you sure you want to delete this RM specification?',
  DELETE_SPECIFICATION_SUCCESS: 'RM specification deleted successfully',
  SPECIFICATION_UPDATE_SUCCESS: 'RM specification updated successfully',

  //MATERIAL
  MATERIAL_ADDED_SUCCESS: 'Material added successfully',
  MATERIAL_UPDATE_SUCCESS: 'Material updated successfully',
  MATERIAL_DELETE_ALERT: 'Are you sure you want to delete this Raw material?',
  MATERIAL1_DELETE_ALERT: 'Are you sure you want to delete this  material?',
  DELETE_MATERIAL_SUCCESS: 'Raw material deleted successfully',
  ASSOCIATED_ADDED_SUCCESS: 'Raw Material associated successfully.',
  FREIGHT_ADDED_SUCCESS: 'Freight added successfully',

  //FERROUSCALCULATOR 
  FERROUSCALCULATOR_RESET_RM: 'Calculated value will get reset. Do you want to continue ?',
  FERROUSCALCULATOR_UNUSED_RM: 'Rm which are not used will be get deleted from the grid',
  //INDEXATION
  INDEX_ADD_SUCCESS: 'Record added successfully',
  INDEX_DELETE_ALERT: 'Are you sure you want to delete this record?',
  INDEX_DELETE_SUCCESS: 'Record(s) deleted successfully',
  INDEX_UPDATE_SUCCESS: 'Record updated successfully',
  DELETE: 'Are you sure you want to delete this record?',
  DELETE_ALL: 'Are you sure you want to delete the selected record(s)?',

  //OVERHEAD AND PROFIT
  OVERHEAD_ADDED_SUCCESS: 'Overhead added successfully',
  PROFIT_ADDED_SUCCESS: 'Profit added successfully',
  OVERHEAD_UPDATE_SUCCESS: 'Overhead updated successfully',
  PROFIT_UPDATE_SUCCESS: 'Profit updated successfully',
  OVERHEAD_DELETE_ALERT: 'Are you sure you want to delete this Overhead Detail?',
  PROFIT_DELETE_ALERT: 'Are you sure you want to delete this Profit Detail?',
  DELETE_OVERHEAD_SUCCESS: 'Overhead deleted successfully',
  DELETE_PROFIT_SUCCESS: 'Profit deleted successfully',
  OVERHEAD_ACTIVE_SUCCESSFULLY: 'Overhead activated successfully',
  OVERHEAD_INACTIVE_SUCCESSFULLY: 'Overhead de-activated successfully',
  PROFIT_ACTIVE_SUCCESSFULLY: 'Profit active successfully',
  PROFIT_INACTIVE_SUCCESSFULLY: 'Profit inactive successfully',

  //REJECTION
  REJECTION_ADDED_SUCCESS: 'Rejection added successfully',
  REJECTION_UPDATE_SUCCESS: 'Rejection updated successfully',

  //DEPRECIATION
  DEPRECIATION_ADD_SUCCESS: 'Depreciation added successfully',
  DEPRECIATION_DELETE_ALERT: 'Are you sure you want to delete this depreciation?',
  DEPRECIATION_DELETE_SUCCESS: 'Depreciation deleted successfully',
  DEPRECIATION_UPDATE_SUCCESS: 'Depreciation updated successfully',

  //PLANT
  DELETE_PLANT_SUCCESS: 'Plant deleted successfully',
  UPDATE_PLANT_SUCESS: 'Plant updated successfully',
  PLANT_DELETE_ALERT: 'Are you sure you want to delete this plant?',
  PLANT_DELETE_SUCCESSFULLY: 'Plant deleted successfully',
  PLANT_ACTIVE_SUCCESSFULLY: 'Plant activated successfully',
  PLANT_INACTIVE_SUCCESSFULLY: 'Plant de-activated successfully',
  PLANT_DEACTIVE_ALERT: 'Are you sure you want to de-activate this plant?',
  PLANT_ACTIVE_ALERT: 'Are you sure you want to activate this plant?',

  //PROCESS
  DELETE_PROCESS_SUCCESS: 'Process deleted successfully',
  UPDATE_PROCESS_SUCCESS: 'Process updated successfully',
  PROCESS_ADD_SUCCESS: 'Process added successfully',
  PROCESS_DELETE_ALERT: 'Are you sure you want to delete this process?',
  PROCESS_DELETE_SUCCESSFULLY: 'Process deleted successfully',

  //DELETE_BOP_SUCCESS: 'Bought out part deleted successfully', where is this used ?
  DELETE_FREIGHT_SUCCESS: 'Freight deleted successfully',
  UPDATE_FREIGHT_SUCESS: 'Freight updated successfully',

  //LABOUR MASTER
  LABOUR_ADDED_SUCCESS: 'Labour added successfully',
  DELETE_LABOUR_SUCCESS: 'Labour deleted successfully',
  LABOUR_DELETE_ALERT: 'Are you sure you want to delete this labour?',
  UPDATE_LABOUR_SUCCESS: 'Labour updated successfully',

  //SUPPLIER OR VENDOR
  DELETE_SUPPLIER_SUCCESS: 'Vendor deleted successfully',
  UPDATE_SUPPLIER_SUCESS: 'Vendor updated successfully',
  VENDOR_ACTIVE_ALERT: 'Are you sure you want to activate this vendor?',
  VENDOR_DEACTIVE_ALERT: 'Are you sure you want to de-activate this vendor?',
  VENDOR_ACTIVE_SUCCESSFULLY: 'Vendor activated successfully',
  VENDOR_INACTIVE_SUCCESSFULLY: 'Vendor de-activated successfully',

  //BOP MASTER
  // ADD_BOP_SUCCESS: 'BOP added successfully', kitna baar BOP ko success karoge
  BOP_ADD_SUCCESS: `${showBopLabel()} added successfully`,
  BOP_CATEGORY_ADD_SUCCESS: `${showBopLabel()} category added successfully`,
  UPDATE_BOP_SUCESS: `${showBopLabel()} updated successfully`,
  BOP_DELETE_ALERT: `Are you sure you want to delete this ${showBopLabel()}?`,
  BOP_DELETE_SUCCESS: `${showBopLabel()} deleted successfully`,
  BOP_BREAKUP_WARNING: `${showBopLabel()} with breakup will be visible in Approval Status tab until it's costing is approved.`,

  //SAPCODE
  SAP_CODE_WARNING: "Click on edit icon again to save the data.",
  //FUEL & POWER MASTER
  FUEL_DETAIL_ADD_SUCCESS: 'Fuel detail added successfully',
  FUEL_ADD_SUCCESS: 'Fuel added successfully',
  UPDATE_FUEL_DETAIL_SUCESS: 'Fuel detail updated successfully',
  FUEL_DELETE_ALERT: 'Are you sure you want to delete this fuel?',
  FUEL_DETAIL_DELETE_ALERT: 'Are you sure you want to delete this fuel detail?',
  DELETE_FUEL_DETAIL_SUCCESS: 'Fuel detail deleted successfully',
  DELETE_FUEL_TYPE_SUCCESS: 'Fuel type deleted successfully',
  POWER_DETAIL_ADD_SUCCESS: 'Power detail added successfully',
  POWER_DELETE_ALERT: 'Are you sure you want to delete this power?',
  POWER_DELETE_SUCCESS: 'Power deleted  successfully',
  POWER_ADDED_SUCCESS: 'Power added successfully',
  UPDATE_POWER_SUCESS: 'Power updated  successfully',

  POWER_ADD_SUCCESS: 'Power added successfully',
  UPDATE_POWER_DETAIL_SUCESS: 'Power detail updated successfully',
  POWER_DETAIL_DELETE_ALERT: 'Are you sure you want to delete this power detail?',
  DELETE_POWER_SUCCESS: 'Power detail deleted successfully',

  //INTEREST
  INTEREST_RATE_ADDED_SUCCESS: 'Interest rate added successfully',
  UPDATE_INTEREST_RATE_SUCESS: 'Interest rate updated successfully',
  DELETE_INTEREST_RATE_SUCCESS: 'Interest rate deleted successfully',
  INTEREST_DELETE_ALERT: 'Are you sure you want to delete this Interest Rate?',

  ADD_PART_WITH_SUPPLIER_SUCCESS: 'Supplier added s uccessfully',
  NEW_COSTING_CREATE_SUCCESS: 'New sheetmetal costing created successfully',
  WEIGHT_ADD_SUCCESS: 'Weight specification added successfully',
  BOM_DELETE_SUCCESS: 'BOM deleted successfully',
  SAVE_OTHER_OPERATION_SUCCESS: 'Other Operation saved successfully',
  SAVE_PROCESS_COSTING_SUCCESS: 'Process costing saved successfully',
  SAVE_BOP_COSTING_SUCCESS: 'Bought Out Part costing saved successfully',
  UPDATE_COSTING_OTHER_OPERATION_SUCCESS: 'Other Operation updated successfully',
  COSTING_HAS_BEEN_DRAFTED_SUCCESSFULLY: 'Costing drafted successfully',
  SELECT_PART_FOR_ZBC_COSTING: 'Please select part for zbc costing',
  CANCEL_COSTING_ALERT: 'Are you sure you want to cancel this costing?',

  //MACHINE MASTER
  DELETE_MACHINE_SUCCESS: 'Machine deleted successfully',
  MACHINE_DELETE_ALERT: 'Are you sure you want to delete this Machine?',
  UPDATE_MACHINE_SUCCESS: 'Machine updated successfully',
  COPY_MACHINE_POPUP: "Are you sure you want to copy this Machine?",
  COPY_MACHINE_SUCCESS: 'Machine copied successfully',

  //MACHINE TYPE
  MACHINE_TYPE_ADD_SUCCESS: 'Machine type added successfully',
  UPDATE_MACHINE_TYPE_SUCESS: 'Machine type updated successfully',
  MACHINE_ADD_SUCCESS: 'Machine added successfully',
  DELETE_MACHINE_TYPE_SUCCESS: 'Machine type deleted successfully',
  MACHINE_TYPE_DELETE_ALERT: 'Are you sure you want to delete this machine type?',
  MACHINE_DETAILS_ADD_SUCCESS: 'Machine details added successfully',
  UPDATE_MACHINE_DETAILS_SUCCESS: 'Machine details updated successfully',

  //REASON MASTER
  REASON_ADD_SUCCESS: 'Reason added successfully',
  UPDATE_REASON_SUCESS: 'Reason updated successfully',
  REASON_DELETE_ALERT: 'Are you sure you want to delete this reason?',
  DELETE_REASON_SUCCESSFULLY: 'Reason deleted successfully',
  REASON_ACTIVE_SUCCESSFULLY: 'Reason activated successfully',
  REASON_INACTIVE_SUCCESSFULLY: 'Reason de-activated successfully',
  REASON_ACTIVE_ALERT: 'Are you sure you want to activate this reason?',
  REASON_DEACTIVE_ALERT: 'Are you sure you want to de-activate this reason?',

  //USER
  ADD_USER_SUCCESSFULLY: 'User added successfully',
  DELETE_USER_SUCCESSFULLY: 'User deleted successfully',
  USER_ACTIVE_SUCCESSFULLY: 'User activated successfully',
  USER_INACTIVE_SUCCESSFULLY: 'User de-activated successfully',
  USER_DEACTIVE_ALERT: 'Are you sure you want to de-activate this user?',
  USER_ACTIVE_ALERT: 'Are you sure you want to activate this user?',
  USER_DELETE_ALERT: 'Are you sure you want to delete this User?',
  UPDATE_USER_SUCCESSFULLY: 'User updated successfully',

  //ROLE
  ADD_ROLE_SUCCESSFULLY: 'Role added successfully',
  UPDATE_ROLE_SUCCESSFULLY: 'Role updated successfully',
  DELETE_ROLE_SUCCESSFULLY: 'Role deleted successfully',
  ROLE_DELETE_ALERT: 'Are you sure you want to delete this role?',
  ROLE_UPDATE_ALERT: 'This will change the permissions for all the users associated with this role. Do you want to continue?',
  ROLE_DEACTIVE_ALERT: 'Are you sure you want to de-activate this role?',
  ROLE_ACTIVE_ALERT: 'Are you sure you want to activate this role?',
  ROLE_ACTIVE_SUCCESSFULLY: 'Role activated successfully',
  ROLE_INACTIVE_SUCCESSFULLY: 'Role de-activated successfully',

  //Part
  PART_DEACTIVE_ALERT: 'Are you sure you want to de-activate this part?',
  PART_ACTIVE_ALERT: 'Are you sure you want to activate this part?',
  PART_ACTIVE_SUCCESSFULLY: 'Part activated successfully',
  PART_INACTIVE_SUCCESSFULLY: 'Part de-activated successfully',

  //Part Family
  PART_FAMILY_DEACTIVE_ALERT: 'Are you sure you want to de-activate this part family?',
  PART_FAMILY_ACTIVE_ALERT: 'Are you sure you want to activate this part family?',
  PART_FAMILY_ACTIVE_SUCCESSFULLY: 'Part family activated successfully',
  PART_FAMILY_INACTIVE_SUCCESSFULLY: 'Part family de-activated successfully',

  //DEPARTMENT
  DEPARTMENT_DELETE_ALERT: `Are you sure you want to delete this ${handleDepartmentHeader()}?`,
  ADD_DEPARTMENT_SUCCESSFULLY: `${handleDepartmentHeader()} added successfully`,
  UPDATE_DEPARTMENT_SUCCESSFULLY: `${handleDepartmentHeader()} updated successfully`,
  DELETE_DEPARTMENT_SUCCESSFULLY: `${handleDepartmentHeader()} deleted successfully`,

  //DIVISION
  DIVISION_DELETE_ALERT: `Are you sure you want to delete this division?`,
  ADD_DIVISION_SUCCESSFULLY: `Division added successfully`,
  UPDATE_DIVISION_SUCCESSFULLY: `Division updated successfully`,
  DELETE_DIVISION_SUCCESSFULLY: `Division deleted successfully`,

  //LEVEL
  ADD_LEVEL_SUCCESSFULLY: 'User level added successfully',
  UPDATE_LEVEL_SUCCESSFULLY: 'Level updated successfully',
  DELETE_LEVEL_SUCCESSFULLY: 'Level deleted successfully',
  LEVEL_DELETE_ALERT: 'Are you sure you want to delete this level?',
  ADD_LEVEL_USER_SUCCESSFULLY: 'Level of users added successfully',

  //LEVEL FOR TECHNOLOGY
  ADD_LEVEL_TECHNOLOGY_USER_SUCCESSFULLY: 'Level of technology added successfully',
  UPDATE_LEVEL_TECHNOLOGY_USER_SUCCESSFULLY: 'Level of technology updated successfully',

  //LEVEL FOR ONBOARDING
  ADD_LEVEL_ONBOARDING_USER_SUCCESSFULLY: 'Level of onboarding added successfully',
  UPDATE_LEVEL_ONBOARDING_USER_SUCCESSFULLY: 'Level of onboarding updated successfully',

  //FREIGHT
  ADD_FREIGHT_SUCCESSFULLY: 'Freight added successfully',
  UPDATE_FREIGHT_SUCCESSFULLY: 'Freight updated successfully',
  DELETE_FREIGHT_SUCCESSFULLY: 'Freight deleted successfully',
  FREIGHT_DELETE_ALERT: 'Are you sure you want to delete this Freight?',
  TRUCK_DIMENSIONS_UPDATE_SUCCESS: 'Truck dimensions updated successfully',
  TRUCK_DIMENSIONS_ADD_SUCCESS: 'Truck dimensions saved successfully',


  //ADDITIONAL FREIGHT
  ADDITIONAL_FREIGHT_ADD_SUCCESS: 'Packaging added successfully',
  DELETE_ADDITIONAL_FREIGHT_SUCCESS: 'Additional Freight deleted successfully',
  WEIGHT_SPEC_UPDATE_SUCCESS: 'Weight specification updated successfully',
  WEIGHT_SPEC_ADDED_SUCCESS: 'Weight specification added successfully',
  SELECT_SUPPLIER_BEFORE_ADD_VALUE: 'Please add supplier before adding value',
  SOB_LESS_THAN_100: 'SOB should be less than 100%',
  SOB_GREATER_THAN_ZERO: 'SOB should be greater than 0',
  COSTING_SAVED_SUCCESSFULLY: 'Costing saved successfully',
  COSTING_SENT_FOR_APPROVAL_SUCCESSFULLY: 'Costing sent for approval',
  SELECT_PLANT_FOR_COSTING: 'Plant should not be empty',
  REASSIGN_COSTING_SUCCESS_MESSAGE: 'Costing reassigned successfully',
  COSTING_CANCEL_SUCCESS_MESSAGE: 'Costing cancelled successfully',

  //PRIVILEGE
  ADD_PRIVILEGE_PAGE_SUCCESSFULLY: 'Privilege page added successfully',
  ADD_PRIVILEGE_PAGE_ROLEWISE_SUCCESSFULLY: 'Privilege page role wise added successfully',
  ADD_PRIVILEGE_PAGE_USERWISE_SUCCESSFULLY: 'Privilege page user wise added successfully',
  ADDITIONAL_PERMISSION_ADDED_SUCCESSFULLY: 'Additional permission added successfully',

  //MHR
  MHR_DELETE_ALERT: 'Are you sure,  you want to delete this machine rate?',
  DELETE_MHR_SUCCESS: 'Machine rate deleted successfully',
  MHR_MASTER_ADD_SUCCESS: 'Machine rate added successfully',
  UPDATE_MHR_SUCCESSFULLY: 'Machine rate updated successfully',

  //COPY COSTING
  COPY_COSTING_SUCCESS: 'Costing copied successfully',

  //DEPARATMENT EMPTY
  DEPARTMENT_EMPTY_ALERT: 'Permission should not be empty',

  //VOLUME MASTER
  VOLUME_ADD_SUCCESS: 'Actual/Budget Volume created successfully',
  VOLUME_DELETE_ALERT: 'Are you sure you want to delete this volume?',
  DELETE_VOLUME_SUCCESS: 'Volume deleted successfully',
  VOLUME_UPDATE_SUCCESS: 'Actual/Budget Volume updated successfully',

  //BUDGET MASTER
  BUDGET_ADD_SUCCESS: 'Budget created successfully',
  BUDGET_UPDATE_SUCCESS: 'Budget updated successfully',
  BUDGET_DELETE_ALERT: 'Are you sure you want to delete this budget?',
  DELETE_BUDGET_SUCCESS: 'Budget deleted successfully',

  //CLIENT MASTER
  CLIENT_ADD_SUCCESS: 'Customer added successfully',
  CLIENT_DELETE_ALERT: 'Are you sure you want to delete this Customer?',
  DELETE_CLIENT_SUCCESS: 'Customer deleted successfully',
  CLIENT_UPDATE_SUCCESS: 'Customer updated successfully',

  //EXCHANGE MASTER
  EXCHANGE_ADD_SUCCESS: 'Exchange Rate added successfully',
  EXCHANGE_UPDATE_SUCCESS: 'Exchange updated successfully',
  EXCHANGE_DELETE_ALERT: 'Are you sure you want to delete this Exchange Rate?',
  DELETE_EXCHANGE_SUCCESS: 'Exchange Rate deleted successfully',

  //TAX MASTER
  TAX_ADD_SUCCESS: 'Tax Details added successfully',
  TAX_UPDATE_SUCCESS: 'Tax Details updated successfully',
  TAX_DELETE_ALERT: 'Are you sure you want to delete this Tax Details?',
  DELETE_TAX_SUCCESS: 'Tax Details deleted successfully',

  //OUTSOURCING MASTER
  OUTSOURCING_ADD_SUCCESS: 'Outsourcing added successfully',
  UPDATE_OUTSOURCING_SUCESS: 'Outsourcing updated successfully',
  OUTSOURCING_ACTIVE_SUCCESSFULLY: 'Outsourcing activated successfully',
  OUTSOURCING_INACTIVE_SUCCESSFULLY: 'Outsourcing de-activated successfully',
  OUTSOURCING_ACTIVE_ALERT: 'Are you sure you want to activate this outsourcing?',
  OUTSOURCING_DEACTIVE_ALERT: 'Are you sure you want to de-activate this outsourcing?',

  //MESSAGES FOR COSTING TABS SUCCESS
  OVERHEAD_PROFIT_COSTING_SAVE_SUCCESS: 'Overhead & Profit saved successfully.',
  OTHER_DISCOUNT_COSTING_SAVE_SUCCESS: 'Discount & Other Cost saved successfully.',
  PACKAGE_FREIGHT_COSTING_SAVE_SUCCESS: 'Packaging & Freight Cost saved successfully.',
  FREIGHT_COSTING_SAVE_SUCCESS: 'Freight Cost has been successfully saved.',
  SURFACE_TREATMENT_COSTING_SAVE_SUCCESS: 'Surface Treatment Cost saved successfully.',
  TOOL_TAB_COSTING_SAVE_SUCCESS: 'Tool Cost saved successfully.',
  RMCC_TAB_COSTING_SAVE_SUCCESS: `RM CC ${showBopLabel()} Cost saved successfully.`,
  RMCC_TAB_COSTING_SAVE_SUCCESS_IS_BOP_BREAKUP: 'RM CC Cost saved successfully.',
  COSTING_DELETE_ALERT: 'Are you sure you want to delete costing?',
  SIMULATION_TOOLCOST_POPUP_MESSAGE: 'ICC,Overhead and Profit will not get change if tool cost are included in them, respectively, in the costing. Do you wish to continue?',

  //RFQ
  RFQ_ADD_SUCCESS: 'RFQ details added successfully',
  RFQ_UPDATE_SUCCESS: 'RFQ details updated successfully',
  RFQ_SENT_SUCCESS: 'RFQ raised successfully',
  RFQ_DETAIL_CANCEL_ALERT: 'Are you sure you want to cancel this RFQ?',

  //SIMULATION
  DELETE_SIMULATION_DRAFT_TOKEN: 'Are you sure you want to delete simulation token ?',
  REPUSH_DONE_SUCCESSFULLY: 'Repush has been done successfully',						//RE

  // COMMON MESSAGES 
  DOWNLOADING_MESSAGE: 'Please wait while data is downloading',
  LOADING_MESSAGE: 'Please wait while loading',
  CANCEL_MASTER_ALERT: 'Are you sure, you want to cancel?',
  ASYNC_MESSAGE_FOR_DROPDOWN: 'Enter first 3 characters to search data',

  //ERROR MESSAGES
  PRICE_VALIDATION_MESSAGE: `Maximum length for integer is ${Number(getConfigurationKey().NoOfDecimalForPrice)} and for decimal is ${Number(getConfigurationKey().NoOfDecimalForPrice)}.`,
  OTHER_VALIDATION_ERROR_MESSAGE: `Maximum length for integer is ${Number(getConfigurationKey().NoOfDecimalForInputOutput)} and for decimal is ${Number(getConfigurationKey().NoOfDecimalForInputOutput)}.`,

  // NFR
  NFR_APPROVED: 'NFR is approved successfully',
  NFR_REJECTED: 'NFR is rejected successfully',
  NFR_PUSHED: 'NFR is pushed successfully',
  BOP_RM_PUSHED: 'Pushed successfully to SAP',

  //VENDOR MANAGEMENT
  VENDOR_APPROVED: 'Are you sure you want to  unblock this classification',
  VENDOR_REJECTED: 'Are you sure you want to  block this classification',
  LPS_RATING_UNBLOCK: 'Are you sure you want to  unblock this LPS rating',
  LPS_RATING_BLOCK: 'Are you sure you want to  block this LPS rating',
  CLASSIFICATION_UNBLOCK_SUCCESSFULLY: 'Classification unblocked successfully',
  CLASSIFICATION_BLOCK_SUCCESSFULLY: 'Classification blocked successfully',
  LPSRATING_BLOCKED_SUCCESSFULLY: 'LPS Rating blocked successfully',
  LPSRATING_UNBLOCKED_SUCCESSFULLY: 'LPS Rating unblocked successfully',

}
export const AttachmentValidationInfo = (props) => {
  const { customClass } = props;
  const message = <div className="text-start">
    <p><strong>Multiple Extensions or Special Characters</strong></p>
    <p>File names should not include multiple extensions or special characters or spaces (e.g.: file.tar.gz, my!file.png, my file.png). Use a simple and valid file name.</p>

    <p><strong>Unsupported File Extensions</strong></p>
    <p>Supported file formats include: PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG, and GIF. Files in other formats are not allowed.</p>
  </div>
  return <>
    <TooltipCustom id="attachment-tooltip" width="400px" customClass={`${customClass} mt-1`} tooltipText={message} />
  </>
}

