import React from 'react'
import { Route } from 'react-router-dom'
import CostingForm from './components/index'
import AuthMiddleware from '../../AuthMiddleware'
import { SHEET_METAL } from '../../config/constants';
import CalculatorWrapper from '../common/Calculator/CalculatorWrapper';


const CostingRoutes = ({ match }) => (
  <div className="app-wrapper">
    <CalculatorWrapper />
    <Route path={`/`} component={AuthMiddleware(CostingForm, SHEET_METAL)} />
  </div>
)

export default CostingRoutes
