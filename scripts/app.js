const commands = [
    {
        "name": "wipe",
        "command": "wipe 'colour'",
        "description": "Set the whole canvas to the given colour"
    },
    {
        "name": "circle",
        "command": "circle 'x' 'y' 'radius' 'colour'",
        "description": "Draw an unfilled circle with a border of the given colour with the specified co-ordinates and radius"
    },
    {
        "name": "rectangle",
        "command": "rectangle 'x' 'y' 'w' 'h' 'colour'",
        "description": "Draw an unfilled rectangle with a border of the given colour"
    },
    {
        "name": "line",
        "command": "line 'x1' 'y1' 'x2' 'y2' 'colour'",
        "description": "Draw a line with the given colour"
    }
]


let autoComplete = []

const compileAutoCompleteList = function () {
    commands.forEach(function(command) {
        autoComplete.push(command.name)
    });
}

const getCommandList = function (term) {
    term.echo('Usage: command');
    term.echo('Where command is one of:');
    commands.forEach(function(command) {
        term.echo('   ' + command.name);
    });
    term.echo('command -h for specific infomation');
}

const getCommand = function (cmd) {
    return commands.filter(function ( obj ) {
        if (obj.name === cmd) {
            return obj;
        }
    })[0];
}

const getCommandUsage = function (cmd, term) {
    var i = getCommand(cmd);
    if (i) {
        term.echo('Command: ' + i.command);
        term.echo('Description: ' + i.description);
    } 
}

const commandNotFound = function(term) {
    term.echo('Command does not exist');
    term.echo('Here is a list of commands');
    getCommandList(term)
}

const commandFound = function(command, cmd) {
    var parameters = cmd.split(' ').slice(1);
    if (parameters.length > 0) {
        window[command.name](...parameters);
    } else {
        window[command.name]();
    }
}

const displaySuggestions = function (term) {
    var word = term.before_cursor(true);
    var regex = new RegExp('^' + $.terminal.escape_regex(word));
    var matched = [];
    if (word.length > 0) {
        for (var i=autoComplete.length; i--;) {
            if (regex.test(autoComplete[i])) {
                matched.push(autoComplete[i]);
            }
        }
        
        ul.hide();
        for (var i=0; i<matched.length; ++i) {
            $('<li>' + matched[i].replace(regex, '') + '</li>').appendTo(ul);
        }
        ul.show(); 
    }
}

var wipe = function (color='white') {
    var canvas = $('#canvas')[0]
    var context= canvas.getContext('2d');
    context.beginPath();
    context.clearRect(0,0,canvas.width,canvas.height);
    context.rect(0,0,canvas.width,canvas.height);
    context.fillStyle = color;
    context.fill();
}

var canvasLine = function(canvas, color) {
    canvas.closePath();
    canvas.lineWidth = 5;
    canvas.strokeStyle = color;
    canvas.stroke();
}

var circle = function (x=100, y=100, radius=70, color='blue') {
    var canvas = $('#canvas')[0].getContext("2d");
    canvas.beginPath();
    canvas.arc(x, y, radius, 0, Math.PI*2, true); 
    canvasLine(canvas, color);
}

var rectangle = function (x=100, y=100, width=150, height=100, color='blue') {
    var canvas = $('#canvas')[0].getContext("2d");
    canvas.beginPath();
    canvas.rect(x, y, width, height);
    canvasLine(canvas, color);
}

var line = function (x1=10, y1=45, x2=180, y2=47, color='red') {
    var canvas = $('#canvas')[0].getContext("2d");
    canvas.beginPath(); 
    canvas.moveTo(x1,y1);
    canvas.lineTo(x2,y2);
    canvasLine(canvas, color);
}

var resizeCanvas = function() {
    var canvas = $('#canvas')[0];
    var canvasRatio = canvas.height / canvas.width;
    var windowRatio = window.innerHeight / window.innerWidth;
    var width;
    var height;

    if (windowRatio < canvasRatio) {
        height = window.innerHeight;
        width = height / canvasRatio;
    } else {
        width = window.innerWidth;
        height = width * canvasRatio;
    }

    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
};

let ul;
$(function() {

    compileAutoCompleteList();
    resizeCanvas()
  
    $('#terminal').terminal(function(command, term) {
        var cmd = $.terminal.parse_command(command);
        cmd = cmd.command.toLowerCase();
        
        if (cmd === 'h' || cmd === 'help') {
            getCommandList(term)
        }
        if(cmd.match('-h')) {
            getCommandUsage(cmd.split(' ')[0], term)
        }

        command = getCommand(cmd.split(' ')[0])

        if (command) {
            commandFound(command, cmd)
        } else {
            commandNotFound(term)
        }
    }, {
        greetings: 'Canvas Command Interpreter',
        height: 300,
        prompt: '$',
        onInit: function(term) {
            var wrapper = term.cmd().find('.cursor').wrap('<span/>').parent().addClass('cmd-wrapper');
            ul = $('<ul class="word-list"></ul>').appendTo(wrapper);
            ul.on('click', 'li', function() {
                term.insert($(this).text());
                ul.empty();
            });
            term.echo('Type h or help for a list of commands');
            term.echo('Click/tap a word to auto complete');
        },
        keydown: function(e, term) {
            setTimeout(function() {
                ul.empty();
                var name = term.get_command().match(/^([^\s]*)/)[0];
                if (name) {
                   displaySuggestions(term);
                }
            }, 0);
        }
    });
});