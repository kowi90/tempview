import React, { useState } from 'react';

function Router({routes, defaultRoute}) {

    const [currentRoute, setCurrentRoute] = useState(defaultRoute);

    return React.createElement(routes[currentRoute], {setCurrentRoute});
}

export default Router;
