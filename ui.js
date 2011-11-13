$(function() {
    var zero = $("#ZERO");
    var tetris_title = $("#TETRIS");
    var tetris = $("#tetris")
    var instructions = $("#instructions");

    $("#levelup, #ZERO, #TETRIS, #instructions").css("display", "none");
    $("#congratulations, #pause, #gameover").css("display", "none");

    zero.css({
        "position" : "absolute",
        "top"      : tetris.offset().top  - zero.height() + "px",
        "left"     : tetris.offset().left - zero.width() - 10 + "px",
    });

    tetris_title.css({
        "position" : "absolute",
        "top"      : tetris.offset().top + "px",
        "left"     : tetris.offset().left - tetris_title.width() - 10 + "px",
    });

    instructions.css({
        "position" : "absolute",
        "top"      : tetris.offset().top +  
            tetris.height() - instructions.height() + "px",
        "left"     : tetris.offset().left - instructions.width() - 40 + "px",
    });

    zero.fadeIn("slow");
    tetris_title.fadeIn("slow");
    instructions.fadeIn("slow");

    $("#congratulations>button.yes").bind("click", hideCongratulations);
    $("#gameover>button.yes").bind("click", hideGameover);
});

function showLevelup() {
    var levelup = $("#levelup");
    var tetris = $("#tetris");

    var top = tetris.offset().top + 150 + "px";
    var left = tetris.offset().left + 
        tetris.width()/2 - levelup.width()/2 + "px";
    levelup.css({
        "position" : "absolute",
        "top"      : top,
        "left"     : left,
    });

    levelup.fadeIn("slow");
}

function hideLevelup() {
    $("#levelup").fadeOut("slow");
}

function showCongratulations() {
    var cong = $("#congratulations");
    var tetris = $("#tetris");
    var offset = tetris.offset();
    
    cong.css({
        "position" : "absolute",
        "top"      : offset.top + 150 + "px",
        "left"     : offset.left + tetris.width()/2 - cong.width()/2 + "px",
    });
    
    cong.slideDown("slow");
    STATE = PAUSE;
}

function hideCongratulations() {
    $("#congratulations").hide("slow");
    STATE = RUNNING;
    restart();
}

function showGameover() {
    var gameover = $("#gameover");
    var tetris = $("#tetris");
    var offset = tetris.offset();
    
    gameover.css({
        "position" : "absolute",
        "top"      : offset.top + 150 + "px",
        "left"     : offset.left + tetris.width()/2 - gameover.width()/2 + "px",
    });
    
    gameover.slideDown("slow");
    STATE = PAUSE;
}

function hideGameover() {
    $("#gameover").hide("slow");
    STATE = RUNNING;
    restart();
}

function showPause() {
    var pause = $("#pause");
    var tetris = $("#tetris");
    var offset = tetris.offset();
    
    pause.css({
        "position" : "absolute",
        "top"      : offset.top + 150 + "px",
        "left"     : offset.left + tetris.width()/2 - pause.width()/2 + "px",
    });
    
    pause.fadeIn("slow");
}

function hidePause() {
    $("#pause").fadeOut("slow");
}
