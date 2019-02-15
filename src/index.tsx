import * as React from "react";
import { render } from "react-dom";

import "./style.css";

export const init = async () => {
    const app = <strong>greetings</strong>;
    const mount_point = document.createElement("div");
    document.body.appendChild(mount_point);
    await new Promise(resolve=>render(app, mount_point,resolve));
};

init();