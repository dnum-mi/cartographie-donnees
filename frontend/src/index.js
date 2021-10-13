import React from 'react';
import ReactDOM from 'react-dom';
import { ConfigProvider } from 'antd';
import frFr from 'antd/lib/locale/fr_FR';
import moment from 'moment';

import 'antd/dist/antd.css';

import App from './App';

moment.locale('fr');

ReactDOM.render(
    <React.StrictMode>
        <ConfigProvider locale={frFr}>
            <App />
        </ConfigProvider>
    </React.StrictMode>,
    document.getElementById('root')
);

