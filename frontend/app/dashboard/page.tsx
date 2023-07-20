'use client'

import { ConfigProvider } from "./components/ConfigProvider";
import App from "./app";

export default function Page() {
    return (
        <>
            {/* config provider for the config of different views, and provide a reducer */}
            <ConfigProvider>
                <App />
            </ConfigProvider>
        </>
    )

}
