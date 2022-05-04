import React from 'react'
import { Route } from 'react-router-dom'
import CostingForm from './components/index'
import AuthMiddleware from '../../AuthMiddleware'
import { COSTING_DETAIL } from '../../config/constants';
import CalculatorWrapper from '../common/Calculator/CalculatorWrapper';


const CostingRoutes = ({ match }) => (
  <div className="app-wrapper">
    <CalculatorWrapper />
    <Route path={`/`} component={AuthMiddleware(CostingForm, COSTING_DETAIL)} />
  </div>
)

export default CostingRoutes
