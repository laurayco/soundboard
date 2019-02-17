import * as React from "react";
import { Route } from 'react-router-dom';
import Home from "./components/home";
import BoardComponent from "./components/board";

export default <React.Fragment>
    <Route exact path="/" component={Home}/>
    <Route path="/board/:slug" component={BoardComponent} />
</React.Fragment>;