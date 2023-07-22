'use client'

import { ConfigProvider } from "./components/ConfigProvider";
import App from "./app";

// reference: https://react-redux.js.org/tutorials/quick-start#install-redux-toolkit-and-react-redux
import { Provider } from "react-redux";
import { store } from "../store";
// reference end

export default function Page() {
    return (
        <>
            {/* config provider for the config of different views, and provide a reducer */}
            <ConfigProvider>
                <Provider store={store}> {/* // reference: https://react-redux.js.org/tutorials/quick-start#install-redux-toolkit-and-react-redux */}
                    <App />
                </Provider>
            </ConfigProvider>
        </>
    )

}
