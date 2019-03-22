import * as request from 'request';

class Course {
    pair: string;
    price: number;
    sources: Source[];

    constructor(pair) {
        this.pair = pair;
        this.price = 0;
        this.sources = [];
    }

    public setPrice(price: number) {
        this.price = price;
        console.log(`set price ${this.pair} - ${this.price}`);
    }

    public setSource(source: Source) {
        let sourceArr: Source[] = this.sources.filter(s => {
            return s.sourceName === source.sourceName;
        });
        let sourceObj: Source = sourceArr[0];
        if (sourceObj) {
            sourceObj.sourcePrice = source.sourcePrice;
        } else {
            this.sources.push(source);
        }
    }
}

class Source {
    sourceName: string;
    sourcePrice: string;

    constructor(sourceName, sourcePrice) {
        this.sourceName = sourceName;
        this.sourcePrice = sourcePrice;
    }
}

const currencyCourseMap = {};

const currencyCourseConfig = [
    {
        enable: true,
        currencyOne: 'ETH',
        currencyTwo: 'BTC',
        updateHitbtc: (config, externalSourceData) => {
console.log(externalSourceData);
            debugger
            const externalDataArr = externalSourceData.filter(d => {
                return d.id == `${config.currencyOne}${config.currencyTwo}`
            });
            const externalDataObj = externalDataArr[0];
            //
            // "takeLiquidityRate": "0.002",
            // "provideLiquidityRate": "0.001",
            const courseValue = externalDataObj.provideLiquidityRate;
            const pairName = `${config.currencyOne}/${config.currencyTwo}`;
            const courseObj: Course = currencyCourseMap[pairName];
            courseObj.setPrice(courseValue);
            courseObj.setSource(new Source('hitbtc', courseValue));

            const revertCourseValue = 1 / courseValue;
            const revertPairName = `${config.currencyTwo}/${config.currencyOne}`;
            const revertCourseObj: Course = currencyCourseMap[revertPairName];
            revertCourseObj.setPrice(revertCourseValue);
            revertCourseObj.setSource(new Source('hitbtc', revertCourseValue));
        }
    }
];

export const init = (updateInterval = 1000) => {
    const hitbtcUpdaters = [];

    currencyCourseConfig.forEach((config) => {
        if (config.enable) {
            const pairName = config.currencyOne + '/' + config.currencyTwo;
            const revertPairName = config.currencyTwo + '/' + config.currencyOne;
            currencyCourseMap[pairName] = new Course(pairName);
            currencyCourseMap[revertPairName] = new Course(revertPairName);

            if (config.updateHitbtc) {
                const hitbtcUpdater = ((config) =>
                    (externalSourceData) =>
                        config.updateHitbtc(config, externalSourceData))(config);

                hitbtcUpdaters.push(hitbtcUpdater);
            }
        }
    });

    const watchHitbtc = () => {
        request('https://api.hitbtc.com/api/2/public/symbol', (error, response, body) => {
                // console.log(response);

                if (response && body) {
                    hitbtcUpdaters.forEach(hU => {
                        hU(JSON.parse(body))
                    });
                }
            }
        );
    };

    watchHitbtc();

    const runWatchers = () => {
        watchHitbtc();
    };

    setInterval(runWatchers, updateInterval)
};

export const getCurrencyCourseData = (from, to) => {
    const getObj = currencyCourseMap[from + '/' + to];
    if (getObj) {
        return getObj
    }
    return '404';
};
