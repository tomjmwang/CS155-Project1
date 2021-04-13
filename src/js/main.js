let question_set_1 = ["When have you felt most powerful?", "What brings out the best in you?", "If there was one more hour in the day, what would you spend it on?"];
let question_set_2 = ["What is one thing about yourself that you wish you could change?", "What makes you the happiest? Why?", "What is one thing in your life you wish you could change?"];
let question_set_3 = ["Who do you most envy and why?", "What makes you sad and why?", "What do you most regret?"];

//all the questions for each round
let total_questions = [];
//questions that are voted as yes
let final_deck = [];

function start_game(){
    $("#game_setting").css("display", "none");
    $("#game").css("display", "block");
    let player_num = parseInt($("#player_num").prop("value"));
    let type_1 = parseInt($("#type_1_num").prop("value"));
    let type_2 = parseInt($("#type_1_num").prop("value"));
    let type_3 = parseInt($("#type_1_num").prop("value"));
    let type_1_questions = _.sample(question_set_1, type_1);
    let type_2_questions = _.sample(question_set_2, type_2);
    let type_3_questions = _.sample(question_set_3, type_3);
    let new_arr = $.merge(type_1_questions, type_2_questions);
    total_questions = _.shuffle($.merge(new_arr, type_3_questions));

    let question = total_questions.pop();
    $("#question_text").html(question);
}

function reset_game(){
    $("#game_setting").css("display", "block");
    $("#game").css("display", "none");
    total_questions = [];
    final_deck = [];
}

function accept(){
    final_deck.push($("#question_text").html());
    reload_current_cards();
    next_turn();
}

function next_turn(){
    if(total_questions.length == 0){
        $("#message").html("Game ends!");
    }
    else{
        let question = total_questions.pop();
        $("#question_text").html(question);
    }
}

function reload_current_cards(){
    htmlstr = "<ul>";
    for(let i = 0; i < final_deck.length; i++){
        htmlstr += "<li>" + final_deck[i] + "</li>";
    }
    htmlstr += "</ul>";
    $("#current_cards").html(htmlstr);
}

