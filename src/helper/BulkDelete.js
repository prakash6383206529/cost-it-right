import React, { useState } from 'react'
import _ from "lodash";
import Button from '../components/layout/Button'
import PopupMsgWrapper from '../components/common/PopupMsgWrapper'
import Toaster from '../components/common/Toaster';
import { bulkDelete } from '../actions/auth/AuthActions';
import { useDispatch, useSelector } from 'react-redux'
import { useLabels } from './core';

function BulkDelete(props) {
	const dispatch = useDispatch()
	const [showPopup, setShowPopup] = useState(false)
	const [popupMessage, setPopupMessage] = useState("")
	const { vendorLabel } = useLabels()

	const getAssociatedConfig = (type, notEligibleList = [], eligibleToDelete = []) => {
		const mastersList = []
		const eligibleToDeleteIds = []
		const defaultToaster = 'Deleted Successfully'

		const generateAssociatedMessage = () => {
			const hasNotEligible = _.size(notEligibleList) > 0
			const hasEligible = _.size(eligibleToDelete) > 0
			if (!hasNotEligible) {
				return `Are you sure you want to delete the ${type} detail?`;
			}
			if (type === 'Overhead') {
				return `${hasEligible ? `Are you sure you want to delete the ${type} detail? ` : ""} Overheads without a delete icon cannot be deleted as they are associated with costings.`
			}
			return `${hasEligible ? `Are you sure you want to delete the ${type} detail? ` : ""}${mastersList.join(", ")} ${type}(s) cannot be deleted because they are associated with costings.`;
		}

		switch (type) {
			case 'RM':
				if (_.size(notEligibleList)) {
					_.forEach(notEligibleList, item => {
						mastersList.push(_.get(item, 'RawMaterialName', ''))
					})
				}
				if (_.size(eligibleToDelete)) {
					_.forEach(eligibleToDelete, item => {
						eligibleToDeleteIds.push(_.get(item, 'RawMaterialId', ''))
					})
				}
				return {
					associatedKeyName: ["IsRMAssociated", "IsRFQRawMaterial"],
					associatedSuccessMessage: `${type} ${defaultToaster}`,
					associatedType: "master",
					associatedMasterType: "rm",
					eligibleToDeleteIdsList: eligibleToDeleteIds,
					associatedMessage: generateAssociatedMessage()
				}
			case 'BOP':
				if (_.size(notEligibleList)) {
					_.forEach(notEligibleList, item => {
						mastersList.push(_.get(item, 'BoughtOutPartName', ''))
					})
				}
				if (_.size(eligibleToDelete)) {
					_.forEach(eligibleToDelete, item => {
						eligibleToDeleteIds.push(_.get(item, 'BoughtOutPartId', ''))
					})
				}
				return {
					associatedKeyName: ["IsBOPAssociated", "IsRFQBoughtOutPart"],
					associatedSuccessMessage: `${type} ${defaultToaster}`,
					associatedType: "master",
					associatedMasterType: "bop",
					eligibleToDeleteIdsList: eligibleToDeleteIds,
					associatedMessage: generateAssociatedMessage()
				}
			case 'Machine':
				if (_.size(notEligibleList)) {
					_.forEach(notEligibleList, item => {
						mastersList.push(_.get(item, 'MachineNumber', ''))
					})
				}
				if (_.size(eligibleToDelete)) {
					_.forEach(eligibleToDelete, item => {
						eligibleToDeleteIds.push(_.get(item, 'MachineId', ''))
					})
				}
				return {
					associatedKeyName: ["IsMachineAssociated"],
					associatedSuccessMessage: `${type} ${defaultToaster}`,
					associatedType: "master",
					associatedMasterType: "machine",
					eligibleToDeleteIdsList: eligibleToDeleteIds,
					associatedMessage: generateAssociatedMessage()
				}
			case 'Assembly':
			case 'Part':
				if (_.size(notEligibleList)) {
					_.forEach(notEligibleList, item => {
						mastersList.push(_.get(item, 'PartName', ''))
					})
				}
				if (_.size(eligibleToDelete)) {
					_.forEach(eligibleToDelete, item => {
						eligibleToDeleteIds.push(_.get(item, 'PartId', ''))
					})
				}
				return {
					associatedKeyName: ["IsAssociate"],
					associatedSuccessMessage: `${type} ${defaultToaster}`,
					associatedType: "master",
					associatedMasterType: "part",
					eligibleToDeleteIdsList: eligibleToDeleteIds,
					associatedMessage: generateAssociatedMessage()
				}
			case 'Product':
				if (_.size(notEligibleList)) {
					_.forEach(notEligibleList, item => {
						mastersList.push(_.get(item, 'ProductName', ''))
					})
				}
				if (_.size(eligibleToDelete)) {
					_.forEach(eligibleToDelete, item => {
						eligibleToDeleteIds.push(_.get(item, 'ProductId', ''))
					})
				}
				return {
					associatedKeyName: [], //When we keep it blank then all id's eligible to delete
					associatedSuccessMessage: `${type} ${defaultToaster}`,
					associatedType: "master",
					associatedMasterType: "part",
					eligibleToDeleteIdsList: eligibleToDeleteIds,
					associatedMessage: generateAssociatedMessage()
				}
			case 'Part Family':
				if (_.size(notEligibleList)) {
					_.forEach(notEligibleList, item => {
						mastersList.push(_.get(item, 'PartFamilyName', ''))
					})
				}
				if (_.size(eligibleToDelete)) {
					_.forEach(eligibleToDelete, item => {
						eligibleToDeleteIds.push(_.get(item, 'PartFamilyId', ''))
					})
				}
				return {
					associatedKeyName: ['IsAssociated'],
					associatedSuccessMessage: `${type} ${defaultToaster}`,
					associatedType: "master",
					associatedMasterType: "part",
					eligibleToDeleteIdsList: eligibleToDeleteIds,
					associatedMessage: generateAssociatedMessage()
				}
			case vendorLabel:
				if (_.size(notEligibleList)) {
					_.forEach(notEligibleList, item => {
						mastersList.push(_.get(item, 'VendorName', ''))
					})
				}
				if (_.size(eligibleToDelete)) {
					_.forEach(eligibleToDelete, item => {
						eligibleToDeleteIds.push(_.get(item, 'VendorId', ''))
					})
				}
				return {
					associatedKeyName: [], //When we keep it blank then all id's eligible to delete
					associatedSuccessMessage: `${type} ${defaultToaster}`,
					associatedType: "master",
					associatedMasterType: "vendor",
					eligibleToDeleteIdsList: eligibleToDeleteIds,
					associatedMessage: generateAssociatedMessage()
				}
			case 'Customer':
				if (_.size(notEligibleList)) {
					_.forEach(notEligibleList, item => {
						mastersList.push(_.get(item, 'CompanyName', ''))
					})
				}
				if (_.size(eligibleToDelete)) {
					_.forEach(eligibleToDelete, item => {
						eligibleToDeleteIds.push(_.get(item, 'ClientId', ''))
					})
				}
				return {
					associatedKeyName: [], //When we keep it blank then all id's eligible to delete
					associatedSuccessMessage: `${type} ${defaultToaster}`,
					associatedType: "master",
					associatedMasterType: "customer",
					eligibleToDeleteIdsList: eligibleToDeleteIds,
					associatedMessage: generateAssociatedMessage()
				}
			case 'Plant':
				if (_.size(notEligibleList)) {
					_.forEach(notEligibleList, item => {
						mastersList.push(_.get(item, 'PlantName', ''))
					})
				}
				if (_.size(eligibleToDelete)) {
					_.forEach(eligibleToDelete, item => {
						eligibleToDeleteIds.push(_.get(item, 'PlantId', ''))
					})
				}
				return {
					associatedKeyName: ['IsAssociated'],
					associatedSuccessMessage: `${type} ${defaultToaster}`,
					associatedType: "master",
					associatedMasterType: "plant",
					eligibleToDeleteIdsList: eligibleToDeleteIds,
					associatedMessage: generateAssociatedMessage()
				}
			case 'Index Data':
				if (_.size(notEligibleList)) {
					_.forEach(notEligibleList, item => {
						mastersList.push(_.get(item, 'CommodityStandardName', ''))
					})
				}
				if (_.size(eligibleToDelete)) {
					_.forEach(eligibleToDelete, item => {
						eligibleToDeleteIds.push(_.get(item, 'CommodityIndexRateDetailId', ''))
					})
				}
				return {
					associatedKeyName: ['IsAssociated'],
					associatedSuccessMessage: `${type} ${defaultToaster}`,
					associatedType: "master",
					associatedMasterType: "material",
					eligibleToDeleteIdsList: eligibleToDeleteIds,
					associatedMessage: generateAssociatedMessage()
				}
			case 'Commodity Index':
				if (_.size(notEligibleList)) {
					_.forEach(notEligibleList, item => {
						mastersList.push(_.get(item, 'CommodityName', ''))
					})
				}
				if (_.size(eligibleToDelete)) {
					_.forEach(eligibleToDelete, item => {
						eligibleToDeleteIds.push(_.get(item, 'IndexExchangeCommodityLinkingId', ''))
					})
				}
				return {
					associatedKeyName: ['IsAssociated'],
					associatedSuccessMessage: `${type} ${defaultToaster}`,
					associatedType: "master",
					associatedMasterType: "material",
					eligibleToDeleteIdsList: eligibleToDeleteIds,
					associatedMessage: generateAssociatedMessage()
				}
			case 'Commodity Standard':
				if (_.size(notEligibleList)) {
					_.forEach(notEligibleList, item => {
						mastersList.push(_.get(item, 'CommodityStandardName', ''))
					})
				}
				if (_.size(eligibleToDelete)) {
					_.forEach(eligibleToDelete, item => {
						eligibleToDeleteIds.push(_.get(item, 'CommodityStandardId', ''))
					})
				}
				return {
					associatedKeyName: ['IsAssociated'],
					associatedSuccessMessage: `${type} ${defaultToaster}`,
					associatedType: "master",
					associatedMasterType: "material",
					eligibleToDeleteIdsList: eligibleToDeleteIds,
					associatedMessage: generateAssociatedMessage()
				}
			case 'Standardized Commodity':
				if (_.size(notEligibleList)) {
					_.forEach(notEligibleList, item => {
						mastersList.push(_.get(item, 'CommodityStandardName', ''))
					})
				}
				if (_.size(eligibleToDelete)) {
					_.forEach(eligibleToDelete, item => {
						eligibleToDeleteIds.push(_.get(item, 'CommodityStandardizationId', ''))
					})
				}
				return {
					associatedKeyName: ['IsAssociated'],
					associatedSuccessMessage: `${type} ${defaultToaster}`,
					associatedType: "master",
					associatedMasterType: "material",
					eligibleToDeleteIdsList: eligibleToDeleteIds,
					associatedMessage: generateAssociatedMessage()
				}
			case 'Index':
				if (_.size(notEligibleList)) {
					_.forEach(notEligibleList, item => {
						mastersList.push(_.get(item, 'IndexExchangeName', ''))
					})
				}
				if (_.size(eligibleToDelete)) {
					_.forEach(eligibleToDelete, item => {
						eligibleToDeleteIds.push(_.get(item, 'IndexExchangeId', ''))
					})
				}
				return {
					associatedKeyName: ['IsAssociated'],
					associatedSuccessMessage: `${type} ${defaultToaster}`,
					associatedType: "master",
					associatedMasterType: "material",
					eligibleToDeleteIdsList: eligibleToDeleteIds,
					associatedMessage: generateAssociatedMessage()
				}
			case 'Overhead':
				if (_.size(notEligibleList)) {
					_.forEach(notEligibleList, item => {
						mastersList.push(_.get(item, 'OverheadId', ''))
					})
				}
				if (_.size(eligibleToDelete)) {
					_.forEach(eligibleToDelete, item => {
						eligibleToDeleteIds.push(_.get(item, 'OverheadId', ''))
					})
				}
				return {
					associatedKeyName: ['IsOverheadAssociated'],
					associatedSuccessMessage: `${type} ${defaultToaster}`,
					associatedType: "master",
					associatedMasterType: "material",
					eligibleToDeleteIdsList: eligibleToDeleteIds,
					associatedMessage: generateAssociatedMessage()
				}
			default:
				return {
					associatedKeyName: [],
					associatedSuccessMessage: '',
					associatedType: '',
					associatedMasterType: '',
					eligibleToDeleteIdsList: [],
					associatedMessage: "Are you sure you want to delete this item?",
				}
		}
	}

	const { associatedKeyName } = getAssociatedConfig(props?.type)

	// If any key (Example IsRMAssociated or IsRFQRawMaterial) is true, the item is not eligible for deletion and should be filtered out.
	const notEligibleToDelete = _.filter(props?.bulkDeleteData, item => _.some(associatedKeyName, key => item?.[key] === true))

	// EligibleToDeleteIds (Example IsRMAssociated or IsRFQRawMaterial) is false, null, undefined, the item is eligible for deletion and should be filtered out.
	const eligibleToDelete = _.filter(props?.bulkDeleteData, item => _.every(associatedKeyName, key => !Boolean(item?.[key])))

	const openPopup = () => {
		const { associatedMessage } = getAssociatedConfig(props?.type, notEligibleToDelete, eligibleToDelete)
		setPopupMessage(associatedMessage)
		setShowPopup(true)
	}

	const closePopUp = () => {
		setShowPopup(false)
	}

	const onPopupConfirm = () => {
		setShowPopup(false)
		deleteItem()
	}

	const deleteItem = () => {
		const { associatedSuccessMessage, associatedType, associatedMasterType, eligibleToDeleteIdsList } = getAssociatedConfig(props?.type, notEligibleToDelete, eligibleToDelete)
		if (_.size(eligibleToDeleteIdsList)) {
			// Check deleted id's are GUID based or Integer Based
			const isGuidBased = _.isString(_.first(eligibleToDeleteIdsList))
			const payload = {
				Type: associatedType,
				MasterType: associatedMasterType,
				GuidList: isGuidBased ? eligibleToDeleteIdsList : [],
  			MasterIdList: isGuidBased ? [] : eligibleToDeleteIdsList
			}

			dispatch(bulkDelete(payload, (res) => {
				if(res && res?.status === 200) {
					Toaster.success(associatedSuccessMessage)
				} 
				// setTimeout(() => {
				// 		window.location.reload()
				// 	}, 500)
			}))
		}
		setShowPopup(false)
	}

	return (
		<>
			<Button
				title="Delete"
				className="mr-1"
				icon="delete-primary"
				id={`bulk_delete`}
				onClick={openPopup}
				buttonName={props?.dataCount === 0 || props?.deletePermission === false ? "" : `(${props?.dataCount})`}
				disabled={props?.dataCount === 0 || props?.deletePermission === false}
			/>
			{showPopup && (<PopupMsgWrapper isOpen={showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={popupMessage} />)}
		</>
	);
}

export default BulkDelete;