import React from 'react'
import { Route } from 'react-router-dom'
import CostingForm from './components/index'
import AuthMiddleware from '../../AuthMiddleware'
import { SHEET_METAL } from '../../config/constants'
import ApprovalSummary from './components/ApprovalSummary'
import ApprovalListing from './components/ApprovalListing'

const CostingRoutes = ({ match }) => (
  <div className="app-wrapper">
    <Route path={`/`} component={AuthMiddleware(CostingForm, SHEET_METAL)} />
   
  </div>
)

export default CostingRoutes
