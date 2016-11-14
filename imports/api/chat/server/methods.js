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

const fuzzy = require('./fuzzy');

let terms = Terms.find().fetch();

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
                    let term = Terms.findOne({term: new RegExp(word, 'i')}),
                        chartOptions = [];

                    if(term.charts && term.charts.length > 0) {

                        chartOptions = term.charts;
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