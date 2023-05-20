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
            <Route exact path='/rflow5' component={Rflow5} />
      </Layout>
    );
  }
}
