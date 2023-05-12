import React, { Component } from 'react';
import { Route } from 'react-router';
import { Layout } from './pages/Layout';
import { Home } from './pages/Home';
import { SetupTest } from './pages/SetupTest';
import { MonitorTest } from './pages/MonitorTest';
import  About  from './pages/About';
import AuthorizeRoute from './pages/api-authorization/AuthorizeRoute';
import ApiAuthorizationRoutes from './pages/api-authorization/ApiAuthorizationRoutes';
import { ApplicationPaths } from './pages/api-authorization/ApiAuthorizationConstants';
import { VisualizeReport } from './pages/VisualizeReport';
import Flow from './pages/Rflow';
import Flow2 from './pages/Rflow2';

import Rflow3 from './pages/Rflow3';
import Rflow4 from './pages/Rflow4';

import './custom.css'
import Rflow5 from './pages/Rflow5';


export default class App extends Component {
  static displayName = App.name;

  render () {
    return (
      <Layout>
        <Route exact path='/' component={Home} />
            <AuthorizeRoute exact path='/setupTest' component={SetupTest} />
            <AuthorizeRoute exact path='/monitorTests' component={MonitorTest} />
            <AuthorizeRoute exact path='/monitorTests/report/:apiId' component={VisualizeReport} />
            <Route path={ApplicationPaths.ApiAuthorizationPrefix} component={ApiAuthorizationRoutes} />
            <Route exact path='/about' component={About} />
            <Route exact path='/rflow' component={Flow} />
            <Route exact path='/rflow2' component={Flow2} />
            <Route exact path='/rflow3' component={Rflow3} />
            <Route exact path='/rflow4' component={Rflow4} />
            <Route exact path='/rflow5' component={Rflow5} />
      </Layout>
    );
  }
}
