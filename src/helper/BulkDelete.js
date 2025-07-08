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

		const extractDeletionData = (param1, param2) => {
			if (_.size(notEligibleList)) {
				_.forEach(notEligibleList, item => {
					mastersList.push(_.get(item, param1, ''))
				})
			}
			if (_.size(eligibleToDelete)) {
				_.forEach(eligibleToDelete, item => {
					eligibleToDeleteIds.push(_.get(item, param2, ''))
				})
			}
		}

		const generateAssociatedMessage = () => {
			const commonMessageMasters = ['Overhead', 'Profits', 'Labour', 'Fuel', 'Power', 'Volume', 'Freight', 'Interest Rate'] 
			const hasNotEligible = _.size(notEligibleList) > 0
			const hasEligible = _.size(eligibleToDelete) > 0
			if (!hasNotEligible) {
				return `Are you sure you want to delete the ${type} detail?`;
			}
			if (_.includes(commonMessageMasters, type)) {
				return `${hasEligible ? `Are you sure you want to delete the ${type} detail? ` : ""} The selected ${type} items without a delete icon cannot be deleted as they are associated with costings.`
			}
			return `${hasEligible ? `Are you sure you want to delete the ${type} detail? ` : ""}${mastersList.join(", ")} ${type}(s) cannot be deleted as they are associated with costings.`;
		}

		switch (type) {
			case 'RM':
				extractDeletionData('RawMaterialName', 'RawMaterialId')
				return {
					associatedKeyName: ["IsRMAssociated", "IsRFQRawMaterial"],
					associatedSuccessMessage: `${type} ${defaultToaster}`,
					associatedType: "master",
					associatedMasterType: "rm",
					eligibleToDeleteIdsList: eligibleToDeleteIds,
					associatedMessage: generateAssociatedMessage()
				}
			case 'BOP':
				extractDeletionData('BoughtOutPartName', 'BoughtOutPartId')
				return {
					associatedKeyName: ["IsBOPAssociated", "IsRFQBoughtOutPart"],
					associatedSuccessMessage: `${type} ${defaultToaster}`,
					associatedType: "master",
					associatedMasterType: "bop",
					eligibleToDeleteIdsList: eligibleToDeleteIds,
					associatedMessage: generateAssociatedMessage()
				}
			case 'Machine':
				extractDeletionData('MachineNumber', 'MachineId')
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
				extractDeletionData('PartName', 'PartId')
				return {
					associatedKeyName: ["IsAssociate"],
					associatedSuccessMessage: `${type} ${defaultToaster}`,
					associatedType: "master",
					associatedMasterType: "part",
					eligibleToDeleteIdsList: eligibleToDeleteIds,
					associatedMessage: generateAssociatedMessage()
				}
			case 'Product':
				extractDeletionData('ProductName', 'ProductId')
				return {
					associatedKeyName: [], //When we keep it blank then all id's eligible to delete
					associatedSuccessMessage: `${type} ${defaultToaster}`,
					associatedType: "master",
					associatedMasterType: "part",
					eligibleToDeleteIdsList: eligibleToDeleteIds,
					associatedMessage: generateAssociatedMessage()
				}
			case 'Part Family':
				extractDeletionData('PartFamilyName', 'PartFamilyId')
				return {
					associatedKeyName: ['IsAssociated'],
					associatedSuccessMessage: `${type} ${defaultToaster}`,
					associatedType: "master",
					associatedMasterType: "part",
					eligibleToDeleteIdsList: eligibleToDeleteIds,
					associatedMessage: generateAssociatedMessage()
				}
			case vendorLabel:
				extractDeletionData('VendorName', 'VendorId')
				return {
					associatedKeyName: [], //When we keep it blank then all id's eligible to delete
					associatedSuccessMessage: `${type} ${defaultToaster}`,
					associatedType: "master",
					associatedMasterType: "vendor",
					eligibleToDeleteIdsList: eligibleToDeleteIds,
					associatedMessage: generateAssociatedMessage()
				}
			case 'Customer':
				extractDeletionData('CompanyName', 'ClientId')
				return {
					associatedKeyName: [], //When we keep it blank then all id's eligible to delete
					associatedSuccessMessage: `${type} ${defaultToaster}`,
					associatedType: "master",
					associatedMasterType: "customer",
					eligibleToDeleteIdsList: eligibleToDeleteIds,
					associatedMessage: generateAssociatedMessage()
				}
			case 'Plant':
				extractDeletionData('PlantName', 'PlantId')
				return {
					associatedKeyName: ['IsAssociated'],
					associatedSuccessMessage: `${type} ${defaultToaster}`,
					associatedType: "master",
					associatedMasterType: "plant",
					eligibleToDeleteIdsList: eligibleToDeleteIds,
					associatedMessage: generateAssociatedMessage()
				}
			case 'Index Data':
				extractDeletionData('CommodityStandardName', 'CommodityIndexRateDetailId')
				return {
					associatedKeyName: ['IsAssociated'],
					associatedSuccessMessage: `${type} ${defaultToaster}`,
					associatedType: "master",
					associatedMasterType: "material",
					eligibleToDeleteIdsList: eligibleToDeleteIds,
					associatedMessage: generateAssociatedMessage()
				}
			case 'Commodity Index':
				extractDeletionData('CommodityName', 'IndexExchangeCommodityLinkingId')
				return {
					associatedKeyName: ['IsAssociated'],
					associatedSuccessMessage: `${type} ${defaultToaster}`,
					associatedType: "master",
					associatedMasterType: "material",
					eligibleToDeleteIdsList: eligibleToDeleteIds,
					associatedMessage: generateAssociatedMessage()
				}
			case 'Commodity Standard':
				extractDeletionData('CommodityStandardName', 'CommodityStandardId')
				return {
					associatedKeyName: ['IsAssociated'],
					associatedSuccessMessage: `${type} ${defaultToaster}`,
					associatedType: "master",
					associatedMasterType: "material",
					eligibleToDeleteIdsList: eligibleToDeleteIds,
					associatedMessage: generateAssociatedMessage()
				}
			case 'Standardized Commodity':
				extractDeletionData('CommodityStandardName', 'CommodityStandardizationId')
				return {
					associatedKeyName: ['IsAssociated'],
					associatedSuccessMessage: `${type} ${defaultToaster}`,
					associatedType: "master",
					associatedMasterType: "material",
					eligibleToDeleteIdsList: eligibleToDeleteIds,
					associatedMessage: generateAssociatedMessage()
				}
			case 'Index':
				extractDeletionData('IndexExchangeName', 'IndexExchangeId')
				return {
					associatedKeyName: ['IsAssociated'],
					associatedSuccessMessage: `${type} ${defaultToaster}`,
					associatedType: "master",
					associatedMasterType: "material",
					eligibleToDeleteIdsList: eligibleToDeleteIds,
					associatedMessage: generateAssociatedMessage()
				}
			case 'Overhead':
				extractDeletionData('OverheadId', 'OverheadId')
				return {
					associatedKeyName: ['IsOverheadAssociated'],
					associatedSuccessMessage: `${type} ${defaultToaster}`,
					associatedType: "master",
					associatedMasterType: "overhead",
					eligibleToDeleteIdsList: eligibleToDeleteIds,
					associatedMessage: generateAssociatedMessage()
				}
			case 'Profits':
				extractDeletionData('ProfitId', 'ProfitId')
				return {
					associatedKeyName: ['IsProfitAssociated'],
					associatedSuccessMessage: `${type} ${defaultToaster}`,
					associatedType: "master",
					associatedMasterType: "profit",
					eligibleToDeleteIdsList: eligibleToDeleteIds,
					associatedMessage: generateAssociatedMessage()
				}
			case 'Labour':
				extractDeletionData('LabourDetailsId', 'LabourDetailsId')
				return {
					associatedKeyName: ['IsLabourAssociated'],
					associatedSuccessMessage: `${type} ${defaultToaster}`,
					associatedType: "master",
					associatedMasterType: "labour",
					eligibleToDeleteIdsList: eligibleToDeleteIds,
					associatedMessage: generateAssociatedMessage()
				}
			case 'Operation':
				extractDeletionData('OperationCode', 'OperationId')
				return {
					associatedKeyName: ['IsOperationAssociated'],
					associatedSuccessMessage: `${type} ${defaultToaster}`,
					associatedType: "master",
					associatedMasterType: "operation",
					eligibleToDeleteIdsList: eligibleToDeleteIds,
					associatedMessage: generateAssociatedMessage()
				}
			case 'Fuel':
				extractDeletionData('FuelDetailId', 'FuelDetailId')
				return {
					associatedKeyName: ['IsAssociated'],
					associatedSuccessMessage: `${type} ${defaultToaster}`,
					associatedType: "master",
					associatedMasterType: "fuel",
					eligibleToDeleteIdsList: eligibleToDeleteIds,
					associatedMessage: generateAssociatedMessage()
				}
			case 'Power':
				extractDeletionData('PowerId', 'PowerId')
				return {
					associatedKeyName: ['IsAssociated'],
					associatedSuccessMessage: `${type} ${defaultToaster}`,
					associatedType: "master",
					associatedMasterType: "power",
					eligibleToDeleteIdsList: eligibleToDeleteIds,
					associatedMessage: generateAssociatedMessage()
				}
			case 'Volume':
				extractDeletionData('VolumeId', 'VolumeId')
				return {
					associatedKeyName: [],
					associatedSuccessMessage: `${type} ${defaultToaster}`,
					associatedType: "master",
					associatedMasterType: "volume",
					eligibleToDeleteIdsList: eligibleToDeleteIds,
					associatedMessage: generateAssociatedMessage()
				}
			case 'Exchange Rate':
				extractDeletionData('ExchangeRateId', 'ExchangeRateId')
				return {
					associatedKeyName: [],
					associatedSuccessMessage: `${type} ${defaultToaster}`,
					associatedType: "master",
					associatedMasterType: "exchangeRate",
					eligibleToDeleteIdsList: eligibleToDeleteIds,
					associatedMessage: generateAssociatedMessage()
				}
			case 'Freight':
				extractDeletionData('FreightId', 'FreightId')
				return {
					associatedKeyName: ['IsFreightAssociated'],
					associatedSuccessMessage: `${type} ${defaultToaster}`,
					associatedType: "master",
					associatedMasterType: "freight",
					eligibleToDeleteIdsList: eligibleToDeleteIds,
					associatedMessage: generateAssociatedMessage()
				}
			case 'Interest Rate':
				extractDeletionData('VendorInterestRateId', 'VendorInterestRateId')
				return {
					associatedKeyName: ['IsAssociated'],
					associatedSuccessMessage: `${type} ${defaultToaster}`,
					associatedType: "master",
					associatedMasterType: "interestRate",
					eligibleToDeleteIdsList: eligibleToDeleteIds,
					associatedMessage: generateAssociatedMessage()
				}
			case 'Payment Terms':
				extractDeletionData('VendorInterestRateId', 'VendorInterestRateId')
				return {
					associatedKeyName: ['IsAssociated'],
					associatedSuccessMessage: `${type} ${defaultToaster}`,
					associatedType: "master",
					associatedMasterType: "interestRate",
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