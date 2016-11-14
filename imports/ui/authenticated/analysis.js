/**
 * Created by lucas on 10/5/16.
 */
import './analysis.html';
import 'jquery-ui';
import { Terms } from '../../api/terms/terms';

const MAX_COLS = 2;

let template;

Template.analysis.onCreated(() => {

    template = Template.instance();

    template.shouldShowChartOptions = new ReactiveVar(false);

    return;
    try {
        if(!dataSet) {
            FlowRouter.go('loader');
        }
    }
    catch (e) {
        FlowRouter.go('loader');
    }

});

Template.analysis.helpers({
    columns() {
        return dataSet.header.map((name, idx) => {
            return { name, idx };
        });
    }
});

Template.analysis.events({
    'change input[type="checkbox"]': () => {

        // selected checkbox
        let selected = $('input[type="checkbox"]:checked');

        // if reached MAX_COLS, disabled other checkboxes
        if(selected.length === MAX_COLS) {

            let notSelected = $('input[type="checkbox"]:not(:checked)');

            notSelected.prop('disabled', true);
        }
        // enable all checkboxes
        else if(selected.length < MAX_COLS){

            $('input[type="checkbox"]').prop('disabled', false);
        }
        else {
            alert("IT'S NOT POSSIBLE TO CONTINUE FROM HERE");
            navigator.reload();
        }
    },
    'submit form#chat' (evt) {

        evt.preventDefault();

        let $chatMsg = $('#chat-msg'),
            msg = $chatMsg.val().trim();

        $chatMsg.val('');

        if(msg === "clear") {
            $chatMsg.find('p').remove();
        }

        addToChat(msg, true);

        Meteor.call('chat.handleInputMsg', msg, (err, result) => {

            if(err) {
                Bert.alert(err.reason, 'danger');
                return;
            }

            if(result.operation === 'msg') {

                addToChat(result.msg, false, result.type);

                template.shouldShowChartOptions.set(false);
            }
            else if(result.operation === 'shouldShowChartOptions'){

                template.shouldShowChartOptions.set(true);

                // build chart options
                let chartOptions = "";

                if(result.chartOptions && result.chartOptions.length > 0 ) {
                    //show chart options
                    chartOptions = result.chartOptions.map((chart, i) => {
                        return '\t' + i + ' - ' + chart;
                    });

                    addToChat('Available options, choose one from below:\n' + chartOptions.join('\n'), false, 'info');
                }
                else {
                    addToChat('No available chart at this moment!', false, 'danger');
                }
            }

        });
    }
});

const scrollChat = function scrollChat (chat) {

    (chat).stop().animate({
        scrollTop: $(chat)[0].scrollHeight
    }, 800);

};

const addToChat = function addToChat (text, isClient, type) {

    let $chat = $('.result'),
        p = $('<p>'),
        $p = $(p),
        span = $('<span>').text(text),
        $span = $(span);

    $p.addClass( (isClient) ? 'client' : 'server');

    if(type !== undefined && type !== null && type !== "") {
        $span.addClass('alert').addClass('alert-' + type);
    }

    $p.append($span);

    $chat.append($p);

    scrollChat($chat);

};