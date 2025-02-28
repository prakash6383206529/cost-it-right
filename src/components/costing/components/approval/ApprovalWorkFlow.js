import DayTime from '../../../common/DayTimeWrapper'
import React, { useCallback, useEffect, useState } from 'react'
import { APPROVED, REJECTED, PENDING, RETURNED } from '../../../../config/constants'
import { useDispatch, useSelector } from 'react-redux'
import Popup from 'reactjs-popup'
import { getAllApproverList } from '../../../../actions/auth/AuthActions'
import LoaderCustom from '../../../common/LoaderCustom'

function ApprovalWorkFlow(props) {
  const { approvalLevelStep, approverData } = props
  const { initialConfiguration } = useSelector(state => state.auth)
  const [approverList, setApproverList] = useState([])
  const [loading, setLoading] = useState(true) // Set loading to true by default, will be set to false after the data is fetched [set setLoading]
  // const [approval, setApproval] = useState([])
  const dispatch = useDispatch()
  useEffect(() => {
    if (initialConfiguration?.IsMultipleUserAllowForApproval && approverData && approverData?.processId) {
      let data = {
        processId: approverData?.processId,
        levelId: approverData?.levelId,
        mode: approverData?.mode
      }
      dispatch(getAllApproverList(data, res => {
        if (res && res?.data) {
          setApproverList(res?.data?.DataList)
        }
        setLoading(false)  // Set loading to false after the data is fetched
      }))
    } else {
      setLoading(false)  // Set loading to false if no data is to be fetched
    }
  }, [approverData])
  const approverListUI = () => {
    switch (approverList?.length) {
      case 0:
        return ''
      case 1:
        return approverList[0].UserName;
      default:
        return <>
          {approverList[0].UserName},<Popup trigger={<button id={`popUpTriggerProfit`} className="view-btn pl-1" type={'button'}><p>+{approverList.length - 1}</p></button>}
            position="bottom center">
            <ul className="px-1 view-all-list">
              {approverList && approverList.map((item, index) => {
                if (index === 0) return false
                return <li key={item?.UserId}> {item?.UserName}</li>
              })}
            </ul>
          </Popup>
        </>
    }
  }
  if (loading) {
    return <LoaderCustom />  // Display a loader while fetching data
  }
  if (!approvalLevelStep || !props.approvalNo || !approverData) {
    return null;
  }
  const extraCount = approvalLevelStep && approvalLevelStep.length > 4 ? approvalLevelStep.length - 4 : 0
  /* TODO SORTING OF LEVEL ACC TO DATA*/
  return approvalLevelStep &&
    <div className="row process workflow-row">
      {/* <div className="col-lg-3 col-md-6 col-sm-12 ">
        <div className="card-border card-green">
          <div className="top d-flex">
            <div className="left text-center">
              <b>{createdByDetail.FlowStepSequence ? createdByDetail.FlowStepSequence : 0}</b>
              <span className="d-block">Level</span>
            </div>
            <div className="right">
              <span className="">{createdByDetail.Title}</span>
              <p className="">{createdByDetail.ApprovedBy ? createdByDetail.ApprovedBy : '-'}</p>
            </div>
          </div>
          {/* top */}
      {/* <div className="bottom">
            <div className="d-flex mb-3">
              <span className="small-grey-text left">Date:</span>
              <span className=" right">{createdByDetail.Date ? createdByDetail.Date : '-'}</span>
            </div>
            <div className="d-flex">
              <span className="small-grey-text left">Remark:</span>
              <span className=" right">{createdByDetail.Remark ? createdByDetail.Remark : '-'}</span>
            </div>
          </div>         
        </div>
      </div> */}
      {approvalLevelStep &&
        approvalLevelStep.map((item, index) => {
          if (index > 3) return false
          return (
            <>
              <div key={index} className="col-lg-3 col-md-6 col-sm-12 mb-4">
                <div className={`card-border  ${(item?.Title?.split(' ')[0] === REJECTED || item?.Status === RETURNED) ? 'card-red' : item?.Title?.split(' ')[0] === APPROVED ? 'card-green' : item?.Status === PENDING ? 'card-yellow' : ''}`}>
                  <div className="top d-flex">
                    <div className="left text-center">
                      <b>{item?.Level ? item?.Level?.split('-')[1] : 0}</b>
                      <span className="d-block">Level</span>
                    </div>
                    <div className="right">
                      <span className="">{item?.Title}</span>
                      <p className="" title={(item?.ApprovedBy && item?.ApprovedBy !== '-') ? item?.ApprovedBy : '-'}>{(item?.ApprovedBy && item?.ApprovedBy !== '-') ? item?.ApprovedBy : initialConfiguration?.IsMultipleUserAllowForApproval ? approverListUI() : '-'}</p>
                    </div>
                  </div>
                  {/* top */}
                  <div className="bottom">
                    <div className="d-flex mb-1">
                      <span className="small-grey-text left">Date:</span>
                      <span className=" right">{item?.Date ? DayTime(item?.Date).format('DD/MM/YYYY') : '-'}</span>
                    </div>
                    <div className="d-flex">
                      <span className="small-grey-text left">Remark:</span>
                      <span className=" right  remark-wrapper" title={item?.Comments}>{item?.Comments ? item?.Comments : '-'}</span>
                    </div>
                  </div>
                  {/* bottom */}
                </div>
              </div>
            </>
          )
        })}
      {extraCount > 0 && <div className="extra-approver" onClick={() => props.viewAll ? props.viewAll() : null}>
        <p>+{extraCount}</p>
      </div>}
    </div> /*row*/

}

export default ApprovalWorkFlow
