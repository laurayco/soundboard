import * as React from "react";
import { Route } from 'react-router-dom';
import Home from "./components/home";

export default <React.Fragment>
    <Route exact path="/" component={Home}/>
</React.Fragment>;