import { useEffect } from 'react';
import { Route, Switch } from 'react-router';
import './App.css';
import RCLReact from './ros/rclreact';
import DashboardPage from './page/dashBoard/DashBoard';

function App() {

  useEffect(() => {
    const rclReact: RCLReact = new RCLReact();
    rclReact.rclReactInit();
  }, []);

  return (
    <div className="App">
      <Switch>
        <Route exact path={'/'} component={DashboardPage} />
      </Switch>
    </div>
  );
}

export default App;
