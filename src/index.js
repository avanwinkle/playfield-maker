import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import PlayfieldMakerApp from './App';
import * as serviceWorker from './serviceWorker';

import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import getMuiTheme from "material-ui/styles/getMuiTheme";
import { grey600, lightBlue600 } from "material-ui/styles/colors";


const muiTheme = getMuiTheme({
  palette: {
    primary1Color: grey600,
    accent1Color: lightBlue600,
  },
  checkbox: {
    checkedColor: lightBlue600,
  },
  radioButton: {
    checkedColor: lightBlue600,
  },
});


const App = () => (
  <MuiThemeProvider muiTheme={muiTheme}>
    <PlayfieldMakerApp />
  </MuiThemeProvider>
);

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
