import React, { useEffect, useRef, memo, useState } from 'react';

function getTradingViewUrl(symbol) {
  return `https://www.tradingview.com/symbols/${symbol.replace(':', '-')}/`;
}

function isIndianSymbol(symbol) {
  return symbol.startsWith('NSE:') || symbol.startsWith('BSE:');
}

function TradingViewWidget({ symbol = 'BSE:TCS' }) {
  const container = useRef();
  const [widgetFailed, setWidgetFailed] = useState(false);

  useEffect(() => {
    setWidgetFailed(false);
    if (container.current) {
      container.current.innerHTML = '';
    }
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.textContent = `{
      "allow_symbol_change": true,
      "calendar": false,
      "details": false,
      "hide_side_toolbar": true,
      "hide_top_toolbar": false,
      "hide_legend": false,
      "hide_volume": false,
      "hotlist": false,
      "interval": "D",
      "locale": "en",
      "save_image": true,
      "style": "1",
      "symbol": "${symbol}",
      "theme": "dark",
      "timezone": "Etc/UTC",
      "backgroundColor": "#0F0F0F",
      "gridColor": "rgba(242, 242, 242, 0.06)",
      "watchlist": [],
      "withdateranges": false,
      "compareSymbols": [],
      "studies": [],
      "autosize": true
    }`;
    container.current.appendChild(script);

    // Widget load failure detection (timeout)
    const failTimeout = setTimeout(() => {
      // If the widget container is still empty, assume failure
      const widgetDiv = container.current?.querySelector('.tradingview-widget-container__widget');
      if (widgetDiv && widgetDiv.childNodes.length === 0) {
        setWidgetFailed(true);
      }
    }, 3500); // 3.5 seconds

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
      clearTimeout(failTimeout);
    };
  }, [symbol]);

  return (
    <div className="tradingview-widget-container" style={{ height: '100%', width: '100%' }}>
      <div ref={container} style={{ height: '100%', width: '100%' }}>
        <div className="tradingview-widget-container__widget" style={{ height: 'calc(100% - 32px)', width: '100%' }}></div>
        <div className="tradingview-widget-copyright">
          <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">
            <span className="blue-text">Track all markets on TradingView</span>
          </a>
        </div>
      </div>
      {isIndianSymbol(symbol) && (
        <div style={{ marginTop: 8, textAlign: 'center' }}>
          <a href={getTradingViewUrl(symbol)} target="_blank" rel="noopener noreferrer" style={{ color: '#1e90ff', textDecoration: 'underline' }}>
            View {symbol} on TradingView
          </a>
        </div>
      )}
      {widgetFailed && (
        <div style={{ marginTop: 8, textAlign: 'center', color: 'red' }}>
          Chart not available for this symbol. {isIndianSymbol(symbol) ? 'You can view it directly on TradingView.' : ''}
        </div>
      )}
    </div>
  );
}

export default memo(TradingViewWidget);