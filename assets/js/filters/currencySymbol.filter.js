module.exports = CurrencySymbol;

CurrencySymbol.$inject = [];

function CurrencySymbol() {
    
    var currencies = [
        {'currency': 'USD', 'symbol': '$'},
        {'currency': 'GBP', 'symbol': '£'},
        {'currency': 'EUR', 'symbol': '€'},
        {'currency': 'AUD', 'symbol': '$'},
        {'currency': 'SGD', 'symbol': '$'},
        {'currency': 'SEK', 'symbol': 'kr'},
        {'currency': 'DKK', 'symbol': 'DKK'},
        {'currency': 'MXN', 'symbol': '$'},
        {'currency': 'BRL', 'symbol': 'R$'},
        {'currency': 'MYR', 'symbol': 'RM'},
        {'currency': 'PHP', 'symbol': 'P'},
        {'currency': 'CHF', 'symbol': '€'},
        {'currency': 'INR', 'symbol': '₹'},
        {'currency': 'ARS', 'symbol': '$'},
        {'currency': 'CAD', 'symbol': '$'},
        {'currency': 'CNY', 'symbol': '¥'},
        {'currency': 'CZK', 'symbol': 'Kč'},
        {'currency': 'HKD', 'symbol': '$'},
        {'currency': 'HUF', 'symbol': 'Ft'},
        {'currency': 'IDR', 'symbol': 'Rp'},
        {'currency': 'ILS', 'symbol': '₪'},
        {'currency': 'JPY', 'symbol': '¥'},
        {'currency': 'KRW', 'symbol': '₩'},
        {'currency': 'NOK', 'symbol': 'kr'},
        {'currency': 'NZD', 'symbol': '$'},
        {'currency': 'PLN', 'symbol': 'zł'},
        {'currency': 'RUB', 'symbol': 'p'},
        {'currency': 'THB', 'symbol': '฿'},
        {'currency': 'TRY', 'symbol': '₺'},
        {'currency': 'TWD', 'symbol': '$'},
        {'currency': 'VND', 'symbol': '₫'},
        {'currency': 'ZAR', 'symbol': 'R'}
    ];
    
    /**
     * 
     * @param {type} _currency
     * @returns {currency}
     */
    return function(_currency){
        if(!_currency) return;
        var symbol = '$';
        for(var i = 0; i < currencies.length; i++) {
            if(currencies[i].currency === _currency) symbol = currencies[i].symbol;
        }
        return symbol;
    };
}