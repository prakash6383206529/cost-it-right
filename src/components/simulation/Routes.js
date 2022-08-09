import React from 'react'
import { Route } from 'react-router-dom'
import AuthMiddleware from '../../AuthMiddleware'
import { Simulation_Page } from '../../config/constants';
import CalculatorWrapper from '../common/Calculator/CalculatorWrapper';
import SimulationForm from './components/index';

const SimulationRoutes = ({ match }) => (
    <div className="app-wrapper">
        <CalculatorWrapper />
        <Route path={`/`} component={AuthMiddleware(SimulationForm, Simulation_Page)} />
    </div>
)
export default SimulationRoutes