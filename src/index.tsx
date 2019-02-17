import * as React from "react";
import { render } from "react-dom";
import DBM, { Context } from "./data";
import * as Models from "./data/models";
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Routes from "./routes";

import "./style.css";

export const init = async () => {
    const api = new DBM();
    const app = <Router>
        <Context.Provider value={api}>
            {Routes}
        </Context.Provider>
    </Router>;
    const mount_point = document.createElement("div");
    document.body.appendChild(mount_point);
    await new Promise(resolve=>render(app, mount_point,resolve));
};

init();