import React, { useState } from 'react'
import _ from "lodash";
import Button from '../components/layout/Button'
import PopupMsgWrapper from '../components/common/PopupMsgWrapper'
import Toaster from '../components/common/Toaster';
import { bulkDelete } from '../actions/auth/AuthActions';
import { useDispatch, useSelector } from 'react-redux'

function BulkDelete(props) {
	const dispatch = useDispatch()
  const [showPopup, setShowPopup] = useState(false)
  const [popupMessage, setPopupMessage] = useState("")

  const getAssociatedConfig = (type, notEligibleList = [], eligibleToDelete = []) => {
		const mastersList = []
		const eligibleToDeleteIds = []
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
					associatedSuccessMessage: "Raw Materials Deleted Successfully",
					associatedType: "master",
					associatedMasterType: "rm",
					eligibleToDeleteIdsList: eligibleToDeleteIds,
          associatedMessage: _.size(notEligibleList) === 0
            ? "Are you sure you want to delete this raw material detail?"
            : `Are you sure you want to delete this raw material detail? The following raw materials cannot be deleted because they are associated with costings: ${mastersList.join(", ")}`,
        };
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
	
	// EligibleToDeleteIds
	const eligibleToDelete = _.filter(props?.bulkDeleteData, item => _.every(associatedKeyName, key => item?.[key] === false || item?.[key] === null))

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
		const payload = {
  		Type: associatedType,
			MasterType: associatedMasterType,
			GuidList: eligibleToDeleteIdsList,
			MasterIdList: []
		}
				
		dispatch(bulkDelete(payload, (res) => {
			Toaster.success(associatedSuccessMessage)
	  }))
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
      {showPopup && (<PopupMsgWrapper isOpen={showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={popupMessage}/>)}
    </>
  );
}

export default BulkDelete;
