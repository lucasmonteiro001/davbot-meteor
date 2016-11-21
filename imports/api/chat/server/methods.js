/**
 * Created by lucas on 10/17/16.
 */
import { Meteor } from 'meteor/meteor';
import { Terms } from '../../../api/terms/terms';

const SCORE = 0.6;

const RETURN_CODES = {
    success: "success",
    warning: "warning",
    error: "danger",
    info: "info"
};

const INT = "integer",
    STRING = "string",
    DATE = "Date",
    REAL = "real",
    SCATTERPLOT = "scatter-plot",
    LINECHART = "line-chart",
    VERTICALBARCHART = "vertical-bar-chart",
    HORIZONTALBARCHART = "horizontal-bar-chart",
    AREACHART = "area-chart",
    BARCHART = "bar-chart",
    PIECHART = "pie-chart";

const CHARTS = {

    [SCATTERPLOT]: [
        [INT, INT], [INT, REAL], [REAL, INT], [REAL, REAL]
    ],
    [LINECHART]: [
        [STRING, INT], [STRING, REAL], [DATE, INT], [DATE, REAL], [INT, INT], [INT, REAL]
    ],
    [VERTICALBARCHART]: [
        [STRING, INT], [STRING, REAL], [DATE, INT], [DATE, REAL], [INT, INT], [INT, REAL]
    ],
    [HORIZONTALBARCHART]: [
        [STRING, INT], [STRING, REAL], [DATE, INT], [DATE, REAL], [INT, INT], [INT, REAL]
    ],
    [PIECHART]: [
        [INT, REAL], [STRING, REAL], [DATE, INT], [DATE, REAL], [INT, INT]
    ]
};

const fuzzy = require('./fuzzy');

const f = (term, charts) => {
    return {term, charts};
};

//FIXME aquisicao de termos eh estatica
// let terms = Terms.find().fetch();
let terms = [];

terms.push(f("correlation", [SCATTERPLOT]));
terms.push(f("deviation", [LINECHART]));
terms.push(f("distribution", [LINECHART, VERTICALBARCHART]));
terms.push(f("ranking", [HORIZONTALBARCHART]));
terms.push(f("time series", [LINECHART, VERTICALBARCHART, AREACHART]));
terms.push(f("part-to-whole", [PIECHART, VERTICALBARCHART]));
terms.push(f("test", []));

if(terms && terms.length > 0) {

    terms.map(term => {
        fuzzy.fuzzy.add(term.term)
    });
}

Meteor.methods({
    'chat.handleInputMsg' (msg) {

        msg = msg.trim();

        let wordMatch = fuzzy.getWordGreaterThan(msg);

        if(wordMatch) {

            let score = wordMatch.score,
                word = wordMatch.word;

            if(score >= SCORE) {

                if(score === 1) {

                    // get word from database and discover if it has any associated chart
                    // FIXME
                    // let term = Terms.findOne({term: new RegExp(word, 'i')}),
                    let chartOptions = [];

                    // procura pelo termo na lista de termos
                    let result = terms.filter(term => word.match(new RegExp(term.term, "i")));

                    if(result.length >= 0) {

                        result = result[0];

                        // se o termo possui graficos listados, retorna-os
                        if(result.charts && result.charts.length > 0) {

                            chartOptions = result.charts;
                        }
                    }

                    return {operation: "shouldShowChartOptions", chartOptions};
                }
                else {
                    return formatMessage(RETURN_CODES.warning, 'Did you mean:\n\t\t - ' + word);
                }
            }
            else {

                return formatMessage(RETURN_CODES.error, 'No word found!');
            }
        }
        else {

        }


        return formatMessage(RETURN_CODES.error, 'No word found!');

    },
    'chat.existsChart' (name) {

        if(!CHARTS[name]) {
            Meteor.error('Chart does not exist!');
            return;
        }

        return CHARTS[name];

    }

});

const formatMessage =  function formatMessage (type, msg, result) {

    let operation = "msg";

    return {operation, type, msg, result};

};

const proceed = function proceed (word) {

    // check if word exists
    // get synonymous if word  does not exist in database
    // get possible visualizations
    // suggest them
};